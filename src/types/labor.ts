export type MacroMetricId =
  | 'us_population'
  | 'employed'
  | 'unemployed'
  | 'job_postings'
  | 'hires'
  | 'layoffs';

export type PopulationLens = 'all' | 'employed' | 'unemployed';

export type MicroDimension = 'sector' | 'demographics' | 'trend12m';

export interface MicroBarItem {
  id: string;
  label: string;
  subLabel?: string;
  value: number; // numeric count (e.g., in millions or thousands)
  formattedValue: string;
  sharePercentage: number; // e.g. 18.4%
  deltaMoM?: number; // percentage or count change
  deltaType?: 'positive' | 'negative' | 'neutral';
}

export interface MetricBreakdownData {
  sector: MicroBarItem[];
  demographics: MicroBarItem[];
  trend12m: MicroBarItem[];
}

export interface MacroMetric {
  id: MacroMetricId;
  title: string;
  shortLabel: string;
  headlineValue: number;
  formattedValue: string;
  unit: string;
  momChange: number; // e.g., +0.2% or +150K
  momFormatted: string;
  momDirection: 'up' | 'down' | 'flat';
  description: string;
  category: 'population' | 'workforce' | 'velocity';
  accentColor: 'blue' | 'emerald' | 'amber' | 'cyan' | 'indigo' | 'rose';
  // Sub-segments for Employed or other macro views
  subSegments?: {
    fullTime?: {
      count: number;
      formatted: string;
      percentage: number;
    };
    partTime?: {
      count: number;
      formatted: string;
      percentage: number;
    };
  };
  breakdown: MetricBreakdownData;
}

export interface USLaborMarketSnapshot {
  timestamp: string;
  monthReported: string;
  source: string;
  headlineSummary: string;
  populationTotal: number; // e.g., 341.2M
  civilianLaborForce: number; // e.g., 168.3M
  participationRate: number; // e.g., 62.7%
  unemploymentRate: number; // e.g., 4.1%
  metrics: Record<MacroMetricId, MacroMetric>;
  runRatesPerSecond: {
    hires: number; // ~2.1 hires per second nationwide
    layoffs: number; // ~0.55 layoffs per second nationwide
    postingsAdded: number; // ~2.4 postings created/refreshed per second
  };
}
