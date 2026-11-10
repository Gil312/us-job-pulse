import React from 'react';
import { LensMetricsSummary } from '../hooks/usePopulationLens';
import { Activity, Sparkles, TrendingUp, Info } from 'lucide-react';

interface PopulationCompositionBarProps {
  summary: LensMetricsSummary;
  employedCount: number;
  unemployedCount: number;
  totalPopulation: number;
  notInLaborForceCount: number;
}

export const PopulationCompositionBar: React.FC<PopulationCompositionBarProps> = ({
  summary,
  employedCount,
  unemployedCount,
  totalPopulation,
  notInLaborForceCount,
}) => {
  const employedPct = ((employedCount / totalPopulation) * 100).toFixed(1);
  const unemployedPct = ((unemployedCount / totalPopulation) * 100).toFixed(1);
  const otherPct = ((notInLaborForceCount / totalPopulation) * 100).toFixed(1);

  return (
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 border border-slate-800 shadow-xl transition-all">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              Active Population Lens Analysis
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
            {summary.primaryHeadline}: <span className="text-cyan-300">{summary.primaryValue}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {summary.cohortShareOfPopulation}
            </span>
            <span>•</span>
            <span className="font-medium text-slate-300">{summary.cohortShareOfLaborForce}</span>
          </div>
        </div>
      </div>

      {/* Visual Macro Population Stacked Composition Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 px-0.5">
          <span className="text-emerald-400">Employed: {(employedCount / 1_000_000).toFixed(1)}M ({employedPct}%)</span>
          <span className="text-amber-400">Unemployed: {(unemployedCount / 1_000_000).toFixed(1)}M ({unemployedPct}%)</span>
          <span className="text-slate-400">Not in Labor Force: {(notInLaborForceCount / 1_000_000).toFixed(1)}M ({otherPct}%)</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${employedPct}%` }}
            title={`Employed: ${employedPct}%`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${unemployedPct}%` }}
            title={`Unemployed: ${unemployedPct}%`}
          />
          <div
            className="bg-slate-700 h-full transition-all duration-500"
            style={{ width: `${otherPct}%` }}
            title={`Non-civilian or Not in labor force: ${otherPct}%`}
          />
        </div>
      </div>

      {/* Dynamic Key Ratios Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
        {summary.keyRatios.map((ratio, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>{ratio.label}</span>
              {ratio.trend === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
              {ratio.trend === 'neutral' && <Info className="w-3.5 h-3.5 text-slate-400" />}
              {ratio.trend === 'negative' && <TrendingUp className="w-3.5 h-3.5 text-rose-400 transform rotate-180" />}
            </div>
            <div className="text-lg sm:text-xl font-bold text-white mt-1">
              {ratio.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
              {ratio.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
