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
  ChevronRight 
} from 'lucide-react';
import { MacroMetric, MacroMetricId } from '../types/labor';

interface MetricCardProps {
  metric: MacroMetric;
  onSelect: (id: MacroMetricId) => void;
  isSelected?: boolean;
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

export const MetricCard: React.FC<MetricCardProps> = ({ metric, onSelect, isSelected = false }) => {
  const Icon = ICON_MAP[metric.id] || Users;
  const styleConfig = COLOR_CLASSES[metric.accentColor] || COLOR_CLASSES.blue;

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
      className={`relative group flex flex-col justify-between p-5 rounded-2xl bg-slate-900/80 backdrop-blur-sm border transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-950/30 ${
        styleConfig.border
      } ${isSelected ? styleConfig.selected : ''}`}
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

        {/* Click indicator badge */}
        <div className="flex items-center text-xs text-slate-400 group-hover:text-cyan-400 transition-colors">
          <span className="hidden sm:inline text-[11px] font-medium mr-1">Micro</span>
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Primary Value Display */}
      <div className="my-3">
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          {metric.formattedValue}
        </div>

        {/* Delta and direction badge */}
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styleConfig.badge}`}>
            {metric.momDirection === 'up' && <TrendingUp className="w-3 h-3" />}
            {metric.momDirection === 'down' && <TrendingDown className="w-3 h-3" />}
            {metric.momDirection === 'flat' && <Minus className="w-3 h-3" />}
            {metric.momFormatted}
          </span>
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
