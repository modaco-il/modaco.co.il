/**
 * Site-wide image audit. For every ProductImage, issue a HEAD request
 * and report which URLs return non-2xx. Groups by hostname/pattern so
 * we can see if it's a single supplier collapsing or a wider problem.
 *
 * Run: npx tsx scripts/audit-broken-images.ts [--remote-only|--limit N]
 */
import { readFileSync, existsSync } from "fs";
import * as path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const env = readFileSync(".env.local", "utf8");
for (const l of env.split(/\r?\n/)) {
  const m = l.match(/^([A-Z_]+)=(.*)$/);
  if (m) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const PUBLIC_DIR = path.join(process.cwd(), "public");

interface Result {
  id: string;
  url: string;
  productId: string;
  productName: string;
  status: number | "missing-local" | "fetch-error";
  errorMsg?: string;
}

const CONCURRENCY = 16;

function hostnameOf(u: string): string {
  if (u.startsWith("/images/")) return "(local)";
  try {
    return new URL(u).hostname;
  } catch {
    return "(invalid-url)";
  }
}

async function checkUrl(url: string): Promise<{ status: number | "fetch-error"; error?: string }> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10_000);
    // Use GET with a range header — Supabase Storage and some CDNs reject HEAD
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 ModacoAudit",
        Range: "bytes=0-0",
      },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    // Drain to free socket
    try { await resp.body?.cancel(); } catch {}
    return { status: resp.status };
  } catch (e) {
    return { status: "fetch-error", error: (e as Error).message };
  }
}

async function main() {
  const remoteOnly = process.argv.includes("--remote-only");
  const limit = parseInt(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0");

  let where: any = {};
  if (remoteOnly) where = { url: { startsWith: "http" } };

  const allImages = await db.productImage.findMany({
    where,
    include: { product: { select: { name: true } } },
    orderBy: { id: "asc" },
    ...(limit > 0 ? { take: limit } : {}),
  });
  console.log(`Auditing ${allImages.length} images...\n`);

  const results: Result[] = [];
  let i = 0;

  async function worker() {
    while (i < allImages.length) {
      const img = allImages[i++];
      const idx = i;
      const url = img.url;
      const productName = img.product?.name ?? "?";

      let status: Result["status"];
      let errorMsg: string | undefined;

      if (url.startsWith("/images/")) {
        const absPath = path.join(PUBLIC_DIR, url);
        if (existsSync(absPath)) status = 200;
        else status = "missing-local";
      } else if (url.startsWith("http")) {
        const r = await checkUrl(url);
        status = r.status;
        errorMsg = r.error;
      } else {
        status = "fetch-error";
        errorMsg = "non-http url";
      }

      results.push({ id: img.id, url, productId: img.productId, productName, status, errorMsg });

      if (idx % 200 === 0) {
        const broken = results.filter((r) => r.status !== 200).length;
        console.log(`  ${idx}/${allImages.length} (broken so far: ${broken})`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const broken = results.filter((r) => r.status !== 200);
  console.log(`\n=== TOTALS ===`);
  console.log(`OK:     ${results.length - broken.length}`);
  console.log(`Broken: ${broken.length}\n`);

  // Group broken by host
  const byHost: Record<string, Result[]> = {};
  for (const r of broken) {
    const h = hostnameOf(r.url);
    (byHost[h] ||= []).push(r);
  }

  console.log(`=== BROKEN BY HOST ===`);
  for (const [h, list] of Object.entries(byHost).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${h}: ${list.length}`);
    // Status breakdown
    const byStatus: Record<string, number> = {};
    for (const r of list) byStatus[String(r.status)] = (byStatus[String(r.status)] ?? 0) + 1;
    for (const [s, c] of Object.entries(byStatus)) console.log(`    ${s}: ${c}`);
    // Show 3 sample URLs
    list.slice(0, 3).forEach((r) =>
      console.log(`    e.g. [${r.status}] ${r.productName.slice(0, 40)} → ${r.url.slice(0, 100)}`)
    );
  }

  await db.$disconnect();
}

main().catch(console.error);
