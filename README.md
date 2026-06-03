# AasaMedChem Inventory & Order Management

A full-stack chemical and medical supply platform with role-based access, inventory management, buyer verification, seller commissions, and quotation workflows.

## Stack

- Next.js 14 App Router
- Neon PostgreSQL serverless
- Drizzle ORM
- NextAuth.js v5 credentials auth
- Tailwind CSS
- Server Actions

---

## Directory Structure

```
aasamedchem-inventory-order-management-system-project/
├── app/
│   ├── (auth)/
│   │   ├── actions.ts               # Login & registration server actions
│   │   ├── auth-form.tsx            # Shared auth form component
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   └── register/
│   │       └── page.tsx             # Buyer/Seller registration page
│   ├── admin/
│   │   └── page.tsx                 # Admin dashboard (flag sellers, adjust commission)
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts         # NextAuth API route
│   ├── buyer/
│   │   ├── actions.ts               # Buyer server actions (order, quotation)
│   │   ├── page.tsx                 # Buyer dashboard (browse & order products)
│   │   └── quotation-form.tsx       # Quotation request form
│   ├── dashboard/
│   │   └── page.tsx                 # Role-based redirect dashboard
│   ├── seller/
│   │   └── page.tsx                 # Seller dashboard (list products, verify buyers)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # Landing page (Sign In / Sign Up)
├── components/
│   ├── dashboard-shell.tsx          # Shared dashboard layout wrapper
│   └── db-empty-state.tsx           # Empty state UI component
├── lib/
│   ├── db/
│   │   ├── index.ts                 # Drizzle + Neon DB client
│   │   ├── queries.ts               # Reusable DB query functions
│   │   └── schema.ts                # Drizzle schema (users, products, orders, etc.)
│   ├── units/
│   │   └── convert.ts               # Unit conversion to base units
│   └── money.ts                     # Paise ↔ INR formatting helpers
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   └── seed.ts                      # DB seed (admin, units, sample products)
├── types/
│   └── next-auth.d.ts               # NextAuth session type extensions
├── .env.example
├── .eslintrc.json
├── auth.config.ts
├── auth.ts
├── drizzle.config.ts
├── middleware.ts                    # Route protection by role
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## User Roles & Functionalities

### 🛡️ Admin
- View all sellers and buyers on the platform
- **Flag a seller** — mark a seller as suspicious or non-compliant
- **Adjust commission** — set or update commission percentage per seller
- View all orders and platform-wide activity
- Full visibility into inventory, quotations, and order statuses

### 🏪 Seller
- **List a product** — add new products with name, unit, price (in paise), and stock quantity
- **Edit a product** — update price, stock, or product details
- **Verify a buyer** — review buyer-submitted license and documents; approve or reject
  - Only verified buyers can proceed to place orders
- View quotation requests from buyers
- Track orders associated with their products

### 🛒 Buyer
- **Register** with license and document upload (pending seller verification)
- **Browse products** — view available catalog with INR pricing and unit info
- **Request a quotation** — submit quantity and unit preference for a product
- **Place an order** — only available after seller verification is approved
- Track own order history and statuses

---

## Buyer Verification Flow

```
Buyer registers → Uploads license/docs → Seller reviews → Approved/Rejected
                                                              ↓
                                                   Buyer can now place orders
```

---

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

Open [http://localhost:3000](http://localhost:3000).

---

## Test Credentials

| Role   | Email              | Password     |
|--------|--------------------|--------------|
| Admin  | `admin@aasa.com`   | `Admin@123`  |
| Seller | `seller@aasa.com`  | `Seller@123` |
| Buyer  | `buyer@aasa.com`   | `Buyer@123`  |

> Admin accounts are created via `npm run db:seed`. Public registration supports Buyer and Seller accounts only.

---

## Useful Scripts

```bash
npm run db:push       # Push schema to Neon DB
npm run db:seed       # Seed default admin, units, and products
npm run db:studio     # Open Drizzle Studio (visual DB browser)
npm run dev           # Start local dev server
npm run build         # Build for production
```

---

## Key Implementation Notes

- Prices are **stored as paise** (integer) and **displayed as INR** via `lib/money.ts`
- Units are **converted to base units** before saving quotations via `lib/units/convert.ts`
- Route protection is handled in `middleware.ts` based on `session.user.role`
- Buyer access to ordering is **gated by verification status** set by the seller
- Commission per seller is stored on the seller's user record and applied during order processing

---

## Deployment (Vercel + Neon)

1. Push to GitHub (`main` branch auto-deploys on Vercel)
2. Add environment variables in Vercel Dashboard → Settings → Environment Variables:
   - `DATABASE_URL` — your Neon connection string
   - `AUTH_SECRET` — your auth secret
3. Run migrations on first deploy or add to build script:
   ```bash
   "build": "npx drizzle-kit migrate && next build"
   ```