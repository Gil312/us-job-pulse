import React from 'react';
import { MetricCard } from './MetricCard';
import { PopulationLensBar } from './PopulationLensBar';
import { PopulationCompositionBar } from './PopulationCompositionBar';
import { MacroMetricId, PopulationLens, USLaborMarketSnapshot } from '../types/labor';
import { usePopulationLens } from '../hooks/usePopulationLens';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';

interface MacroDashboardProps {
  data: USLaborMarketSnapshot;
  selectedMetricId: MacroMetricId | null;
  onSelectMetric: (id: MacroMetricId) => void;
  activeLens: PopulationLens;
  onLensChange: (lens: PopulationLens) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  data,
  selectedMetricId,
  onSelectMetric,
  activeLens,
  onLensChange,
  lastUpdated,
  onRefresh,
}) => {
  const metricOrder: MacroMetricId[] = [
    'us_population',
    'employed',
    'unemployed',
    'job_postings',
    'hires',
    'layoffs',
  ];

  // Derive reactive cohort analysis and ratios based on activeLens
  const lensSummary = usePopulationLens(data, activeLens);

  // Compute other population (youth + not in labor force)
  const notInLaborForce = data.populationTotal - data.civilianLaborForce;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Front Dashboard Segmented Lens Bar */}
      <PopulationLensBar
        activeLens={activeLens}
        onLensChange={onLensChange}
        employedCount={data.metrics.employed.formattedValue}
        unemployedCount={data.metrics.unemployed.formattedValue}
        totalPopulation={data.metrics.us_population.formattedValue}
      />

      {/* Dynamic Population Composition & Key Ratios Bar */}
      <PopulationCompositionBar
        summary={lensSummary}
        employedCount={data.metrics.employed.headlineValue}
        unemployedCount={data.metrics.unemployed.headlineValue}
        totalPopulation={data.populationTotal}
        notInLaborForceCount={notInLaborForce}
      />

      {/* Top Macro Status Header */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Baseline
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {data.monthReported}
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Macro Metrics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {data.headlineSummary}
          </p>
        </div>

        {/* Vital stats pill */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Labor Force</div>
            <div className="text-sm font-bold text-white">{(data.civilianLaborForce / 1_000_000).toFixed(1)}M</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Unemployment</div>
            <div className="text-sm font-bold text-amber-400">{data.unemploymentRate}%</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Participation</div>
            <div className="text-sm font-bold text-cyan-400">{data.participationRate}%</div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              aria-label="Refresh Baseline Data"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Responsive Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {metricOrder.map((metricId) => {
          const metric = data.metrics[metricId];
          const isDimmed = lensSummary.dimmedMetricIds.includes(metricId);
          const isHighlighted = lensSummary.highlightMetricIds.includes(metricId);

          return (
            <MetricCard
              key={metricId}
              metric={metric}
              isSelected={selectedMetricId === metricId}
              onSelect={onSelectMetric}
              activeLens={activeLens}
              onQuickFilter={onLensChange}
              isDimmed={isDimmed}
              isHighlighted={isHighlighted}
            />
          );
        })}
      </div>

      {/* Attribution footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Source: {data.source}</span>
        </div>
        {lastUpdated && <span>Sync timestamp: {lastUpdated}</span>}
      </div>
    </section>
  );
};
