# US Job Pulse

> **Realtime US Population & Employment Velocity Monitor**  
> A mobile-first, desktop-responsive macroeconomic dashboard distilling official Bureau of Labor Statistics (BLS) and JOLTS data into an intuitive **Macro-to-Micro** labor pulse monitor with crowdsourced citizen check-ins.

🌐 **Live Application**: [https://us-job-pulse.us-job-pulse.workers.dev](https://us-job-pulse.us-job-pulse.workers.dev)

[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passing-emerald?style=flat-square)](https://github.com/Gil312/us-job-pulse)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## Overview

Traditional macroeconomic reports from the federal government are published as static tables and lengthy PDF releases. **US Job Pulse** reimagines this data as an interactive, real-time command center:

- Translates complex federal figures into intuitive per-second labor flows and visual ratios.
- Bridges top-level national statistics with bottom-up industry sector and demographic breakdowns.
- Couples official federal benchmarks with an anonymous, real-time **Citizen Labor Barometer** to surface labor supply-and-demand mismatch trends.

---

## Key Features

### 1. Macro-to-Micro Labor Pulse Architecture
* **6 Headline Indicators**:
  * **US Total Population** (341.2M)
  * **Employed Workforce** (161.5M with Full-Time / Part-Time visual split)
  * **Unemployed Population** (6.9M / 4.1% U-3 rate)
  * **Job Postings & Openings** (7.74M)
  * **Monthly Hires** (5.42M)
  * **Layoffs & Discharges** (1.61M)
* **Interactive Micro Drill-Down**: Click into any of the 6 macro metric cards to reveal interactive bar charts across:
  * **By Industry Sector**: NAICS ranked breakdown with market share percentages and MoM deltas.
  * **Demographics & Work Type**: Age brackets, education tiers, and full-time vs. part-time classifications.
  * **12-Month Historical Trend**: Vertical column chart highlighting 12M Start, Latest, and Net YoY momentum KPI callouts.

### 2. Front-Dashboard Realtime Population Lens
* **3-Way Cohort Cross-Filtering**: Toggle between **All Population**, **Employed**, and **Unemployed** directly on the front dashboard.
* **Dynamic Proportional Composition Bar**: Visual stacked bar displaying relative shares of Employed, Unemployed, and Not in Labor Force.
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
* **Privacy Shield**: Zero personally identifiable information (PII) stored alongside employment tallies.

### 5. Responsive Mobile-First & Desktop Split-Screen
* **Mobile (< 1024px)**: Single-column touch-friendly cards (`44px+` tap targets) and bottom-sheet drawers.
* **Desktop (1280px+)**: Dynamic side-by-side split screen—click any macro card to inspect its micro bar charts in an inline panel without losing context of the macro metrics grid.

---

## Tech Stack & Architecture

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite | High-performance, strictly typed client single-page application |
| **Styling** | Tailwind CSS | Mobile-first modern slate & emerald/cyan/rose theme |
| **Visualizations** | Custom Lightweight SVG / CSS Bar Charts | Fast rendering, zero canvas bloat, smooth animated transitions |
| **Hosting & Edge CDN** | Cloudflare Pages / Workers | Global edge delivery with instant load times and zero bandwidth cost |
| **Automated Data Sync** | GitHub Actions + Node.js (TSX) | Scheduled workflow refreshing official labor snapshots to `public/data/latest.json` |

---

## Project Structure & Architecture

```text
us-job-pulse/
├── .github/
│   └── workflows/
│       └── update-labor-data.yml         # Scheduled federal labor data synchronization
├── scripts/
│   └── sync-bls.ts                       # Labor data snapshot generator
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
│   │   ├── usePersistentState.ts         # LocalStorage persistence helper
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

## View Live & Community Feedback

* **Try the Live App**: [https://us-job-pulse.us-job-pulse.workers.dev](https://us-job-pulse.us-job-pulse.workers.dev)
* **Check In**: Test out the 10-second Citizen Check-In Barometer directly on the live site to contribute to the sample pool and view the real-time industry mismatch chart.
* **Feedback & Suggestions**: Feedback, ideas, and feature requests are welcome via [GitHub Issues](https://github.com/Gil312/us-job-pulse/issues).

---

## License

This project is licensed under the [MIT License](LICENSE).
