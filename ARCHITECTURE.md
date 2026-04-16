# WasteBank Architecture & Standards

This document serves as the absolute "Source of Truth" for any AI Agent or Developer entering this repository to maintain consistency across features, especially regarding backend integrations.

## Database (Neon Cloud Postgres)
1. **Raw SQL Strict Approach**: We use `@neondatabase/serverless` connected from `lib/db.ts`. 
2. **DO NOT INSTALL PRISMA OR DRIZZLE** unless explicitly requested by the owner. Keep it raw SQL to maintain performance limits and comply with team decisions.
3. Database connection string is located in `.env` as `DATABASE_URL`.

## Authentication (Clerk)
- The project relies on `@clerk/nextjs` (^7.2.0). 
- All references to user ownership in the Neon database MUST RELY ON `user_id` fetched directly from `user.id` or `auth()` in Clerk.

## State Management vs Real Database
- The frontend currently utilizes `zustand/middleware/persist` with a local `waste-bank-storage` to store dummy transactions for UI Demonstration.
- **Future Tasks**: The team is slowly migrating away from Zustand persist into fetching directly from the Neon DB using Server Actions. If editing data workflows, implement the DB insert logic first inside Next.js Actions (e.g., `app/actions/transaction.ts`), overriding Zustand dummy arrays where applicable.

## Environment Layout
Next.js `app/` Directory Router:
- `/dashboard/setor` -> Customer Form & QR Drop-off logic.
- `/admin/*` -> Admin territory. Note: Ensure you fetch from real Neon Database + Clerk User validations here. Don't fetch from Zustand.
- `lib/db.ts` -> Where the connection singleton lives (`import { sql } from '@/lib/db'`)

## Styling
- Strict `tailwindcss` styling applied.
- Theme relies heavily on _emerald_ and _stone_ prefixes to capture the eco-friendly visual identity. Keep padding generous (`p-6` or `p-8`) using rounding utilities `rounded-2xl` or `rounded-3xl` for high-end Fintech feel.

*Read this file entirely before executing complex commands on the admin side.*
