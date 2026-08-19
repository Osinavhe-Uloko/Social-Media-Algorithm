# Social Media Algorithm Impact Assessment and Awareness System (SMAIAS)

A full-stack web application built alongside the research *"Social Media
Algorithms and Academic Performance Among University of Benin Students"*
(Chapters One and Two). It turns the study's conceptual framework into a
usable tool with two access levels:

- **Student dashboard** — a short self-assessment (five-point Likert scale)
  covering the study's four constructs, with instant, individually
  interpreted results.
- **Administrator/researcher dashboard** — aggregate descriptive statistics,
  a live correlation matrix, and a live ordinary-least-squares multiple
  regression over submitted responses.

This satisfies the "system gap" identified in Chapter Two, Section 2.5.3:
existing tools either track screen time without explaining it, or measure
algorithmic literacy as a standalone research scale, but nothing combines a
multi-construct algorithmic-exposure assessment with individual feedback
*and* an institutional aggregate dashboard.

## How the system maps to the research

| Construct | Code | Role | Chapter 2 section |
|---|---|---|---|
| Algorithmic Content Personalisation | `ACP` | Independent variable | 2.2.2 / 2.2.3 |
| Engagement-Maximising Design Features | `EMD` | Independent variable | 2.2.4 |
| Time Spent on Algorithm-Curated Platforms | `TSA` | Independent variable | — |
| Algorithmic Literacy | `AL` | **Moderating** variable | 2.2.5 |
| Academic Performance / Impact | `AP` | Dependent variable | 2.2.6 |

Per the conceptual framework (Section 2.2.7), the three independent
variables are averaged into an **Algorithmic Exposure Index** and reported
to students as a direct driver of academic impact, while algorithmic
literacy is always reported *separately* and can optionally be entered as
an `AL × IV` **interaction term** in the admin regression panel — not as a
simple additive predictor — matching the moderation model described in the
research.

The full questionnaire instrument lives in `src/lib/constructs.ts`, and the
scoring/interpretation logic lives in `src/lib/scoring.ts`.

## Tech stack

- **Next.js 14** (App Router, TypeScript) — single deployable full-stack app
- **Prisma + SQLite** — zero-config for local dev; swap `DATABASE_URL` to a
  Postgres/MySQL connection string for production without touching the code
- **jose** (JWT) + **bcryptjs** for session auth in httpOnly cookies
- **Recharts** for the radar/bar/line charts
- **Tailwind CSS** for styling
- A from-scratch **statistics engine** (`src/lib/stats.ts`): mean, sample
  standard deviation, Pearson correlation, and OLS multiple linear
  regression (Gauss-Jordan matrix inversion) with standard errors,
  t-statistics and two-tailed p-values computed via the regularized
  incomplete beta function — the same relationship SPSS uses internally.
  This lets the admin dashboard demonstrate the regression procedure
  described in Chapter Three live, against real submitted data. **The
  thesis's authoritative statistical results remain the SPSS output
  reported in Chapter Four** — this module is a teaching/demo-grade
  re-implementation, not a replacement for it.

## Getting started

```bash
npm install
cp .env.example .env        # edit JWT_SECRET for anything beyond local dev
npm run setup                # prisma generate + db push + seed demo data
npm run dev                  # http://localhost:3000
```

`npm run setup` seeds:

- One admin account: `admin@uniben.edu.ng` / `Admin123!`
- 45 synthetic student accounts (`demo.student1@uniben.edu.ng` …
  `demo.student45@uniben.edu.ng`, password `Student123!`) with completed,
  internally-consistent assessment responses, so the admin dashboard's
  statistics and regression panel are populated on first run. This is
  clearly synthetic demo data (see `prisma/seed.ts`) — delete the seeded
  rows before using the system for a real data-collection run.

### Useful scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build/run |
| `npm run db:push` | Sync `prisma/schema.prisma` to the database |
| `npm run db:seed` | Re-run the demo data seed |

## Project layout

```
prisma/schema.prisma        User + Response models
prisma/seed.ts               Demo admin + synthetic student data
src/lib/constructs.ts        Questionnaire items, construct metadata
src/lib/scoring.ts            Construct scoring + interpretation text
src/lib/stats.ts              Descriptive stats, correlation, OLS regression
src/lib/auth.ts / session.ts  Password hashing / JWT session handling
src/middleware.ts             Route-level auth guard (student vs admin)
src/app/api/...               REST API routes
src/app/student/...           Student dashboard, assessment flow, history
src/app/admin/...             Admin overview, responses table, analysis panel
```

## Security notes

- Passwords are hashed with bcrypt; sessions are signed JWTs in httpOnly,
  `SameSite=Lax` cookies (marked `Secure` automatically in production).
- Route access is enforced in `src/middleware.ts` (student vs. admin) and
  re-checked server-side in every `/api/admin/*` route via
  `src/lib/adminGuard.ts` — the middleware check alone is not trusted as
  the sole authorization boundary.
- The assessment is entirely self-reported. The system has no access to,
  and makes no claim about, the internal ranking logic of any social media
  platform (matching the scope statement in Chapter One).
- `next` is pinned to the latest `14.2.x` patch release, which resolves the
  critical/high advisories relevant to this app (including a middleware
  authorization bypass). A handful of lower-severity advisories remain
  open against Next.js 14 for features this app does not use (Server
  Actions, custom servers, i18n Pages Router, remote image optimization,
  WebSocket proxying) — upgrading to Next 15/16 is a reasonable future
  hardening step once that major version has settled.
