import React from 'react';
import { MetricCard } from './MetricCard';
import { MacroMetricId, USLaborMarketSnapshot } from '../types/labor';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';

interface MacroDashboardProps {
  data: USLaborMarketSnapshot;
  selectedMetricId: MacroMetricId | null;
  onSelectMetric: (id: MacroMetricId) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  data,
  selectedMetricId,
  onSelectMetric,
  lastUpdated,
  onRefresh,
}) => {
  // Ordered sequence of the 6 core macro cards
  const metricOrder: MacroMetricId[] = [
    'us_population',
    'employed',
    'unemployed',
    'job_postings',
    'hires',
    'layoffs',
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Macro Summary Bar */}
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
            US Labor Market Macro Dashboard
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
          return (
            <MetricCard
              key={metricId}
              metric={metric}
              isSelected={selectedMetricId === metricId}
              onSelect={onSelectMetric}
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
