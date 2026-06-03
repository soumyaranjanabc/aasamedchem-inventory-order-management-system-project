# AasaMedChem Inventory & Order Management

A full-stack starter for chemical and medical supply inventory, role dashboards, unit conversion, INR pricing, and quotation flow.

## Stack

- Next.js 14 App Router
- Neon PostgreSQL serverless
- Drizzle ORM
- NextAuth.js v5 credentials auth
- Tailwind CSS
- Server Actions

## Local Setup

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
AUTH_SECRET="generate-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Create schema and seed:

```bash
npm run db:push
npm run db:seed
```

Run the app:

```bash
npm run dev
```

Open http://localhost:3000.

## Test Credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@aasa.com` | `Admin@123` |
| Seller | `seller@aasa.com` | `Seller@123` |
| Buyer | `buyer@aasa.com` | `Buyer@123` |

Admin accounts are created by `npm run db:seed`. Public registration supports
buyer and seller accounts only.

## Current Features

- Protected Admin, Seller, and Buyer workspaces.
- Credentials login and buyer registration.
- Drizzle schema for users, units, products, orders, and order items.
- Unit conversion to base units for quotation saves.
- Prices stored as paise and displayed as INR.
- Seeded default units and sample catalog.

## Build Steps From Scratch

1. Scaffold the app with TypeScript, Tailwind, and App Router.
2. Add Drizzle, Neon, NextAuth v5, bcrypt, Zod, and UI icons.
3. Define PostgreSQL enums and tables in `lib/db/schema.ts`.
4. Configure Neon access in `lib/db/index.ts`.
5. Configure credentials auth in `auth.ts` and expose `/api/auth`.
6. Add middleware for protected role routes.
7. Create seed data for roles, units, and products.
8. Build Admin, Seller, and Buyer pages around server-side queries.
9. Use Server Actions for login, registration, and quotation creation.
10. Push schema, seed database, run lint/build, and deploy to Vercel.
