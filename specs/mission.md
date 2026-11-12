# US Job Pulse Mission

## Overview
**US Job Pulse** is a mobile-first, desktop-responsive real-time US labor market dashboard designed to make macroeconomic employment data immediately understandable for everyday users, job seekers, analysts, and decision-makers. It distills complex Bureau of Labor Statistics (BLS) and JOLTS datasets into a clean, modern, high-contrast interface centered around six headline macro metrics: **US Population**, **Employed (Full-Time & Part-Time)**, **Unemployed**, **Job Postings (Openings)**, **Hires**, and **Layoffs & Discharges**.

The application follows a **Macro-to-Micro** interaction model. At the macro level, users see the live pulse of the US population and can tap **All Population**, **Employed**, or **Unemployed** directly on the front dashboard to dynamically cross-filter all metrics and ratios in real time. Tapping into any individual macro metric opens the **Micro View**, displaying interactive bar charts broken down by **Industry Sector (NAICS)**, **Demographics & Work Status** (Age, Education, Full-Time vs. Part-Time), and **12-Month Historical Trends**.

To bridge the gap between monthly official government releases and a living dashboard, US Job Pulse combines verified **BLS/FRED baseline figures** with a **Live Velocity Ticker** that models real-time per-second US labor flows (e.g., ~2.0 hires/sec, ~0.65 layoffs/sec, and live net job posting changes) since the user opened the session or since the start of the day.

## Motivation & Problem Statement
- **The Core Problem**: Official US labor data (BLS Employment Situation and JOLTS reports) is buried in dense, static tables and fragmented across multiple government portals, making it difficult to grasp how total population, employment type (full-time vs. part-time), job openings, hires, and layoffs connect to one another—especially on a mobile screen.
- **Why Existing Solutions Fall Short**: Conventional economic dashboards (like FRED or raw BLS tables) are built for desktop economists rather than mobile users, lack cohesive macro-to-micro drill-downs, and feel static rather than conveying the continuous, real-time velocity of the US labor market.
- **How This Project Solves It**: US Job Pulse pairs a simplified, modern mobile-first card architecture with instant **Employed / Unemployed** population lens toggles, one-tap micro bar-chart breakdowns, and a hybrid real-time velocity engine that makes macroeconomic scale tangible.

## Core Metaphor & Domain Concepts
- **Core Metaphor**: **Macro-to-Micro Labor Pulse Monitor** — A clinical-grade yet consumer-friendly financial/vital-signs monitor for the US workforce where the top layer shows the macroscopic heartbeat of the population and every metric card unfolds into microscopic structural bar charts.
- **Key Entities**:
  - `PopulationSlice` (`all` | `employed` | `unemployed`): The active front-dashboard filter lens that dynamically recalculates headline figures, percentages of total/labor force, and contextual ratios (e.g., Job Postings per Unemployed Worker, Full-Time vs. Part-Time share, Hires-to-Openings rate).
  - `MacroMetricCard`: One of the 6 core macro indicators (`us_population`, `employed`, `unemployed`, `job_postings`, `hires`, `layoffs`), storing baseline BLS/JOLTS totals, month-over-month deltas, per-second flow velocity, and sub-segments (such as Full-Time vs. Part-Time under Employed).
  - `MicroBreakdown`: The structured bar-chart dataset attached to each `MacroMetricCard`, organized into three switchable dimensions:
    1. `sector`: Breakdown across major US NAICS industries (Healthcare, Technology/Information, Professional & Business Services, Leisure & Hospitality, Manufacturing, Construction, Government, Retail).
    2. `demographics`: Breakdown by Age Bracket (`16-24`, `25-54 Prime Working Age`, `55+`), Education Tier, and Work Status (`Full-Time >=35h`, `Part-Time Voluntary`, `Part-Time Economic`).
    3. `trend12m`: Trailing 12-month bar series showing monthly levels and momentum.
  - `LivePulseEngine`: The hybrid real-time ticker service that computes elapsed time and applies official US daily/per-second run-rates to display live cumulative hires, layoffs, and job posting flows alongside official baseline snapshots.
  - `CitizenCheckIn`: A crowdsourced, privacy-preserving live labor status record submitted by verified individuals:
    - `status`: `'working_fulltime'` | `'working_parttime'` | `'not_working_looking'`
    - `duration`: `'< 5w'` | `'5-14w'` | `'15-26w'` | `'27+w'` (for seekers)
    - `targetIndustry`: NAICS industry sector targeted
    - `state`: Optional US 2-letter state code or `'US'` (Nationwide)
    - `verificationTier`: `'anonymous_local'` (unauthenticated device token) vs. `'verified_citizen'` (Google/Apple OAuth with `HMAC-SHA256` privacy hash)
    - `expiresAt`: 30-day soft-expiry window requiring a 1-tap reconfirmation to prevent ghost data.

## Key Workflows & User Journeys
1. **Primary Flow (Front Dashboard & Employed/Unemployed Realtime Lens)**:
   - User opens the app on mobile (or desktop) and immediately views the **US Population Header** and the **6 Macro Metric Cards** (Population, Employed [with Full-Time & Part-Time split bar], Unemployed, Job Postings, Hires, Layoffs).
   - User taps the **Employed** or **Unemployed** quick-toggle pill on the front dashboard.
   - All metric cards smoothly transition in real time to highlight the selected population cohort—re-indexing percentages, highlighting Full-Time vs. Part-Time composition (when `Employed` is active) or Job Postings-to-Unemployed ratio & Layoff vulnerability (when `Unemployed` is active).
2. **Secondary Flow (Macro-to-Micro Bar Chart Drill-Down)**:
   - User taps any of the 6 Macro Metric Cards (e.g., **Job Postings** or **Layoffs**).
   - A responsive **Micro Drill-Down Sheet** (bottom sheet on mobile, expanded side/detail panel on desktop) opens with an interactive **Bar Chart**.
   - User switches between **By Industry Sector**, **Demographics & Work Type**, and **12-Month Trend** tabs to inspect horizontal/vertical bar comparisons with exact values and % shares.
3. **Tertiary Flow (Realtime Pulse Velocity Mode)**:
   - User toggles or observes the **Realtime Pulse Ticker** ("Live Session Flow" vs. "Today's US Flow" vs. "Official Monthly Snapshot") to watch live US hires, job postings, and layoffs increment in real time based on verified BLS/JOLTS run-rates.

## Non-Negotiable Boundaries & Out of Scope
- **In Scope (Current Focus)**:
  - Mobile-first single-column layout (`375px+`) that responsively expands into a multi-column executive dashboard on tablet and desktop (`768px+`, `1280px+`).
  - All 6 required macro metrics: **US Population**, **Employed (Full-Time & Part-Time)**, **Unemployed**, **US Job Postings**, **Hires**, and **Layoffs**.
  - Front-dashboard one-tap **All / Employed / Unemployed** lens toggle that updates the displayed population metrics and relationships in real time.
  - Micro bar-chart drill-down for every macro metric across **Industry Sector**, **Demographics/Work Status**, and **12-Month Trend**.
  - Hybrid data engine with authentic BLS/JOLTS baseline data + Live Velocity Ticker (and optional live BLS/FRED API fetch support).
- **Explicitly Out of Scope (Guards against scope creep)**:
  - Individual job board listings or applicant tracking (this is a macroeconomic & labor-market intelligence app, not a job application portal like Indeed/LinkedIn).
  - User authentication, personal resume uploads, or paid subscription billing in the MVP.
  - International/non-US labor datasets in the MVP (strictly focused on the US population and US labor market).
  - Complex multi-line econometric forecasting or raw SQL query builders that compromise mobile readability.
