import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ==================== CUSTOMER GROUPS ====================
  console.log("Creating customer groups...");
  const groups = await Promise.all([
    db.customerGroup.upsert({
      where: { name: "retail" },
      update: {},
      create: {
        name: "retail",
        displayName: "קמעונאי",
        discountPercent: 0,
      },
    }),
    db.customerGroup.upsert({
      where: { name: "architect" },
      update: {},
      create: {
        name: "architect",
        displayName: "אדריכל/מעצב",
        discountPercent: 15,
        paymentTerms: "שוטף+30",
      },
    }),
    db.customerGroup.upsert({
      where: { name: "contractor" },
      update: {},
      create: {
        name: "contractor",
        displayName: "קבלן",
        discountPercent: 20,
        paymentTerms: "שוטף+30",
      },
    }),
    db.customerGroup.upsert({
      where: { name: "vip" },
      update: {},
      create: {
        name: "vip",
        displayName: "VIP",
        discountPercent: 10,
      },
    }),
  ]);
  console.log(`  ${groups.length} customer groups`);

  // ==================== SUPPLIERS ====================
  console.log("Creating suppliers...");
  const suppliers = await Promise.all([
    db.supplier.upsert({
      where: { name: "Blum" },
      update: {},
      create: {
        name: "Blum",
        website: "https://www.blum.com",
        contactInfo: "ספק ראשי — צירים, מסילות, מנגנוני הרמה",
      },
    }),
    db.supplier.upsert({
      where: { name: "Nyga" },
      update: {},
      create: {
        name: "Nyga",
        website: "https://www.nyga.co.il",
        contactInfo: "ברזי מטבח — Blanco, Delta",
        scraperConfig: { type: "woocommerce", selectors: {} },
      },
    }),
    db.supplier.upsert({
      where: { name: "Floralis" },
      update: {},
      create: {
        name: "Floralis",
        website: "https://www.floralis.co.il",
        contactInfo: "אקססוריז לבית — אגרטלים, מראות, כלי בישול",
        scraperConfig: { type: "shopify", selectors: {} },
      },
    }),
    db.supplier.upsert({
      where: { name: "Domicile" },
      update: {},
      create: {
        name: "Domicile",
        website: "https://www.domicile.co.il",
        contactInfo: "ידיות למטבחים ולריהוט",
        scraperConfig: { type: "woocommerce", selectors: {} },
      },
    }),
  ]);
  console.log(`  ${suppliers.length} suppliers`);

  // ==================== CATEGORIES ====================
  console.log("Creating categories...");

  const hinges = await db.category.upsert({
    where: { slug: "hinges" },
    update: {},
    create: { name: "צירים", slug: "hinges", sortOrder: 1 },
  });
  await Promise.all([
    db.category.upsert({
      where: { slug: "clip-top-hinges" },
      update: {},
      create: {
        name: "צירי קליפ-טופ",
        slug: "clip-top-hinges",
        parentId: hinges.id,
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "glass-hinges" },
      update: {},
      create: {
        name: "צירי זכוכית",
        slug: "glass-hinges",
        parentId: hinges.id,
        sortOrder: 2,
      },
    }),
    db.category.upsert({
      where: { slug: "hinge-mounting-plates" },
      update: {},
      create: {
        name: "תושבות לצירים",
        slug: "hinge-mounting-plates",
        parentId: hinges.id,
        sortOrder: 3,
      },
    }),
  ]);

  const slides = await db.category.upsert({
    where: { slug: "slides" },
    update: {},
    create: { name: "מסילות", slug: "slides", sortOrder: 2 },
  });
  await Promise.all([
    db.category.upsert({
      where: { slug: "movento-slides" },
      update: {},
      create: {
        name: "מסילות מובנטו",
        slug: "movento-slides",
        parentId: slides.id,
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "tandem-slides" },
      update: {},
      create: {
        name: "מסילות טנדם",
        slug: "tandem-slides",
        parentId: slides.id,
        sortOrder: 2,
      },
    }),
  ]);

  const liftSystems = await db.category.upsert({
    where: { slug: "lift-systems" },
    update: {},
    create: { name: "מנגנוני הרמה", slug: "lift-systems", sortOrder: 3 },
  });
  await Promise.all([
    db.category.upsert({
      where: { slug: "flap-lift-systems" },
      update: {},
      create: {
        name: "מנגנוני הרמה לקלפות",
        slug: "flap-lift-systems",
        parentId: liftSystems.id,
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "micro-lift-systems" },
      update: {},
      create: {
        name: "מתקני הרמה למיקרו",
        slug: "micro-lift-systems",
        parentId: liftSystems.id,
        sortOrder: 2,
      },
    }),
  ]);

  await db.category.upsert({
    where: { slug: "faucets" },
    update: {},
    create: { name: "ברזי מטבח", slug: "faucets", sortOrder: 4 },
  });

  await db.category.upsert({
    where: { slug: "handles" },
    update: {},
    create: { name: "ידיות", slug: "handles", sortOrder: 5 },
  });

  const legs = await db.category.upsert({
    where: { slug: "legs" },
    update: {},
    create: { name: "רגליים לריהוט", slug: "legs", sortOrder: 7 },
  });
  await Promise.all([
    db.category.upsert({
      where: { slug: "table-legs" },
      update: {},
      create: {
        name: "רגליים לשולחנות",
        slug: "table-legs",
        parentId: legs.id,
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "counter-legs" },
      update: {},
      create: {
        name: "רגליי דלפק",
        slug: "counter-legs",
        parentId: legs.id,
        sortOrder: 2,
      },
    }),
    db.category.upsert({
      where: { slug: "low-furniture-legs" },
      update: {},
      create: {
        name: "רגליים נמוכות לריהוט",
        slug: "low-furniture-legs",
        parentId: legs.id,
        sortOrder: 3,
      },
    }),
    db.category.upsert({
      where: { slug: "furniture-wheels" },
      update: {},
      create: {
        name: "גלגלים לריהוט",
        slug: "furniture-wheels",
        parentId: legs.id,
        sortOrder: 4,
      },
    }),
  ]);

  const accessories = await db.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "אקססוריז לבית", slug: "accessories", sortOrder: 6 },
  });
  await Promise.all([
    db.category.upsert({
      where: { slug: "vases" },
      update: {},
      create: {
        name: "אגרטלים",
        slug: "vases",
        parentId: accessories.id,
        sortOrder: 1,
      },
    }),
    db.category.upsert({
      where: { slug: "mirrors" },
      update: {},
      create: {
        name: "מראות מעוצבות",
        slug: "mirrors",
        parentId: accessories.id,
        sortOrder: 2,
      },
    }),
    db.category.upsert({
      where: { slug: "storage" },
      update: {},
      create: {
        name: "אחסון",
        slug: "storage",
        parentId: accessories.id,
        sortOrder: 3,
      },
    }),
    db.category.upsert({
      where: { slug: "cookware" },
      update: {},
      create: {
        name: "כלי בישול",
        slug: "cookware",
        parentId: accessories.id,
        sortOrder: 4,
      },
    }),
    db.category.upsert({
      where: { slug: "trays-stands" },
      update: {},
      create: {
        name: "מגשים ומעמדים",
        slug: "trays-stands",
        parentId: accessories.id,
        sortOrder: 5,
      },
    }),
  ]);

  console.log("  Categories created with subcategories");

  // ==================== ADMIN USER ====================
  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("modaco2026!", 12);
  await db.user.upsert({
    where: { email: "yarin@modaco.co.il" },
    update: {},
    create: {
      name: "ירין מויאל",
      email: "yarin@modaco.co.il",
      phone: "0526804945",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("  Admin user: yarin@modaco.co.il");

  console.log("\nSeed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
