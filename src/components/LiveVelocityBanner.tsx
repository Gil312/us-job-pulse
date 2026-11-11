import React from 'react';
import { LivePulseMode, USLaborMarketSnapshot } from '../types/labor';
import { RealtimePulseState } from '../hooks/useRealtimePulse';
import { Radio, Clock, CalendarClock, RotateCcw, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LiveVelocityBannerProps {
  mode: LivePulseMode;
  onModeChange: (mode: LivePulseMode) => void;
  pulse: RealtimePulseState;
  runRates: USLaborMarketSnapshot['runRatesPerSecond'];
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

export const LiveVelocityBanner: React.FC<LiveVelocityBannerProps> = ({
  mode,
  onModeChange,
  pulse,
  runRates,
}) => {
  const isLive = mode !== 'snapshot';

  const modeTabs: Array<{
    id: LivePulseMode;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'snapshot', label: 'Official BLS Snapshot', shortLabel: 'Snapshot', icon: Radio },
    { id: 'session', label: 'Live Session Ticker', shortLabel: 'Live Session', icon: Zap },
    { id: 'today', label: "Today's US Labor Flow", shortLabel: "Today's Flow", icon: CalendarClock },
  ];

  return (
    <div
      data-testid="live-velocity-banner"
      className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg"
    >
      {/* Top Bar: Label + Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`p-2 rounded-xl border ${
              isLive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-cyan-400 border-slate-700'
            }`}
          >
            <Zap className={`w-4 h-4 ${isLive ? 'animate-pulse' : ''}`} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Realtime US Velocity Ticker
              </span>
              {mode === 'session' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Clock className="w-2.5 h-2.5" />
                  {formatElapsed(pulse.elapsedSessionSeconds)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {mode === 'snapshot' &&
                `Verified BLS/JOLTS monthly run-rate (~${runRates.hires}/sec hires, ~${runRates.layoffs}/sec layoffs)`}
              {mode === 'session' &&
                'Live cumulative US labor events ticking since your session started'}
              {mode === 'today' &&
                'Estimated cumulative US workforce flows since 12:00 AM local time'}
            </p>
          </div>
        </div>

        {/* 3-Way Mode Switcher + Session Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            role="radiogroup"
            aria-label="Realtime Velocity Mode"
            className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 flex-1 sm:flex-none"
          >
            {modeTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  data-testid={`pulse-mode-${tab.id}`}
                  onClick={() => onModeChange(tab.id)}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">{tab.label}</span>
                  <span className="md:hidden whitespace-nowrap">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {mode === 'session' && (
            <button
              type="button"
              data-testid="reset-session-pulse"
              onClick={pulse.resetSession}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Reset live session ticker to zero"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zero</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Live Ticker Readout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Hires */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">US Hires</div>
            <div
              data-testid="ticker-hires-value"
              className="text-base sm:text-lg font-extrabold text-indigo-300 tabular-nums"
            >
              {mode === 'snapshot' ? `${runRates.hires}/sec` : `+${formatNumber(pulse.hiresDelta)}`}
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>

        {/* Postings */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">New Postings</div>
            <div
              data-testid="ticker-postings-value"
              className="text-base sm:text-lg font-extrabold text-cyan-300 tabular-nums"
            >
              {mode === 'snapshot'
                ? `${runRates.postingsAdded}/sec`
                : `+${formatNumber(pulse.postingsDelta)}`}
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-cyan-400 shrink-0" />
        </div>

        {/* Layoffs */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Layoffs</div>
            <div
              data-testid="ticker-layoffs-value"
              className="text-base sm:text-lg font-extrabold text-rose-300 tabular-nums"
            >
              {mode === 'snapshot'
                ? `${runRates.layoffs}/sec`
                : `+${formatNumber(pulse.layoffsDelta)}`}
            </div>
          </div>
          <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
        </div>

        {/* Net Workforce Flow */}
        <div className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Net Payroll Flow</div>
            <div
              data-testid="ticker-net-value"
              className="text-base sm:text-lg font-extrabold text-emerald-400 tabular-nums"
            >
              {mode === 'snapshot'
                ? `+${(runRates.hires - runRates.layoffs).toFixed(2)}/sec`
                : `+${formatNumber(pulse.netWorkforceFlow)}`}
            </div>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Net
          </span>
        </div>
      </div>
    </div>
  );
};
