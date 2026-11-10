import React from 'react';
import { PopulationLens } from '../types/labor';
import { Globe2, Briefcase, UserX, Sparkles } from 'lucide-react';

interface PopulationLensBarProps {
  activeLens: PopulationLens;
  onLensChange: (lens: PopulationLens) => void;
  employedCount: string;
  unemployedCount: string;
  totalPopulation: string;
}

export const PopulationLensBar: React.FC<PopulationLensBarProps> = ({
  activeLens,
  onLensChange,
  employedCount,
  unemployedCount,
  totalPopulation,
}) => {
  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-2 sm:p-3 shadow-xl mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Label */}
        <div className="flex items-center gap-2 self-start sm:self-center px-1">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Population Realtime Lens
            </div>
            <div className="text-[11px] text-slate-400">
              Instant cohort cross-filtering & ratio re-indexing
            </div>
          </div>
        </div>

        {/* 3-Way Segmented Control */}
        <div 
          role="radiogroup" 
          aria-label="Population Lens Filter"
          className="grid grid-cols-3 gap-1.5 w-full sm:w-auto p-1 bg-slate-950/80 rounded-xl border border-slate-800/80"
        >
          {/* ALL POPULATION */}
          <button
            type="button"
            role="radio"
            aria-checked={activeLens === 'all'}
            data-testid="lens-btn-all"
            onClick={() => onLensChange('all')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 select-none ${
              activeLens === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 shrink-0" />
            <span>All Pop</span>
            <span className={`text-[10px] hidden md:inline px-1 py-0.2 rounded ${
              activeLens === 'all' ? 'bg-blue-500/40 text-blue-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {totalPopulation}
            </span>
          </button>

          {/* EMPLOYED */}
          <button
            type="button"
            role="radio"
            aria-checked={activeLens === 'employed'}
            data-testid="lens-btn-employed"
            onClick={() => onLensChange('employed')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 select-none ${
              activeLens === 'employed'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>Employed</span>
            <span className={`text-[10px] hidden md:inline px-1 py-0.2 rounded ${
              activeLens === 'employed' ? 'bg-emerald-500/40 text-emerald-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {employedCount}
            </span>
          </button>

          {/* UNEMPLOYED */}
          <button
            type="button"
            role="radio"
            aria-checked={activeLens === 'unemployed'}
            data-testid="lens-btn-unemployed"
            onClick={() => onLensChange('unemployed')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 select-none ${
              activeLens === 'unemployed'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserX className="w-3.5 h-3.5 shrink-0" />
            <span>Unemployed</span>
            <span className={`text-[10px] hidden md:inline px-1 py-0.2 rounded ${
              activeLens === 'unemployed' ? 'bg-amber-500/40 text-amber-100' : 'bg-slate-800 text-slate-400'
            }`}>
              {unemployedCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
