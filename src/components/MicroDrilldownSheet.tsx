import React, { useEffect, useState } from 'react';
import {
  X,
  BarChart3,
  Building2,
  Users2,
  CalendarRange,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  MacroMetric,
  MacroMetricId,
  MicroDimension,
  PopulationLens,
} from '../types/labor';
import { MicroBarChart } from './MicroBarChart';

interface MicroDrilldownSheetProps {
  metric: MacroMetric | null;
  allMetrics: Record<MacroMetricId, MacroMetric>;
  activeLens: PopulationLens;
  onClose: () => void;
  onSelectMetric: (id: MacroMetricId) => void;
}

const DIMENSION_TABS: Array<{
  id: MicroDimension;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'sector', label: 'Industry Sector', shortLabel: 'Sectors', icon: Building2 },
  { id: 'demographics', label: 'Work Type & Ages', shortLabel: 'Work Type', icon: Users2 },
  { id: 'trend12m', label: '12-Month Trend', shortLabel: '12M Trend', icon: CalendarRange },
];

const METRIC_ORDER: MacroMetricId[] = [
  'us_population',
  'employed',
  'unemployed',
  'job_postings',
  'hires',
  'layoffs',
];

function getLensMicroContext(metricId: MacroMetricId, activeLens: PopulationLens): string | null {
  if (activeLens === 'all') return null;

  if (activeLens === 'employed') {
    switch (metricId) {
      case 'employed':
        return 'Employed Lens Active: Highlighting Full-Time (83.5%) vs. Part-Time (16.5%) workforce structure.';
      case 'hires':
        return 'Employed Lens Active: 80.3% of monthly hires feed directly into Full-Time payrolls.';
      case 'job_postings':
        return 'Employed Lens Active: Showing active openings fueling career mobility across industries.';
      case 'layoffs':
        return 'Employed Lens Active: Monthly discharge risk equals ~1.00% of total employed payrolls.';
      default:
        return 'Employed Lens Active: Highlighting labor-force and prime-working-age segments.';
    }
  }

  switch (metricId) {
    case 'unemployed':
      return 'Unemployed Lens Active: 35.5% of job seekers find new roles in under 5 weeks.';
    case 'job_postings':
      return 'Unemployed Lens Active: 1.12 open roles available per active job seeker nationwide.';
    case 'layoffs':
      return 'Unemployed Lens Active: Tracking involuntary separations entering the job-seeker pool.';
    case 'hires':
      return 'Unemployed Lens Active: Monthly hires equal 78.6% of the current unemployed pool.';
    default:
      return 'Unemployed Lens Active: Viewing macro structure from the job-seeker perspective.';
  }
}

export const MicroDrilldownSheet: React.FC<MicroDrilldownSheetProps> = ({
  metric,
  allMetrics,
  activeLens,
  onClose,
  onSelectMetric,
}) => {
  const [dimension, setDimension] = useState<MicroDimension>('sector');

  useEffect(() => {
    if (!metric) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metric, onClose]);

  if (!metric) return null;

  const currentItems = metric.breakdown[dimension] ?? [];
  const lensContextNote = getLensMicroContext(metric.id, activeLens);
  const topSegment =
    dimension !== 'trend12m' && currentItems.length > 0
      ? [...currentItems].sort((a, b) => b.value - a.value)[0]
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center lg:items-stretch lg:justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="micro-sheet-title"
      data-testid="micro-drilldown-sheet"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        data-testid="micro-sheet-backdrop"
      />

      {/* Responsive Sheet / Drawer */}
      <div className="relative z-10 w-full max-h-[90vh] sm:max-w-2xl sm:mx-auto lg:mx-0 lg:max-w-2xl lg:h-full lg:max-h-full bg-slate-900 border-t sm:border lg:border-t-0 lg:border-l border-slate-700/80 rounded-t-3xl sm:rounded-3xl lg:rounded-none shadow-2xl flex flex-col overflow-hidden">
        {/* Mobile drag handle indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Sticky Sheet Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <BarChart3 className="w-3 h-3" />
                Micro Breakdown
              </span>
              <span className="text-xs text-slate-400">{metric.unit}</span>
            </div>

            <h2
              id="micro-sheet-title"
              className="text-xl sm:text-2xl font-bold text-white mt-1.5"
            >
              {metric.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2.5 mt-1">
              <span className="text-2xl font-black text-cyan-300">
                {metric.formattedValue}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {metric.momDirection === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {metric.momDirection === 'down' && <TrendingDown className="w-3 h-3 text-amber-400" />}
                {metric.momDirection === 'flat' && <Minus className="w-3 h-3 text-slate-400" />}
                {metric.momFormatted}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Micro View"
            data-testid="close-micro-sheet"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Active Population Lens Contextual Banner */}
          {lensContextNote && (
            <div
              data-testid="micro-lens-context"
              className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{lensContextNote}</span>
            </div>
          )}

          {/* Description + Leading Segment Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <p className="leading-relaxed">{metric.description}</p>
            {topSegment && (
              <div className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-200 font-medium">
                Top: <span className="text-cyan-300 font-bold">{topSegment.formattedValue}</span> ({topSegment.sharePercentage}%)
              </div>
            )}
          </div>

          {/* 3-Dimension Switcher Tabs */}
          <div
            role="tablist"
            aria-label="Micro breakdown dimensions"
            className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800"
          >
            {DIMENSION_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = dimension === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setDimension(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                  <span className="sm:hidden truncate">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Bar Chart Visualization */}
          <MicroBarChart
            items={currentItems}
            dimension={dimension}
            accentColor={metric.accentColor}
            activeLens={activeLens}
            metricId={metric.id}
          />
        </div>

        {/* Sticky Footer: Quick Switch Across All 6 Macro Metrics */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Switch Macro Metric
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {METRIC_ORDER.map((id) => {
              const item = allMetrics[id];
              const isCurrent = id === metric.id;
              return (
                <button
                  key={id}
                  type="button"
                  data-testid={`switch-metric-${id}`}
                  onClick={() => onSelectMetric(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {item.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
