import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { US_LABOR_BASELINE } from '../src/data/usLaborBaseline.js';
import type { USLaborMarketSnapshot } from '../src/types/labor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations?: FredObservation[];
}

/**
 * Series IDs on St. Louis Fed FRED (which mirrors official BLS and Census data):
 * - UNRATE: Unemployment Rate (Percent)
 * - CE16OV: Civilian Employment (Thousands)
 * - UNEMPLOY: Unemployed (Thousands)
 * - JTSJOL: Job Openings: Total Nonfarm (Thousands)
 * - JTSHIL: Hires: Total Nonfarm (Thousands)
 * - JTSLDL: Layoffs & Discharges: Total Nonfarm (Thousands)
 * - POPTHM: Population (Thousands)
 * - CLF16OV: Civilian Labor Force (Thousands)
 * - CIVPART: Labor Force Participation Rate (Percent)
 */
const FRED_SERIES_MAP = {
  unemploymentRate: 'UNRATE',
  employed: 'CE16OV',
  unemployed: 'UNEMPLOY',
  jobOpenings: 'JTSJOL',
  hires: 'JTSHIL',
  layoffs: 'JTSLDL',
  population: 'POPTHM',
  laborForce: 'CLF16OV',
  participationRate: 'CIVPART',
};

async function fetchFredSeriesLatest(seriesId: string, apiKey: string): Promise<number | null> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[sync-bls] FRED request failed for ${seriesId}: ${res.statusText}`);
      return null;
    }
    const data = (await res.json()) as FredResponse;
    const rawVal = data.observations?.[0]?.value;
    if (!rawVal || rawVal === '.') return null;
    return parseFloat(rawVal);
  } catch (err) {
    console.warn(`[sync-bls] Error fetching ${seriesId}:`, err);
    return null;
  }
}

export async function generateUpdatedSnapshot(apiKey?: string): Promise<USLaborMarketSnapshot> {
  const snapshot: USLaborMarketSnapshot = JSON.parse(JSON.stringify(US_LABOR_BASELINE));

  if (!apiKey) {
    console.log('[sync-bls] No FRED_API_KEY provided. Using verified baseline snapshot.');
    snapshot.timestamp = new Date().toISOString();
    return snapshot;
  }

  console.log('[sync-bls] Fetching latest official labor figures from FRED API...');

  const [
    unrate,
    empThousands,
    unempThousands,
    openingsThousands,
    hiresThousands,
    layoffsThousands,
    popThousands,
    clfThousands,
    civpart,
  ] = await Promise.all([
    fetchFredSeriesLatest(FRED_SERIES_MAP.unemploymentRate, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.employed, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.unemployed, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.jobOpenings, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.hires, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.layoffs, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.population, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.laborForce, apiKey),
    fetchFredSeriesLatest(FRED_SERIES_MAP.participationRate, apiKey),
  ]);

  if (unrate !== null) snapshot.unemploymentRate = unrate;
  if (civpart !== null) snapshot.participationRate = civpart;
  if (popThousands !== null) {
    snapshot.populationTotal = popThousands * 1000;
    snapshot.metrics.us_population.headlineValue = snapshot.populationTotal;
    snapshot.metrics.us_population.formattedValue = `${(snapshot.populationTotal / 1_000_000).toFixed(1)}M`;
  }
  if (clfThousands !== null) snapshot.civilianLaborForce = clfThousands * 1000;

  if (empThousands !== null) {
    const employed = empThousands * 1000;
    snapshot.metrics.employed.headlineValue = employed;
    snapshot.metrics.employed.formattedValue = `${(employed / 1_000_000).toFixed(1)}M`;
    if (snapshot.metrics.employed.subSegments?.fullTime) {
      const ft = Math.round(employed * 0.835);
      const pt = employed - ft;
      snapshot.metrics.employed.subSegments.fullTime.count = ft;
      snapshot.metrics.employed.subSegments.fullTime.formatted = `${(ft / 1_000_000).toFixed(1)}M`;
      if (snapshot.metrics.employed.subSegments.partTime) {
        snapshot.metrics.employed.subSegments.partTime.count = pt;
        snapshot.metrics.employed.subSegments.partTime.formatted = `${(pt / 1_000_000).toFixed(1)}M`;
      }
    }
  }

  if (unempThousands !== null) {
    const unemp = unempThousands * 1000;
    snapshot.metrics.unemployed.headlineValue = unemp;
    snapshot.metrics.unemployed.formattedValue = `${(unemp / 1_000_000).toFixed(1)}M`;
  }

  if (openingsThousands !== null) {
    const openings = openingsThousands * 1000;
    snapshot.metrics.job_postings.headlineValue = openings;
    snapshot.metrics.job_postings.formattedValue = `${(openings / 1_000_000).toFixed(2)}M`;
  }

  if (hiresThousands !== null) {
    const hires = hiresThousands * 1000;
    snapshot.metrics.hires.headlineValue = hires;
    snapshot.metrics.hires.formattedValue = `${(hires / 1_000_000).toFixed(2)}M`;
    // Monthly hires / seconds in a month (~2,592,000s)
    snapshot.runRatesPerSecond.hires = parseFloat((hires / 2_592_000).toFixed(2));
  }

  if (layoffsThousands !== null) {
    const layoffs = layoffsThousands * 1000;
    snapshot.metrics.layoffs.headlineValue = layoffs;
    snapshot.metrics.layoffs.formattedValue = `${(layoffs / 1_000_000).toFixed(2)}M`;
    snapshot.runRatesPerSecond.layoffs = parseFloat((layoffs / 2_592_000).toFixed(2));
  }

  snapshot.timestamp = new Date().toISOString();
  snapshot.monthReported = `Automated BLS/FRED Sync (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
  snapshot.headlineSummary = `US Civilian Labor Force at ${(snapshot.civilianLaborForce / 1_000_000).toFixed(1)}M with ${snapshot.unemploymentRate}% Unemployment & ${snapshot.metrics.job_postings.formattedValue} Openings.`;

  return snapshot;
}

async function run() {
  const apiKey = process.env.FRED_API_KEY || process.env.BLS_API_KEY;
  const snapshot = await generateUpdatedSnapshot(apiKey);

  const outDir = path.resolve(__dirname, '../public/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'latest.json');
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2), 'utf-8');
  console.log(`[sync-bls] Successfully saved latest labor snapshot to ${outFile}`);
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('sync-bls.ts')) {
  run().catch((err) => {
    console.error('[sync-bls] Fatal error:', err);
    process.exit(1);
  });
}
