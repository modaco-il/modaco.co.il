# Modaco Commerce Platform

## Project
E-commerce platform for Modaco — hardware, faucets & home accessories.
B2B + B2C with role-based pricing. WhatsApp admin agent for Yarin.

## Stack
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS + shadcn/ui
- Prisma v7 + PostgreSQL (Neon) — adapter-based: `@prisma/adapter-pg`
- Inngest v4 for event-driven automations
- Meta Cloud API for WhatsApp
- Morning for payments, Green Invoice for invoicing

## Structure
- `src/app/(shop)/` — customer-facing storefront
- `src/app/admin/` — mobile-first admin panel
- `src/app/api/` — API routes + webhooks
- `src/lib/db/` — Prisma client
- `src/lib/pricing/` — B2B/B2C pricing engine
- `src/lib/inngest/` — automations (abandoned cart, notifications, daily summary)
- `src/lib/whatsapp/` — WhatsApp admin agent
- `src/lib/scrapers/` — supplier product scrapers
- `src/components/shop/` — storefront components
- `src/components/admin/` — admin panel components

## Key Decisions
- All cloud accounts belong to client (yarin@modaco.co.il), not developer
- Hebrew RTL throughout, font: Heebo
- Prisma v7 requires adapter: `new PrismaClient({ adapter: new PrismaPg(...) })`
- Inngest v4: triggers go inside the config object, not as separate arg

## Commands
- `npm run dev` — local dev server
- `npx prisma generate` — regenerate Prisma client after schema changes
- `npx prisma migrate dev` — run migrations (requires DB connection)
- `npx next build` — production build
