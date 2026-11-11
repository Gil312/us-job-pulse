import React from 'react';
import { 
  Users, 
  Briefcase, 
  UserX, 
  FileText, 
  UserPlus, 
  UserMinus, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChevronRight,
  Filter
} from 'lucide-react';
import { MacroMetric, MacroMetricId, PopulationLens } from '../types/labor';

interface MetricCardProps {
  metric: MacroMetric;
  onSelect: (id: MacroMetricId) => void;
  isSelected?: boolean;
  activeLens?: PopulationLens;
  onQuickFilter?: (lens: PopulationLens) => void;
  isDimmed?: boolean;
  isHighlighted?: boolean;
  liveFlowBadge?: string | null;
}

const ICON_MAP = {
  us_population: Users,
  employed: Briefcase,
  unemployed: UserX,
  job_postings: FileText,
  hires: UserPlus,
  layoffs: UserMinus,
};

const COLOR_CLASSES = {
  blue: {
    border: 'border-blue-500/30 hover:border-blue-400/60',
    selected: 'ring-2 ring-blue-500 bg-blue-950/20',
    iconBg: 'bg-blue-500/10 text-blue-400',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    barFull: 'bg-blue-500',
  },
  emerald: {
    border: 'border-emerald-500/30 hover:border-emerald-400/60',
    selected: 'ring-2 ring-emerald-500 bg-emerald-950/20',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    barFull: 'bg-emerald-500',
  },
  amber: {
    border: 'border-amber-500/30 hover:border-amber-400/60',
    selected: 'ring-2 ring-amber-500 bg-amber-950/20',
    iconBg: 'bg-amber-500/10 text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    barFull: 'bg-amber-500',
  },
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-400/60',
    selected: 'ring-2 ring-cyan-500 bg-cyan-950/20',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    barFull: 'bg-cyan-500',
  },
  indigo: {
    border: 'border-indigo-500/30 hover:border-indigo-400/60',
    selected: 'ring-2 ring-indigo-500 bg-indigo-950/20',
    iconBg: 'bg-indigo-500/10 text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    barFull: 'bg-indigo-500',
  },
  rose: {
    border: 'border-rose-500/30 hover:border-rose-400/60',
    selected: 'ring-2 ring-rose-500 bg-rose-950/20',
    iconBg: 'bg-rose-500/10 text-rose-400',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    barFull: 'bg-rose-500',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({ 
  metric, 
  onSelect, 
  isSelected = false,
  activeLens = 'all',
  onQuickFilter,
  isDimmed = false,
  isHighlighted = false,
  liveFlowBadge = null,
}) => {
  const Icon = ICON_MAP[metric.id] || Users;
  const styleConfig = COLOR_CLASSES[metric.accentColor] || COLOR_CLASSES.blue;

  // Check if this card offers a direct front-dashboard quick-filter toggle
  const isFilterable = (metric.id === 'employed' || metric.id === 'unemployed' || metric.id === 'us_population') && onQuickFilter;
  const isCardActiveLens = 
    (metric.id === 'employed' && activeLens === 'employed') ||
    (metric.id === 'unemployed' && activeLens === 'unemployed') ||
    (metric.id === 'us_population' && activeLens === 'all');

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`metric-card-${metric.id}`}
      onClick={() => onSelect(metric.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(metric.id);
        }
      }}
      className={`relative group flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 backdrop-blur-sm border transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-950/30 ${
        styleConfig.border
      } ${isSelected ? styleConfig.selected : ''} ${
        isDimmed ? 'opacity-40 grayscale-[40%] scale-[0.98]' : 'opacity-100 scale-100'
      } ${
        isHighlighted && !isSelected ? 'ring-1 ring-cyan-500/50 bg-slate-900/95' : ''
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${styleConfig.iconBg} transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 tracking-wide uppercase group-hover:text-white transition-colors">
              {metric.title}
            </h3>
            <span className="text-xs text-slate-500">{metric.unit}</span>
          </div>
        </div>

        {/* Quick Filter Lens Pill or Click Micro indicator */}
        <div className="flex items-center gap-1.5">
          {isFilterable && (
            <button
              type="button"
              data-testid={`quick-lens-${metric.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (metric.id === 'employed') onQuickFilter?.('employed');
                else if (metric.id === 'unemployed') onQuickFilter?.('unemployed');
                else if (metric.id === 'us_population') onQuickFilter?.('all');
              }}
              title={`Switch dashboard lens to ${metric.shortLabel}`}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                isCardActiveLens
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{isCardActiveLens ? 'Active Lens' : 'Filter Lens'}</span>
            </button>
          )}

          <div className="flex items-center text-xs text-slate-400 group-hover:text-cyan-400 transition-colors ml-1">
            <span className="hidden sm:inline text-[11px] font-medium mr-1">Micro</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Primary Value Display */}
      <div className="my-3">
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {metric.formattedValue}
        </div>

        {/* Delta and direction badge */}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styleConfig.badge}`}>
            {metric.momDirection === 'up' && <TrendingUp className="w-3 h-3" />}
            {metric.momDirection === 'down' && <TrendingDown className="w-3 h-3" />}
            {metric.momDirection === 'flat' && <Minus className="w-3 h-3" />}
            {metric.momFormatted}
          </span>
          {liveFlowBadge && (
            <span
              data-testid={`live-badge-${metric.id}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tabular-nums"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {liveFlowBadge}
            </span>
          )}
        </div>
      </div>

      {/* Sub-segment Visualization (Special for Employed: Full-Time vs Part-Time) */}
      {metric.subSegments && metric.subSegments.fullTime && metric.subSegments.partTime && (
        <div className="mt-2 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1.5">
            <span className="text-emerald-400 font-medium">
              Full-Time: {metric.subSegments.fullTime.formatted} ({metric.subSegments.fullTime.percentage}%)
            </span>
            <span className="text-teal-300 font-medium">
              Part-Time: {metric.subSegments.partTime.formatted} ({metric.subSegments.partTime.percentage}%)
            </span>
          </div>

          {/* Visual Split Bar */}
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex" title="Employment split">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${metric.subSegments.fullTime.percentage}%` }}
            />
            <div 
              className="bg-teal-400 h-full transition-all duration-500" 
              style={{ width: `${metric.subSegments.partTime.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Description subtitle */}
      <p className="mt-2 text-xs text-slate-400 line-clamp-1">
        {metric.description}
      </p>
    </div>
  );
};
