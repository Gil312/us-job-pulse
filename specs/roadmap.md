# Roadmap

Phases are intentionally small — each should be implementable in one focused session.

---

## Phase 1: Project Scaffold, US Labor Data Engine & Macro Dashboard

**Goal:** Stand up the mobile-first React + TypeScript + Tailwind application with the verified US BLS/JOLTS dataset and render the 6 core Macro Metric Cards (US Population, Employed with Full-Time/Part-Time split, Unemployed, Job Postings, Hires, and Layoffs) that scale cleanly from mobile to desktop.

- [x] Initialize Vite + React 19 + TypeScript + Tailwind CSS + Vitest project structure in `us-job-pulse`.
- [x] Define core TypeScript domain models (`src/types/labor.ts`) for the 6 macro metrics, Full-Time vs. Part-Time employment sub-splits, population lenses, and micro bar-chart series.
- [x] Create the verified US Labor baseline data store (`src/data/usLaborBaseline.ts`) with realistic BLS CPS & JOLTS figures, per-second flow rates, industry sectors, demographics, and 12-month history.
- [x] Build the responsive mobile-first `MacroDashboard` and `MetricCard` components featuring visual Full-Time vs. Part-Time breakdown inside the Employed card and clear MoM badges.
- [x] Write automated unit and component tests (`tests/phase1-macro-dashboard.test.tsx`) verifying all 6 macro metrics and the Full-Time/Part-Time breakdown render accurately.

---

## Phase 2: Realtime Employed / Unemployed Population Lens Cross-Filtering

**Goal:** Enable one-tap switching between **All Population**, **Employed (Full-Time / Part-Time)**, and **Unemployed** directly on the front dashboard so all macro cards, population percentages, and labor ratios dynamically recalculate and highlight in real time.

- [x] Implement the `PopulationLensBar` segmented toggle control (`All US Population`, `Employed`, `Unemployed`) pinned cleanly at the top of the front dashboard, plus direct quick-filter triggers on the Employed and Unemployed cards.
- [x] Build the `usePopulationLens` cross-filter computation engine that recalculates contextual metrics in real time (e.g., Employed mode highlights Full-Time vs. Part-Time share, Active Hires rate, and Job Openings rate; Unemployed mode highlights U-3 vs. U-6 unemployment, Job Postings per Unemployed Person ratio, and Layoffs share).
- [x] Add interactive Population Composition Bar & contextual KPI callout pills that morph smoothly when switching between `All`, `Employed`, and `Unemployed`.
- [x] Write automated tests (`tests/phase2-population-lens.test.tsx`) verifying that clicking Employed or Unemployed dynamically updates displayed population metrics and contextual indicators in real time.

---

## Phase 3: Macro-to-Micro Interactive Bar Chart Drill-Downs

**Goal:** Allow clicking into any of the 6 Macro Metric Cards to open the Micro View displaying interactive bar charts across Industry Sectors, Demographics/Work Status, and 12-Month Historical Trends.

- [x] Build the `MicroBarChart` component supporting horizontal ranked bars (for Industry Sectors & Demographics) and vertical time-series bars (for 12-Month Trends), with animated fill bars, value labels, percentage shares, and MoM delta indicators.
- [x] Build the responsive `MicroDrilldownSheet` (touch-friendly bottom sheet on mobile viewports, sleek side/modal panel on desktop viewports) triggered by clicking any of the 6 Macro Metric Cards.
- [x] Wire dimension tabs (`By Industry Sector`, `Demographics & Work Type`, `12-Month Trend`) and connect the active `Employed` / `Unemployed` lens so micro bar charts also reflect the user's selected cohort context.
- [x] Write automated tests (`tests/phase3-micro-barcharts.test.tsx`) verifying that clicking each macro metric opens its micro bar chart view and switches cleanly across all 3 breakdown dimensions.

---

## Phase 4: Realtime Velocity Ticker, Desktop Layout Polish & End-to-End Verification

**Goal:** Add the hybrid Realtime Velocity Ticker (live per-second hires, job postings, and layoffs flow simulation based on US run-rates), desktop multi-column side-by-side comparison mode, and full verification.

- [x] Implement the `useRealtimePulse` hook and `LiveVelocityBanner` allowing users to toggle between **Official BLS Snapshot**, **Live Session Ticker** (real-time hires, layoffs, and postings since opening the app), and **Today's US Labor Flow** (estimated cumulative US labor events today).
- [x] Enhance desktop responsiveness (`lg:` / `xl:` breakpoints) so desktop users can view the 6-card Macro Grid alongside a persistent or split-screen Micro Bar Chart inspector while keeping mobile compact and thumb-friendly.
- [x] Persist user preferences (`PopulationLens`, `LivePulseMode`) in `localStorage` and add a quick "Reset / Compare" utility.
- [x] Add `MethodologyModal` transparency modal exposing BLS/FRED series IDs, run-rate math, and official-vs-estimated labels.
- [x] Run full test suite (`npm test`), typecheck (`npm run typecheck`), and production build (`npm run build`) to verify zero errors.

---

## Phase 5: Citizen Check-In Platform (Supabase + Cloudflare + GitHub Actions)

**Goal:** Transform US Job Pulse into a crowdsourced, privacy-preserving nationwide labor barometer where verified citizens check in with their live work status (`Working` [Full-Time/Part-Time] vs. `Not Working` + duration + target industry) alongside the official BLS baseline, running on a $0/month architecture.

### Architectural Decision: Why This Specific Path?
1. **Supabase (PostgreSQL + Auth + Realtime)**:
   - **SQL Aggregations vs. NoSQL Firestore**: Analyzing live employment across 50 states and 20 industries requires heavy `GROUP BY` and `COUNT(*)` calculations. In PostgreSQL, this is an instant single database query; in Firestore NoSQL, it requires reading millions of documents or writing complex increment counters.
   - **Medical-Grade Privacy via Row-Level Security (RLS)**: PostgreSQL native RLS guarantees that no user can query another citizen's personal history.
   - **Cost Predictability**: Supabase Free Tier covers 50,000 active users, and scales at **$0.00324/MAU** (40% cheaper than Firebase's $0.0055/MAU).
2. **Cloudflare Pages (Global Edge Delivery)**:
   - **Unlimited Free Bandwidth**: Unlike Firebase (360 MB/day) or Vercel (100 GB/mo), Cloudflare provides unlimited global CDN bandwidth for $0, preventing traffic spikes on federal release days from generating surprise bills.
3. **GitHub Actions (Scheduled Federal Ingestion)**:
   - **$0 Cron without Credit Card Requirement**: Runs the 15-second weekly BLS API scraper for free, bypassing Firebase's requirement to upgrade to the Blaze credit-card plan for scheduled cloud functions.

### Tasks:
- [ ] **Data Model & Privacy Contract**: Define the Supabase PostgreSQL schema with `citizen_checkins` table (anonymized hash `user_hash`, `status`, `duration_bucket`, `target_industry`, `state` [optional 2-letter code], `verification_tier` [`anonymous_local` vs. `verified_citizen`], `updated_at`, `expires_at` with 30-day soft-expiry window) and strict Row-Level Security (RLS) policies.
- [ ] **Anonymous-First 10-Second Check-In Modal**: Build the mobile-first `CitizenCheckInModal` that lets anyone test and record their status immediately with an anonymous device token:
  - Step 1: **Working** (`Full-Time` / `Part-Time`) vs. **Not Working (Looking)**
  - Step 2: If Not Working: **Duration** (`< 5w`, `5–14w`, `15–26w`, `27+w`)
  - Step 3: **Target Industry** (Healthcare, Tech, Retail, Construction, Hospitality, etc.) + Optional **State** dropdown
  - Step 4: One-tap option to **Verify with Google/Apple** to upgrade status to the official "Verified National Tally".
- [ ] **Dual-Bar Benchmark Comparison & Supply vs. Demand**: Build `CitizenPulseComparisonBar` displaying real-time citizen ratios (e.g. *“42,150 Citizens Checked In • 78% Working / 22% Searching”*) and direct **Supply vs. Demand mismatch analysis** (comparing Citizen Target Industry Demand % against official BLS Job Openings %).
- [ ] **30-Day Soft-Expiry Banner & Reconfirmation**: Implement a 1-tap *“Confirm Still Working / Looking”* banner after 30 days that refreshes the check-in or gracefully archives inactive ghost votes.
- [ ] **Bot-Proof Split-Identity Auth**: Integrate Supabase Auth (1-tap Google/Apple Sign-In) combined with Cloudflare Turnstile; execute one-way `HMAC-SHA256` hashing so user email/names are never stored in the employment tally table.
- [ ] **Automated Federal BLS Sync**: Build `.github/workflows/sync-bls-data.yml` and `scripts/sync-bls.ts` to pull latest monthly BLS/FRED numbers on release days and write static edge cache files for $0.
- [ ] **Testing & Quality Assurance**: Write automated component tests (`tests/phase5-citizen-checkin.test.tsx`) for check-in submission, anonymization, and comparison UI states.

---

## Architecture & Flow Diagram Tree

```mermaid
flowchart TD
    Data["src/data/usLaborBaseline.ts (US_LABOR_BASELINE)"] --> App["src/App.tsx (Persisted State: activeLens, pulseMode, selectedMetricId)"]
    Storage["localStorage (usjp_population_lens, usjp_pulse_mode)"] <--> App

    App --> Header["Sticky Header (Active Cohort Badge)"]
    App --> Dashboard["src/components/MacroDashboard.tsx"]

    Dashboard --> PulseHook["src/hooks/useRealtimePulse.ts (Per-Second Flow Engine)"]
    Dashboard --> LensHook["src/hooks/usePopulationLens.ts (Cross-Filter Engine)"]
    Dashboard --> DesktopHook["src/hooks/useIsWideDesktop.ts (1280px+ Split-Screen Detector)"]
    Data --> PulseHook
    Data --> LensHook

    PulseHook --> Ticker["LiveVelocityBanner (Snapshot | Live Session | Today's Flow)"]
    Ticker -- "onModeChange()" --> App

    Dashboard --> LensBar["PopulationLensBar (All Pop | Employed | Unemployed)"]
    LensBar -- "onLensChange()" --> App

    LensHook --> CompBar["PopulationCompositionBar (Stacked Pop Bar + 4 Dynamic Ratios)"]
    Dashboard --> Compare["Compare & Reset Toolbar (Side-by-Side Cohort Panel)"]

    Dashboard --> Grid["6 Macro Metric Cards Grid (2-col Split or 3-col Full)"]
    Grid --> CardPop["MetricCard: US Population (341.2M)"]
    Grid --> CardEmp["MetricCard: Employed (161.5M + FT/PT Split Bar)"]
    Grid --> CardUnemp["MetricCard: Unemployed (6.9M)"]
    Grid --> CardPost["MetricCard: Job Postings (7.74M + Live Flow Badge)"]
    Grid --> CardHire["MetricCard: Hires (5.42M + Live Flow Badge)"]
    Grid --> CardLay["MetricCard: Layoffs (1.61M + Live Flow Badge)"]

    CardPop & CardEmp & CardUnemp -- "Quick Filter Lens Pill" --> App
    CardPop & CardEmp & CardUnemp & CardPost & CardHire & CardLay -- "Card Tap (onSelectMetric)" --> App

    App -- "selectedMetricId != null" --> Sheet["MicroDrilldownSheet (Mobile Overlay Sheet / Desktop Inline Split Inspector)"]
    Sheet --> Context["Active Population Lens Context Banner"]
    Sheet --> Tabs["3 Dimension Tabs: Industry Sector | Work Type & Ages | 12-Month Trend"]
    Sheet --> Switcher["Sticky Footer: Quick-Switch All 6 Metrics"]
    Tabs --> Chart["MicroBarChart"]

    Chart --> Horiz["Horizontal Ranked Bars (Sector / Work Type + Lens Focus Badges)"]
    Chart --> Vert["Vertical Column Bars (12-Month Historical Trend + YoY Net)"]
```

---

## Component & File Tree

```text
us-job-pulse/
├── specs/
│   ├── mission.md                        # Product vision, entities, scope boundaries
│   ├── tech-stack.md                     # React 19, TS, Tailwind, Vitest conventions
│   └── roadmap.md                        # Phased checklist, architecture flow & file tree
├── src/
│   ├── types/labor.ts                    # Domain interfaces & union types
│   ├── data/usLaborBaseline.ts           # BLS/JOLTS baseline, breakdowns, run-rates
│   ├── hooks/
│   │   ├── usePopulationLens.ts          # Realtime Employed/Unemployed ratio & highlight logic
│   │   ├── useRealtimePulse.ts           # Per-second hires, postings, layoffs velocity ticker
│   │   ├── usePersistentState.ts         # Safe localStorage state persistence helper
│   │   └── useIsWideDesktop.ts           # Responsive 1280px+ split-screen breakpoint hook
│   ├── components/
│   │   ├── MacroDashboard.tsx            # Orchestrates ticker, lens bar, grid, compare & inspector
│   │   ├── LiveVelocityBanner.tsx        # Snapshot / Live Session / Today's Flow ticker UI
│   │   ├── PopulationLensBar.tsx         # Front 3-way cohort toggle (All / Employed / Unemployed)
│   │   ├── PopulationCompositionBar.tsx  # Stacked population bar & 4 dynamic ratio cards
│   │   ├── MetricCard.tsx                # 6 macro cards + FT/PT split bar + live flow badges
│   │   ├── MicroDrilldownSheet.tsx       # Responsive mobile bottom sheet / desktop split inspector
│   │   ├── MicroBarChart.tsx             # Horizontal ranked & vertical 12M bar charts
│   │   └── MethodologyModal.tsx          # Data proof, BLS/FRED series IDs & run-rate math modal
│   ├── test/setup.ts                     # Vitest + Testing Library setup
│   ├── App.tsx                           # Root state & localStorage preference wiring
│   ├── main.tsx                          # React 19 mount entry point
│   └── index.css                         # Tailwind base & custom dark scrollbar styling
└── tests/
    ├── phase1-macro-dashboard.test.tsx   # Phase 1 verification (4 tests)
    ├── phase2-population-lens.test.tsx   # Phase 2 verification (5 tests)
    ├── phase3-micro-barcharts.test.tsx   # Phase 3 verification (3 tests)
    └── phase4-realtime-ticker.test.tsx   # Phase 4 verification (4 tests)
```
