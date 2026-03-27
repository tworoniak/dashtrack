# DashTrack

Track your DoorDash earnings and expenses — gas, mileage, maintenance, and more — with a clean dashboard and built-in IRS mileage deduction calculator.

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Supabase** — auth (magic link) + Postgres database
- **React Query** — server state and caching
- **React Hook Form** + **Zod** — type-safe form validation
- **Recharts** — earnings vs expenses bar chart
- **SCSS modules** — modular component styles with CSS custom properties

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/you/dashtrack.git
cd dashtrack
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open **SQL Editor** and run the contents of `supabase/schema.sql`
3. In **Authentication > Settings**, make sure **Email** provider is enabled

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values from **Project Settings > API** in Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project structure

```
src/
├── components/
│   ├── dashboard/       # KpiCard, EarningsChart, ExpenseBreakdown, RecentEntries
│   ├── layout/          # AppLayout (sidebar + outlet)
│   ├── log/             # EarningForm, GasForm, MileageForm, MaintenanceForm, OtherForm
│   └── ui/              # FormField, PeriodTabs
├── hooks/
│   ├── useDashboard.ts  # Fetches + derives all dashboard data
│   ├── useLogEntry.ts   # Mutations for each entry type
│   └── useSession.ts    # Supabase auth session
├── lib/
│   ├── schemas.ts       # Zod validation schemas
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # KPI computation, date ranges, formatters
├── pages/
│   ├── Dashboard.tsx
│   ├── Log.tsx
│   ├── Earnings.tsx     # Stub — ready to build out
│   ├── Reports.tsx      # Stub — CSV export coming
│   ├── TaxEstimate.tsx  # Stub — quarterly SE tax calc coming
│   └── Login.tsx
├── styles/
│   ├── abstracts/       # SCSS variables (breakpoints, spacing)
│   ├── base/            # CSS custom properties (tokens) + reset
│   └── main.scss        # Entry point
└── types/
    └── index.ts         # Earning, Expense, KpiSummary, etc.
```

---

## Features

### Working now
- Magic link authentication (no passwords)
- Log earnings with amount + active hours
- Log gas fill-ups (auto-calculates total cost)
- Log mileage with live IRS deduction preview ($0.70/mi for 2025)
- Log maintenance and other expenses
- Dashboard with KPI cards: gross earnings, total expenses, net profit, effective $/hr
- Earnings vs expenses bar chart (Day / Week / Month / YTD)
- Expense breakdown with proportional bars
- Recent entries table with type badges
- Row-level security — each user sees only their own data

### Coming next
- Full earnings history page with sorting + filtering
- Monthly reports with CSV export (Schedule C ready)
- Quarterly self-employment tax estimator
- Edit / delete entries
- PWA support for mobile use while dashing

---

## IRS mileage rate

The 2025 IRS standard mileage rate is **$0.70/mile**. This is defined in `src/lib/utils.ts` as `IRS_MILEAGE_RATE_2025` and used in both the `MileageForm` preview and the `useLogMileage` mutation. Update it each January when the IRS announces the new rate.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run `tsc --noEmit` only |
| `npm run lint` | ESLint |
