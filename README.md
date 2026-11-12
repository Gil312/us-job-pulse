# US Job Pulse

> **Realtime US Population & Employment Velocity Monitor**
> A mobile-first, desktop-responsive macroeconomic dashboard distilling official Bureau of Labor Statistics (BLS) and JOLTS data into an intuitive **Macro-to-Micro** labor pulse monitor with crowdsourced citizen check-ins.

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

---

## Tech Stack & $0 Architecture

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite | Blazing fast client bundle with strict type safety |
| **Styling** | Tailwind CSS | Mobile-first modern slate & emerald/cyan/rose palette |
| **Charts** | Lightweight SVG/CSS Bar Charts | Zero canvas bloat, smooth transitions, instant mobile load |
| **Backend & DB (Phase 5)** | Supabase (PostgreSQL + RLS + Auth) | Free 50k MAUs, real SQL aggregations (`GROUP BY`), medical-grade Row-Level Security |
| **Hosting & CDN** | Cloudflare Pages | Unlimited global edge bandwidth, $0/month |
| **Scheduled Ingestion** | GitHub Actions | 2,000 free runner mins/month for weekly BLS/FRED API scraping |

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
