import React, { useState } from 'react';
import {
  CitizenCheckInRecord,
  CitizenTallySummary,
} from '../types/labor';
import {
  Users,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface CitizenPulseComparisonBarProps {
  tally: CitizenTallySummary;
  userRecord: CitizenCheckInRecord | null;
  onOpenCheckIn: () => void;
  onReconfirmCheckIn?: () => void;
}

export const CitizenPulseComparisonBar: React.FC<CitizenPulseComparisonBarProps> = ({
  tally,
  userRecord,
  onOpenCheckIn,
  onReconfirmCheckIn,
}) => {
  const [showSupplyMismatch, setShowSupplyMismatch] = useState(false);

  // Check if user's check-in is past 30 days
  const isExpiringSoon = userRecord
    ? new Date(userRecord.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div
      data-testid="citizen-pulse-bar"
      className="mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/30 border border-slate-800 shadow-xl"
    >
      {/* 30-Day Soft-Expiry Banner */}
      {isExpiringSoon && onReconfirmCheckIn && (
        <div
          data-testid="reconfirm-banner"
          className="mb-3.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>It has been ~30 days since your check-in. Confirm your current status to keep the tally accurate.</span>
          </div>
          <button
            type="button"
            data-testid="reconfirm-action-btn"
            onClick={onReconfirmCheckIn}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
          >
            Confirm Status
          </button>
        </div>
      )}

      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Live Citizen Labor Barometer
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" />
                Crowdsourced Sample
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified anonymous self-reported check-ins directly from everyday US citizens.
            </p>
          </div>
        </div>

        {/* Action Button: Log or Edit Status */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {userRecord && (
            <span
              data-testid="user-active-badge"
              className="text-xs text-slate-300 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                You: {userRecord.status === 'working_fulltime' && 'Full-Time'}
                {userRecord.status === 'working_parttime' && 'Part-Time'}
                {userRecord.status === 'not_working_looking' && 'Searching'}
              </span>
            </span>
          )}

          <button
            type="button"
            data-testid="log-citizen-status-btn"
            onClick={onOpenCheckIn}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            {userRecord ? <RotateCcw className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span>{userRecord ? 'Update My Status' : 'Log Your Status'}</span>
          </button>
        </div>
      </div>

      {/* Visual Proportional Bar: Citizen Sample (Working vs Looking) */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-xs font-semibold mb-1 px-0.5">
          <span className="text-emerald-400">
            Working: {tally.workingCount.toLocaleString()} ({tally.workingPercentage.toFixed(1)}%)
          </span>
          <span className="text-slate-400">
            Sample: {tally.totalCheckIns.toLocaleString()} Citizens
          </span>
          <span className="text-amber-400">
            Looking: {tally.lookingCount.toLocaleString()} ({tally.lookingPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${tally.workingPercentage}%` }}
            title={`Working: ${tally.workingPercentage}%`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-500"
            style={{ width: `${tally.lookingPercentage}%` }}
            title={`Not Working & Looking: ${tally.lookingPercentage}%`}
          />
        </div>
      </div>

      {/* Mismatch & Benchmark Drill-Down Toggle */}
      <div className="pt-1">
        <button
          type="button"
          data-testid="toggle-mismatch-btn"
          onClick={() => setShowSupplyMismatch((prev) => !prev)}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>
            {showSupplyMismatch ? 'Hide' : 'View'} Citizen Desire vs. Official BLS Openings Mismatch
          </span>
          {showSupplyMismatch ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Expandable Mismatch Grid */}
        {showSupplyMismatch && (
          <div
            data-testid="mismatch-panel"
            className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span>Target Industry</span>
              <div className="flex gap-4">
                <span className="text-amber-400">Citizen Desire</span>
                <span className="text-cyan-400">BLS Openings Supply</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {tally.industryDemand.slice(0, 5).map((item) => {
                const diff = (item.demandPercentage - item.blsSupplyPercentage).toFixed(1);
                const isOvercrowded = Number(diff) > 2;

                return (
                  <div key={item.industryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{item.label}</span>
                      <div className="flex items-center gap-3 font-semibold text-[11px]">
                        <span className="text-amber-300">{item.demandPercentage}%</span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-cyan-300">{item.blsSupplyPercentage}%</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] ${
                            isOvercrowded
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {Number(diff) > 0 ? `+${diff}% Demand` : `${diff}% Demand`}
                        </span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-amber-400 h-full"
                        style={{ width: `${item.demandPercentage}%` }}
                      />
                      <div
                        className="bg-cyan-400 h-full opacity-60"
                        style={{ width: `${item.blsSupplyPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
