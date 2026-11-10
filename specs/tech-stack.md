# Tech Stack

## Language & Runtime
- **Language**: TypeScript 5.x (Strict mode enabled)
- **Runtime / Execution**: Node.js (v20+) + Vite 6 dev/build server
- **Compiler / Build Options**: `tsc -b` strict typechecking, ESNext modules, Vite bundler

## Architecture & Frameworks
- **Backend / Core Engine**: Client-side TypeScript Data & Live Velocity Engine (`src/services/laborDataEngine.ts`) with curated official BLS (CPS + JOLTS) baseline dataset and optional live BLS/FRED REST adapter.
- **API Style**: Modular TypeScript service layer with reactive hooks (`useLaborPulse`, `usePopulationLens`) emitting real-time tick snapshots (`requestAnimationFrame` / `setInterval` at 100ms–1000ms cadence).
- **Frontend / Presentation**:
  - **Framework**: React 19 + TypeScript
  - **Styling**: Tailwind CSS (Mobile-first responsive design system, dark/light high-contrast modern slate & emerald/amber/rose semantic palette, touch-friendly `44px+` tap targets)
  - **Charts & Visualization**: Custom lightweight responsive SVG/CSS Bar Charts (zero heavy canvas bloat, instant mobile rendering, smooth animated bar transitions) + `lucide-react` icons
- **Directory Conventions**:
  - `src/components/`: UI components (`MacroDashboard`, `PopulationLensBar`, `MetricCard`, `MicroDrilldownModal`, `MicroBarChart`, `LiveVelocityBanner`)
  - `src/data/`: Official BLS CPS & JOLTS baseline datasets, industry NAICS breakdowns, demographic slices, and 12-month historical series
  - `src/hooks/`: Reactive hooks for real-time velocity ticking and population lens cross-filtering
  - `src/types/`: Strict TypeScript domain interfaces (`MacroMetricId`, `PopulationLens`, `MacroMetric`, `MicroBarItem`, `MicroDimension`)
  - `specs/`: Project constitution (`mission.md`, `tech-stack.md`, `roadmap.md`)
  - `tests/`: Automated unit and component integration tests

## Persistence & Storage
- **Database / Store**:
  - Built-in verified US BLS & JOLTS dataset (`src/data/usLaborBaseline.ts`) for instant zero-latency offline/mobile loading.
  - `localStorage` persistence for user preferences (active `PopulationLens`, `LivePulseMode` toggle, last selected `MicroDimension`, and optional custom BLS/FRED API key cache).
- **Migration Strategy**: Versioned TypeScript schema snapshot (`DATA_SCHEMA_VERSION = '2026.11'`).

## Testing & Quality Control
- **Test Framework**: Vitest + React Testing Library (`@testing-library/react`, `@testing-library/user-event`, `jsdom`)
- **Linting & Formatting**: TypeScript Compiler (`tsc --noEmit`) + ESLint
- **Verification Commands**:
  - Test command: `npm test` (runs `vitest run`)
  - Typecheck / Lint command: `npm run typecheck` (runs `tsc --noEmit`)
  - Build command: `npm run build`
