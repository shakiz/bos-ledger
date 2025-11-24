# BOS Ledger — Monthly Income/Expense Tracker

Minimal Next.js (App Router) + TypeScript starter for a monthly ledger app. Built with Prisma (SQLite locally), TailwindCSS, Zod, and React Hook Form.

Overview
- Fullstack app: Next.js App Router pages + API routes in `app/api/ledger`
- Database: Prisma (SQLite for local dev, PostgreSQL for production)
- Calculation helpers in `lib/ledger.ts`
- UI components under `components/`

Local setup

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client and push schema (SQLite default)

```bash
npx prisma generate
npx prisma db push
```

3. Run dev server

```bash
npm run dev
```

Notes for Vercel / Production
- Use a managed Postgres (or PlanetScale) database and set `DATABASE_URL` in Vercel Environment Variables.
- Update `prisma/schema.prisma` datasource provider to `postgresql` or set via env var.

API
- GET /api/ledger?month=YYYY-MM
- POST /api/ledger
- PUT /api/ledger/:id
- DELETE /api/ledger/:id

Folder structure
See the `app/`, `components/`, `lib/`, and `prisma/` folders in the repo — each contains minimal, focused code.

Troubleshooting
- If you see type errors in the editor, run `npm install` to fetch dependencies and `npx prisma generate`.

Next steps / Optional improvements
- Add authentication (NextAuth or Clerk)
- Add tests and CI
- Add CSV import/export
