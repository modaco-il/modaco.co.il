import { readFileSync } from "fs";
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

async function main() {
  const imgs = await db.productImage.findMany({ select: { url: true } });
  const hostCounts: Record<string, number> = {};
  for (const i of imgs) {
    let host = "(local)";
    if (i.url.startsWith("http")) {
      try {
        host = new URL(i.url).hostname;
      } catch {
        host = "(invalid-url)";
      }
    }
    hostCounts[host] = (hostCounts[host] ?? 0) + 1;
  }
  console.log("Image hosts in DB:");
  for (const [h, c] of Object.entries(hostCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${h.padEnd(50)} ${c}`);
  }
  await db.$disconnect();
}
main().catch(console.error);
