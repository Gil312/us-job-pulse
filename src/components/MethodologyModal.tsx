import React, { useEffect } from 'react';
import { X, ShieldCheck, Calculator, Database, AlertCircle } from 'lucide-react';
import { USLaborMarketSnapshot } from '../types/labor';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: USLaborMarketSnapshot;
}

const OFFICIAL_SERIES = [
  { metric: 'US Total Population', source: 'US Census Bureau / CPS Base', seriesId: 'POPTHM' },
  { metric: 'Employed (Full-Time & Part-Time)', source: 'BLS Current Population Survey', seriesId: 'CE16OV' },
  { metric: 'Unemployed & U-3 Rate', source: 'BLS Current Population Survey', seriesId: 'UNEMPLOY / UNRATE' },
  { metric: 'Job Postings & Openings', source: 'BLS JOLTS Monthly Release', seriesId: 'JTSJOL' },
  { metric: 'Monthly Hires', source: 'BLS JOLTS Monthly Release', seriesId: 'JTSHIL' },
  { metric: 'Layoffs & Discharges', source: 'BLS JOLTS Monthly Release', seriesId: 'JTSLDL' },
];

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="methodology-title"
      data-testid="methodology-modal"
    >
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        data-testid="methodology-backdrop"
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[88vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 id="methodology-title" className="text-lg font-bold text-white">
                Data Proof & Methodology
              </h2>
              <p className="text-xs text-slate-400">
                How official BLS/JOLTS baselines and estimated live flows work
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Methodology"
            data-testid="close-methodology-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm text-slate-300">
          {/* Transparency Notice */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-amber-200 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Transparency Note:</span> No US federal agency publishes
              live millisecond hiring or layoff feeds. The <strong>Live Session</strong> and{' '}
              <strong>Today&apos;s Flow</strong> counters are estimated pace visualizations derived
              from monthly BLS/JOLTS totals—similar to the US Debt Clock. Currently, the baseline
              dataset uses a local snapshot ({data.monthReported}) ready for live BLS/FRED API
              synchronization.
            </div>
          </div>

          {/* Run-Rate Math */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Calculator className="w-4 h-4" />
              Estimated Per-Second Run-Rate Formula
            </div>
            <p className="text-xs text-slate-400">
              Each monthly JOLTS flow total is divided by seconds in a standard month (~2,592,000s)
              to project continuous daily &amp; session pace:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Hires Pace</div>
                <div className="font-bold text-indigo-300 mt-0.5">
                  {data.runRatesPerSecond.hires} / sec
                </div>
                <div className="text-[11px] text-slate-500">5.42M mo ÷ ~2.6M sec</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Layoffs Pace</div>
                <div className="font-bold text-rose-300 mt-0.5">
                  {data.runRatesPerSecond.layoffs} / sec
                </div>
                <div className="text-[11px] text-slate-500">1.61M mo ÷ ~2.6M sec</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Postings Replenished</div>
                <div className="font-bold text-cyan-300 mt-0.5">
                  {data.runRatesPerSecond.postingsAdded} / sec
                </div>
                <div className="text-[11px] text-slate-500">Active JOLTS turnover pace</div>
              </div>
            </div>
          </div>

          {/* Official Series Mapping */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Database className="w-4 h-4" />
              Official BLS / FRED Series Mapping
            </div>
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2">Metric</th>
                    <th className="px-3 py-2">Primary Agency / Survey</th>
                    <th className="px-3 py-2">FRED / BLS ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/50">
                  {OFFICIAL_SERIES.map((row) => (
                    <tr key={row.seriesId}>
                      <td className="px-3 py-2 font-semibold text-slate-200">{row.metric}</td>
                      <td className="px-3 py-2 text-slate-400">{row.source}</td>
                      <td className="px-3 py-2 font-mono text-cyan-300">{row.seriesId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
