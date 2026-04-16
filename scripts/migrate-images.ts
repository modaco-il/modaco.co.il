/**
 * Migrate external product images → Supabase Storage.
 *
 * Idempotent + resumable: rows already hosted on our Supabase URL are skipped.
 * Path scheme: `{productId}/{imageId}.{ext}` — stable, collision-free.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "product-images";
const CONCURRENCY = 8;
const DOWNLOAD_TIMEOUT_MS = 30_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; ModacoMigration/1.0; +https://modaco.co.il)";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

interface Stats {
  total: number;
  skipped: number;
  uploaded: number;
  failed: number;
  failedUrls: Array<{ id: string; url: string; error: string }>;
}

function extFromUrl(url: string, contentType?: string): string {
  // Prefer content-type when available
  if (contentType) {
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
    if (contentType.includes("png")) return "png";
    if (contentType.includes("webp")) return "webp";
    if (contentType.includes("gif")) return "gif";
    if (contentType.includes("avif")) return "avif";
  }
  const pathPart = url.split("?")[0].split("#")[0];
  const m = pathPart.toLowerCase().match(/\.(jpe?g|png|webp|gif|avif)$/);
  return m ? (m[1] === "jpeg" ? "jpg" : m[1]) : "jpg";
}

async function downloadWithTimeout(url: string): Promise<{ buffer: Buffer; contentType?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || undefined;
    return { buffer, contentType };
  } finally {
    clearTimeout(timer);
  }
}

async function migrateOne(
  img: { id: string; url: string; productId: string | null },
  stats: Stats,
  index: number
): Promise<void> {
  const prefix = `[${index + 1}/${stats.total}]`;
  if (img.url.startsWith(SUPABASE_URL)) {
    stats.skipped++;
    return;
  }
  try {
    const { buffer, contentType } = await downloadWithTimeout(img.url);
    const ext = extFromUrl(img.url, contentType);
    const folder = img.productId || "orphan";
    const path = `${folder}/${img.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: contentType || `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: true,
      });
    if (uploadError) throw new Error(`upload: ${uploadError.message}`);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const newUrl = data.publicUrl;

    await db.productImage.update({
      where: { id: img.id },
      data: { url: newUrl },
    });

    stats.uploaded++;
    if (index % 25 === 0 || index === stats.total - 1) {
      console.log(`${prefix} OK (${buffer.length.toLocaleString()}b) → ${path}`);
    }
  } catch (err) {
    stats.failed++;
    const error = err instanceof Error ? err.message : String(err);
    stats.failedUrls.push({ id: img.id, url: img.url, error });
    console.error(`${prefix} FAIL ${img.url}: ${error}`);
  }
}

async function processInBatches<T>(
  items: T[],
  concurrency: number,
  handler: (item: T, index: number) => Promise<void>
): Promise<void> {
  const queue = [...items];
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const i = index++;
      await handler(item, i);
    }
  });
  await Promise.all(workers);
}

async function main() {
  console.log(`Migrating images to ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`);

  const images = await db.productImage.findMany({
    select: { id: true, url: true, productId: true },
  });
  const external = images.filter((img) => !img.url.startsWith(SUPABASE_URL));

  console.log(`Found ${images.length} total images, ${external.length} external to migrate.`);
  if (external.length === 0) {
    console.log("Nothing to migrate. Done.");
    await db.$disconnect();
    return;
  }

  const stats: Stats = {
    total: external.length,
    skipped: images.length - external.length,
    uploaded: 0,
    failed: 0,
    failedUrls: [],
  };

  const start = Date.now();
  await processInBatches(external, CONCURRENCY, (item, i) => migrateOne(item, stats, i));
  const elapsedSec = ((Date.now() - start) / 1000).toFixed(1);

  console.log("\n=== Migration complete ===");
  console.log(`Uploaded: ${stats.uploaded}`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Skipped (already migrated): ${stats.skipped}`);
  console.log(`Elapsed:  ${elapsedSec}s`);

  if (stats.failedUrls.length > 0) {
    console.log(`\nFailed URLs (first 20):`);
    stats.failedUrls.slice(0, 20).forEach((f) =>
      console.log(`  ${f.id}  ${f.error}  ${f.url}`)
    );
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
