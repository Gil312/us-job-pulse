# US Job Pulse

> **Realtime US Population & Employment Velocity Monitor**
> A mobile-first, desktop-responsive macroeconomic dashboard distilling official Bureau of Labor Statistics (BLS) and JOLTS data into an intuitive **Macro-to-Micro** labor pulse monitor with crowdsourced citizen check-ins.
>
> 🌐 **Live Production App**: [https://us-job-pulse.us-job-pulse.workers.dev](https://us-job-pulse.us-job-pulse.workers.dev)

[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-emerald?style=flat-square)](https://github.com/Gil312/us-job-pulse)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## Key Features

### 1. Macro-to-Micro Labor Pulse Architecture
* **6 Headline Indicators**: **US Total Population** (341.2M), **Employed Workforce** (161.5M with Full-Time / Part-Time visual split), **Unemployed Population** (6.9M / 4.1% U-3 rate), **Job Postings & Openings** (7.74M), **Monthly Hires** (5.42M), and **Layoffs & Discharges** (1.61M).
* **Interactive Micro Drill-Down**: Click into any of the 6 macro metric cards to open interactive bar charts across:
  - **By Industry Sector**: NAICS ranked breakdown with market share % and MoM deltas.
  - **Demographics & Work Type**: Age brackets, education tiers, and full-time vs. part-time reasons.
  - **12-Month Historical Trend**: Vertical monthly column chart with 12M Start, Latest, and Net YoY momentum KPI callouts.

### 2. Front-Dashboard Realtime Population Lens
* **Instant 3-Way Cohort Cross-Filtering**: Toggle between **All Population**, **Employed**, and **Unemployed** directly on the front dashboard.
* **Dynamic Proportional Stacked Bar**: Visual composition bar displaying relative shares of Employed, Unemployed, and Not in Labor Force.
* **Contextual KPI Cards**: Re-indexes market tension ratios in real time (e.g. *1.12x Job Postings per Unemployed Worker*, *Monthly Market Absorption Rate*, and *Turnover Velocity*).

### 3. Realtime US Velocity Ticker (Estimated Run-Rate Monitor)
* **Official BLS Snapshot**: Standard monthly reported federal benchmarks.
* **Live Session Ticker**: Real-time counter ticking live hires, layoffs, and postings since opening the app (~2.08 hires/sec, ~0.62 layoffs/sec).
* **Today's US Labor Flow**: Estimated cumulative workforce flow since 12:00 AM local time.
* **Proof & Math Modal**: Fully transparent methodology explaining calculations and mapping exact BLS/FRED series IDs (`POPTHM`, `CE16OV`, `UNEMPLOY`, `JTSJOL`, `JTSHIL`, `JTSLDL`).

### 4. Live Citizen Labor Barometer (Crowdsourced Sample)
* **10-Second Anonymous Check-In**: Citizens report their live status (`Working Full-Time`, `Working Part-Time`, or `Not Working & Looking`).
* **Unemployment Duration**: If searching, report duration (`< 5w`, `5–14w`, `15–26w`, `27+w`) and target industry sector + optional state.
* **Supply vs. Demand Mismatch Analysis**: Directly compares Citizen Desired Industry Demand % against official BLS Openings Supply % (e.g. highlights overcrowded fields like Tech).
* **Split-Identity Privacy Shield**: Designed for HMAC-SHA256 one-way hashing with 30-day soft-expiry to prevent ghost votes—zero PII stored alongside employment tallies.

### 5. Responsive Mobile-First & Desktop Split-Screen
* **Mobile (< 1024px)**: Single-column touch-friendly cards (`44px+` tap targets) and smooth bottom-sheet drawers.
* **Desktop (1280px+)**: Dynamic side-by-side split screen—click any macro card to inspect its micro bar charts in an inline panel without obscuring the macro metrics grid.

### 6. Automated Federal Data Ingestion (Zero-Cost Serverless Cron)
* **Scheduled Ingestion**: GitHub Actions workflow (`.github/workflows/update-labor-data.yml`) runs on Thursdays and Fridays at 9:00 AM EST (14:00 UTC) coinciding with weekly jobless claims and monthly BLS Employment Situation releases.
* **Direct St. Louis Fed FRED & BLS Integration**: Queries live official series observations (`POPTHM`, `CE16OV`, `UNEMPLOY`, `UNRATE`, `JTSJOL`, `JTSHIL`, `JTSLDL`, `CIVPART`).
* **Edge Static JSON Delivery**: Compiles normalized metrics directly to `public/data/latest.json`. Client applications fetch the latest snapshot with automatic fallback to high-fidelity embedded baseline data.

---

## Tech Stack & $0 Architecture

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite | Blazing fast client bundle with strict type safety |
| **Styling** | Tailwind CSS | Mobile-first modern slate & emerald/cyan/rose palette |
| **Charts** | Lightweight SVG/CSS Bar Charts | Zero canvas bloat, smooth transitions, instant mobile load |
| **Backend & DB** | Supabase (PostgreSQL + RLS + Auth) | Free 50k MAUs, real SQL aggregations (`GROUP BY`), medical-grade Row-Level Security |
| **Hosting & Edge CDN** | Cloudflare Pages / Workers | Unlimited global edge bandwidth, custom apex/subdomain routing, $0/month |
| **Automated Ingestion** | GitHub Actions + Node.js (TSX) | 2,000 free runner mins/month for weekly BLS/FRED API synchronization |

---

## Automated Ingestion & GitHub Secrets Setup

The repository contains an automated synchronization script [`scripts/sync-bls.ts`](scripts/sync-bls.ts) that fetches the latest official labor series from the Federal Reserve Economic Data (FRED) API and Bureau of Labor Statistics (BLS).

### Configuring API Keys in GitHub Secrets
To allow the GitHub Actions workflow to query FRED and BLS APIs:
1. Obtain a free FRED API key at [https://fred.stlouisfed.org/docs/api/api_key.html](https://fred.stlouisfed.org/docs/api/api_key.html).
2. *(Optional)* Obtain a free BLS v2 registration key at [https://data.bls.gov/registrationEngine/](https://data.bls.gov/registrationEngine/).
3. In your GitHub repository:
   - Navigate to **Settings** > **Secrets and variables** > **Actions**.
   - Click **New repository secret**.
   - Name: `FRED_API_KEY`, Secret: `<your-fred-api-key>`.
   - *(Optional)* Name: `BLS_API_KEY`, Secret: `<your-bls-api-key>`.

### Manual Ingestion Trigger
You can also trigger data synchronization at any time directly from GitHub:
- Go to the **Actions** tab in your repository.
- Select **Update US Labor Data (Automated BLS & FRED Sync)** in the sidebar.
- Click **Run workflow** > **Branch: main**.

---

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)

### Installation
```bash
# Clone the repository
git clone https://github.com/Gil312/us-job-pulse.git
cd us-job-pulse

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Visit **http://127.0.0.1:5173/** in your browser.

### Syncing Labor Data Locally
```bash
# Run the federal sync script locally (uses optional FRED_API_KEY env var)
npm run sync:data

# Or with your FRED API key:
FRED_API_KEY=your_key_here npm run sync:data
```

---

## Automated Tests & Verification

The project includes unit and component integration tests using **Vitest** and **React Testing Library**:

```bash
# Run the test suite (20 tests passing)
npm test

# Run strict TypeScript typecheck
npm run typecheck

# Build for production
npm run build
```

---

## Project Structure & Architecture

```text
us-job-pulse/
├── .github/
│   └── workflows/
│       └── update-labor-data.yml         # Scheduled Thursday/Friday GitHub Actions workflow
├── scripts/
│   └── sync-bls.ts                       # Federal BLS & FRED data ingestion script
├── public/
│   └── data/
│       └── latest.json                   # Edge-cached public labor snapshot
├── specs/
│   ├── mission.md                        # Product mission, domain models, boundaries
│   ├── tech-stack.md                     # Architecture conventions, dependencies, verification
│   └── roadmap.md                        # Phased implementation checklists & flow trees
├── src/
│   ├── types/labor.ts                    # TypeScript domain interfaces
│   ├── data/
│   │   ├── usLaborBaseline.ts            # BLS & JOLTS baseline figures and run-rates
│   │   └── citizenBaseline.ts            # Crowdsourced baseline, industries, US states
│   ├── hooks/
│   │   ├── usePopulationLens.ts          # Cross-filter computation engine
│   │   ├── useRealtimePulse.ts           # Per-second labor flow velocity ticker
│   │   ├── usePersistentState.ts         # localStorage state persistence helper
│   │   └── useIsWideDesktop.ts           # 1280px+ split-screen breakpoint hook
│   ├── components/
│   │   ├── MacroDashboard.tsx            # Main dashboard coordinator
│   │   ├── MetricCard.tsx                # 6 macro cards + FT/PT split bar + live badges
│   │   ├── PopulationLensBar.tsx         # 3-way cohort filter toggle
│   │   ├── PopulationCompositionBar.tsx  # Proportional stacked bar & dynamic ratio cards
│   │   ├── LiveVelocityBanner.tsx        # Snapshot / Live Session / Today's Flow ticker UI
│   │   ├── MicroDrilldownSheet.tsx       # Bottom sheet / desktop split inspector
│   │   ├── MicroBarChart.tsx             # Horizontal ranked & vertical 12M column charts
│   │   ├── MethodologyModal.tsx          # BLS/FRED series mapping & run-rate formula
│   │   ├── CitizenPulseComparisonBar.tsx # Crowdsourced barometer & supply/demand mismatch
│   │   └── CitizenCheckInModal.tsx       # 10-second anonymous check-in modal
│   ├── App.tsx                           # Root state & persistence wiring
│   └── main.tsx                          # React 19 entry point
└── tests/                                # 5 test suites (20/20 passing)
```

---

## License

This project is licensed under the [MIT License](LICENSE).
