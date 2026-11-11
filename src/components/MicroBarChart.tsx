import React, { useMemo } from 'react';
import { MacroMetric, MicroBarItem, MicroDimension, PopulationLens } from '../types/labor';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface MicroBarChartProps {
  items: MicroBarItem[];
  dimension: MicroDimension;
  accentColor: MacroMetric['accentColor'];
  activeLens: PopulationLens;
  metricId: MacroMetric['id'];
}

const ACCENT_BAR_CLASSES: Record<
  MacroMetric['accentColor'],
  { bar: string; barMuted: string; highlightText: string; badge: string }
> = {
  blue: {
    bar: 'bg-gradient-to-r from-blue-600 to-cyan-400',
    barMuted: 'bg-blue-500/40',
    highlightText: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  emerald: {
    bar: 'bg-gradient-to-r from-emerald-600 to-teal-400',
    barMuted: 'bg-emerald-500/40',
    highlightText: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  amber: {
    bar: 'bg-gradient-to-r from-amber-600 to-yellow-400',
    barMuted: 'bg-amber-500/40',
    highlightText: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  cyan: {
    bar: 'bg-gradient-to-r from-cyan-600 to-sky-400',
    barMuted: 'bg-cyan-500/40',
    highlightText: 'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  indigo: {
    bar: 'bg-gradient-to-r from-indigo-600 to-violet-400',
    barMuted: 'bg-indigo-500/40',
    highlightText: 'text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  rose: {
    bar: 'bg-gradient-to-r from-rose-600 to-pink-400',
    barMuted: 'bg-rose-500/40',
    highlightText: 'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
};

const LENS_HIGHLIGHT_IDS: Record<PopulationLens, Set<string>> = {
  all: new Set(),
  employed: new Set([
    'civ_labor_force',
    'age_prime',
    'ft_standard',
    'pt_voluntary',
    'pt_economic',
    'hire_full',
    'hire_part',
    'sec_health',
    'sec_prof',
  ]),
  unemployed: new Set([
    'dur_short',
    'dur_mid',
    'dur_long',
    'dur_chronic',
    'un_service',
    'un_sales',
    'post_health',
    'post_prof',
    'lay_downsize',
    'lay_prof',
  ]),
};

export const MicroBarChart: React.FC<MicroBarChartProps> = ({
  items,
  dimension,
  accentColor,
  activeLens,
}) => {
  const palette = ACCENT_BAR_CLASSES[accentColor] || ACCENT_BAR_CLASSES.cyan;
  const lensHighlights = LENS_HIGHLIGHT_IDS[activeLens];

  const { maxVal, minVal, sortedItems } = useMemo(() => {
    if (items.length === 0) {
      return { maxVal: 1, minVal: 0, sortedItems: [] as MicroBarItem[] };
    }
    const values = items.map((item) => item.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values);
    const ordered =
      dimension === 'trend12m'
        ? items
        : [...items].sort((a, b) => b.value - a.value);
    return { maxVal: max, minVal: min, sortedItems: ordered };
  }, [items, dimension]);

  if (sortedItems.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400 rounded-xl bg-slate-950/50 border border-slate-800">
        No breakdown data available for this dimension.
      </div>
    );
  }

  // Vertical Bar Chart for 12-Month Historical Trend
  if (dimension === 'trend12m') {
    const floor = Math.max(0, minVal * 0.85);
    const range = Math.max(maxVal - floor, 0.01);
    const first = sortedItems[0];
    const latest = sortedItems[sortedItems.length - 1];
    const netDiff = latest.value - first.value;
    const netPct = first.value !== 0 ? ((netDiff / first.value) * 100).toFixed(1) : '0.0';

    return (
      <div data-testid="micro-barchart-trend12m" className="space-y-4">
        {/* Trend Summary Strip */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">12M Start</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{first.formattedValue}</div>
            <div className="text-[10px] text-slate-500">{first.label}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Latest</div>
            <div className={`text-sm font-bold mt-0.5 ${palette.highlightText}`}>{latest.formattedValue}</div>
            <div className="text-[10px] text-slate-500">{latest.label}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] uppercase text-slate-400 font-semibold">12M Net</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {netDiff >= 0 ? '+' : ''}
              {netPct}%
            </div>
            <div className="text-[10px] text-slate-500">YoY momentum</div>
          </div>
        </div>

        {/* Vertical Columns Chart */}
        <div
          role="img"
          aria-label="12-month historical bar chart"
          className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80"
        >
          <div className="h-52 flex items-end justify-between gap-1.5 sm:gap-2.5 pt-6">
            {sortedItems.map((item, idx) => {
              const heightPct = Math.max(18, Math.round(((item.value - floor) / range) * 100));
              const isLatest = idx === sortedItems.length - 1;
              const isPeak = item.value === maxVal;

              return (
                <div
                  key={item.id}
                  data-testid={`micro-bar-${item.id}`}
                  className="flex-1 h-full flex flex-col items-center justify-end group"
                >
                  {/* Value above bar */}
                  <span
                    className={`text-[10px] font-semibold mb-1.5 transition-opacity ${
                      isLatest || isPeak
                        ? 'text-white opacity-100'
                        : 'text-slate-400 opacity-0 sm:opacity-75 group-hover:opacity-100'
                    }`}
                  >
                    {item.formattedValue}
                  </span>

                  {/* Bar track & column */}
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 ${
                        isLatest ? palette.bar : `${palette.barMuted} group-hover:opacity-90`
                      } ${isLatest ? 'ring-1 ring-white/30 shadow-lg' : ''}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${item.label}: ${item.formattedValue}`}
                    />
                  </div>

                  {/* Month label */}
                  <span
                    className={`mt-2 text-[9px] sm:text-[10px] font-medium tracking-tighter truncate max-w-full ${
                      isLatest ? palette.highlightText : 'text-slate-500'
                    }`}
                  >
                    {item.label.replace(' 20', ' ').replace(' ', '\n').split('\n')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal Ranked Bar Chart for Industry Sector & Demographics
  return (
    <div data-testid={`micro-barchart-${dimension}`} className="space-y-3">
      {sortedItems.map((item, index) => {
        const widthPct = Math.max(4, Math.round((item.value / maxVal) * 100));
        const isLensMatch = activeLens !== 'all' && lensHighlights.has(item.id);

        return (
          <div
            key={item.id}
            data-testid={`micro-bar-${item.id}`}
            className={`p-3 rounded-xl border transition-all ${
              isLensMatch
                ? 'bg-slate-900/95 border-cyan-500/40 shadow-md shadow-cyan-950/20'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {/* Row Header: Rank + Label + Value */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 w-4 shrink-0">
                    #{index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                    {item.label}
                  </span>
                  {isLensMatch && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      <Sparkles className="w-2.5 h-2.5" />
                      {activeLens === 'employed' ? 'Employed Focus' : 'Seeker Focus'}
                    </span>
                  )}
                </div>
                {item.subLabel && (
                  <p className="text-[11px] text-slate-400 mt-0.5 pl-5">{item.subLabel}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm sm:text-base font-extrabold text-white">
                  {item.formattedValue}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {item.sharePercentage.toFixed(1)}%
                  </span>
                  {typeof item.deltaMoM === 'number' && (
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        item.deltaType === 'positive'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : item.deltaType === 'negative'
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.deltaMoM > 0 && <TrendingUp className="w-2.5 h-2.5" />}
                      {item.deltaMoM < 0 && <TrendingDown className="w-2.5 h-2.5" />}
                      {item.deltaMoM === 0 && <Minus className="w-2.5 h-2.5" />}
                      {item.deltaMoM > 0 ? `+${item.deltaMoM}%` : `${item.deltaMoM}%`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Proportional Animated Bar */}
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className={`h-full rounded-full transition-all duration-500 ${palette.bar}`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
