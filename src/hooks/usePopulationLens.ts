import { useMemo } from 'react';
import { USLaborMarketSnapshot, PopulationLens, MacroMetricId } from '../types/labor';

export interface LensMetricsSummary {
  primaryHeadline: string;
  primaryValue: string;
  cohortShareOfPopulation: string; // e.g., "47.3% of Total US Population"
  cohortShareOfLaborForce: string; // e.g., "95.9% of Civilian Labor Force"
  keyRatios: Array<{
    label: string;
    value: string;
    detail: string;
    trend: 'neutral' | 'positive' | 'negative';
  }>;
  highlightMetricIds: MacroMetricId[];
  dimmedMetricIds: MacroMetricId[];
}

export function usePopulationLens(
  snapshot: USLaborMarketSnapshot,
  activeLens: PopulationLens
): LensMetricsSummary {
  return useMemo(() => {
    const popTotal = snapshot.populationTotal; // 341.2M
    const laborForce = snapshot.civilianLaborForce; // 168.4M
    const employed = snapshot.metrics.employed.headlineValue; // 161.5M
    const unemployed = snapshot.metrics.unemployed.headlineValue; // 6.9M
    const postings = snapshot.metrics.job_postings.headlineValue; // 7.74M
    const hires = snapshot.metrics.hires.headlineValue; // 5.42M
    const layoffs = snapshot.metrics.layoffs.headlineValue; // 1.61M

    if (activeLens === 'employed') {
      const fullTime = snapshot.metrics.employed.subSegments?.fullTime?.count ?? 134_800_000;
      const partTime = snapshot.metrics.employed.subSegments?.partTime?.count ?? 26_700_000;
      const fullTimeRate = ((fullTime / employed) * 100).toFixed(1);
      const hiresRate = ((hires / employed) * 100).toFixed(2);
      const layoffRate = ((layoffs / employed) * 100).toFixed(2);

      return {
        primaryHeadline: 'Active US Employed Workforce Cohort',
        primaryValue: `${(employed / 1_000_000).toFixed(1)}M`,
        cohortShareOfPopulation: `${((employed / popTotal) * 100).toFixed(1)}% of US Population`,
        cohortShareOfLaborForce: `${((employed / laborForce) * 100).toFixed(1)}% of Active Labor Force`,
        keyRatios: [
          {
            label: 'Full-Time Employment Share',
            value: `${fullTimeRate}%`,
            detail: `${(fullTime / 1_000_000).toFixed(1)}M workers with >= 35 hrs/wk`,
            trend: 'positive',
          },
          {
            label: 'Part-Time Share',
            value: `${((partTime / employed) * 100).toFixed(1)}%`,
            detail: `${(partTime / 1_000_000).toFixed(1)}M (Voluntary & Economic)`,
            trend: 'neutral',
          },
          {
            label: 'Monthly Hiring Turnover Rate',
            value: `${hiresRate}%`,
            detail: 'Hires as share of total payrolls',
            trend: 'positive',
          },
          {
            label: 'Discharge / Layoff Rate',
            value: `${layoffRate}%`,
            detail: 'Involuntary separations per month',
            trend: 'positive',
          },
        ],
        highlightMetricIds: ['employed', 'hires', 'job_postings'],
        dimmedMetricIds: ['unemployed'],
      };
    }

    if (activeLens === 'unemployed') {
      const postingsPerUnemployed = (postings / unemployed).toFixed(2);
      const hiresAbsorbedPerMonth = ((hires / unemployed) * 100).toFixed(1);
      const layoffInflowRate = ((layoffs / unemployed) * 100).toFixed(1);

      return {
        primaryHeadline: 'Active Job Seekers & Unemployed Cohort',
        primaryValue: `${(unemployed / 1_000_000).toFixed(1)}M`,
        cohortShareOfPopulation: `${((unemployed / popTotal) * 100).toFixed(1)}% of US Population`,
        cohortShareOfLaborForce: `${snapshot.unemploymentRate}% Official U-3 Rate`,
        keyRatios: [
          {
            label: 'Postings per Job Seeker',
            value: `${postingsPerUnemployed}x`,
            detail: '7.74M open jobs vs 6.90M searching',
            trend: Number(postingsPerUnemployed) >= 1 ? 'positive' : 'negative',
          },
          {
            label: 'Monthly Market Absorption',
            value: `${hiresAbsorbedPerMonth}%`,
            detail: 'Total monthly hires relative to unemployed pool',
            trend: 'positive',
          },
          {
            label: 'Involuntary Inflow Pressure',
            value: `${layoffInflowRate}%`,
            detail: 'Monthly layoffs relative to unemployed pool',
            trend: 'negative',
          },
          {
            label: 'Median Duration of Search',
            value: '9.2 Wks',
            detail: '35.5% find work within 5 weeks',
            trend: 'neutral',
          },
        ],
        highlightMetricIds: ['unemployed', 'job_postings', 'layoffs'],
        dimmedMetricIds: ['employed'],
      };
    }

    // Default 'all'
    const laborParticipation = snapshot.participationRate;
    const employmentToPop = ((employed / popTotal) * 100).toFixed(1);

    return {
      primaryHeadline: 'Total US Population & Workforce Macro View',
      primaryValue: `${(popTotal / 1_000_000).toFixed(1)}M`,
      cohortShareOfPopulation: '100% Comprehensive US Resident Baseline',
      cohortShareOfLaborForce: `${laborParticipation}% Labor Force Participation`,
      keyRatios: [
        {
          label: 'Labor Participation Rate',
          value: `${laborParticipation}%`,
          detail: `${(laborForce / 1_000_000).toFixed(1)}M in active civilian labor force`,
          trend: 'neutral',
        },
        {
          label: 'Employment-to-Pop Ratio',
          value: `${employmentToPop}%`,
          detail: 'Proportion of total US residents working',
          trend: 'positive',
        },
        {
          label: 'Unemployment (U-3)',
          value: `${snapshot.unemploymentRate}%`,
          detail: 'Actively searching within 4 weeks',
          trend: 'positive',
        },
        {
          label: 'Market Tension Index',
          value: '1.12x',
          detail: 'Job openings per unemployed worker',
          trend: 'positive',
        },
      ],
      highlightMetricIds: ['us_population', 'employed', 'unemployed', 'job_postings', 'hires', 'layoffs'],
      dimmedMetricIds: [],
    };
  }, [snapshot, activeLens]);
}
