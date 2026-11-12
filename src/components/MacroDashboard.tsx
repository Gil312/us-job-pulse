import React, { useState } from 'react';
import { MetricCard } from './MetricCard';
import { PopulationLensBar } from './PopulationLensBar';
import { PopulationCompositionBar } from './PopulationCompositionBar';
import { LiveVelocityBanner } from './LiveVelocityBanner';
import { MicroDrilldownSheet } from './MicroDrilldownSheet';
import { MethodologyModal } from './MethodologyModal';
import { CitizenPulseComparisonBar } from './CitizenPulseComparisonBar';
import { CitizenCheckInModal } from './CitizenCheckInModal';
import {
  CitizenCheckInRecord,
  CitizenTallySummary,
  LivePulseMode,
  MacroMetricId,
  PopulationLens,
  USLaborMarketSnapshot,
} from '../types/labor';
import { usePopulationLens } from '../hooks/usePopulationLens';
import { useRealtimePulse } from '../hooks/useRealtimePulse';
import { useIsWideDesktop } from '../hooks/useIsWideDesktop';
import { Activity, ShieldCheck, RefreshCw, Columns2, RotateCcw } from 'lucide-react';

interface MacroDashboardProps {
  data: USLaborMarketSnapshot;
  selectedMetricId: MacroMetricId | null;
  onSelectMetric: (id: MacroMetricId) => void;
  onCloseMetric?: () => void;
  activeLens: PopulationLens;
  onLensChange: (lens: PopulationLens) => void;
  pulseMode?: LivePulseMode;
  onPulseModeChange?: (mode: LivePulseMode) => void;
  onResetPreferences?: () => void;
  citizenTally?: CitizenTallySummary;
  userCheckIn?: CitizenCheckInRecord | null;
  onSubmitCitizenCheckIn?: (record: CitizenCheckInRecord) => void;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  data,
  selectedMetricId,
  onSelectMetric,
  onCloseMetric,
  activeLens,
  onLensChange,
  pulseMode = 'snapshot',
  onPulseModeChange,
  onResetPreferences,
  citizenTally,
  userCheckIn = null,
  onSubmitCitizenCheckIn,
  lastUpdated,
  onRefresh,
}) => {
  const [internalPulseMode, setInternalPulseMode] = useState<LivePulseMode>(pulseMode);
  const [showCompare, setShowCompare] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const effectivePulseMode = onPulseModeChange ? pulseMode : internalPulseMode;
  const handlePulseModeChange = onPulseModeChange ?? setInternalPulseMode;

  const isWideDesktop = useIsWideDesktop(1280);
  const pulse = useRealtimePulse(data.runRatesPerSecond, effectivePulseMode);
  const lensSummary = usePopulationLens(data, activeLens);

  const metricOrder: MacroMetricId[] = [
    'us_population',
    'employed',
    'unemployed',
    'job_postings',
    'hires',
    'layoffs',
  ];

  const notInLaborForce = data.populationTotal - data.civilianLaborForce;
  const isSplitActive = isWideDesktop && selectedMetricId !== null;

  const getLiveBadgeForCard = (metricId: MacroMetricId): string | null => {
    if (effectivePulseMode === 'snapshot') return null;
    const suffix = effectivePulseMode === 'session' ? 'live' : 'today';
    if (metricId === 'hires') return `+${pulse.hiresDelta.toLocaleString('en-US')} ${suffix}`;
    if (metricId === 'job_postings') return `+${pulse.postingsDelta.toLocaleString('en-US')} ${suffix}`;
    if (metricId === 'layoffs') return `+${pulse.layoffsDelta.toLocaleString('en-US')} ${suffix}`;
    return null;
  };

  const handleCloseMicro = () => {
    if (onCloseMetric) {
      onCloseMetric();
    } else if (selectedMetricId) {
      onSelectMetric(selectedMetricId);
    }
  };

  const handleResetAll = () => {
    pulse.resetSession();
    setShowCompare(false);
    if (onResetPreferences) {
      onResetPreferences();
    } else {
      onLensChange('all');
      handlePulseModeChange('snapshot');
      if (selectedMetricId) handleCloseMicro();
    }
  };

  const hasNonDefaultState =
    activeLens !== 'all' ||
    effectivePulseMode !== 'snapshot' ||
    selectedMetricId !== null ||
    showCompare;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Live Velocity Ticker Banner */}
      <LiveVelocityBanner
        mode={effectivePulseMode}
        onModeChange={handlePulseModeChange}
        pulse={pulse}
        runRates={data.runRatesPerSecond}
        onOpenMethodology={() => setShowMethodology(true)}
      />

      {/* Live Citizen Labor Barometer & Check-In */}
      {citizenTally && (
        <CitizenPulseComparisonBar
          tally={citizenTally}
          userRecord={userCheckIn}
          onOpenCheckIn={() => setShowCheckInModal(true)}
          onReconfirmCheckIn={() => setShowCheckInModal(true)}
        />
      )}

      {/* Front Dashboard Segmented Lens Bar */}
      <PopulationLensBar
        activeLens={activeLens}
        onLensChange={onLensChange}
        employedCount={data.metrics.employed.formattedValue}
        unemployedCount={data.metrics.unemployed.formattedValue}
        totalPopulation={data.metrics.us_population.formattedValue}
      />

      {/* Dynamic Population Composition & Key Ratios Bar */}
      <PopulationCompositionBar
        summary={lensSummary}
        employedCount={data.metrics.employed.headlineValue}
        unemployedCount={data.metrics.unemployed.headlineValue}
        totalPopulation={data.populationTotal}
        notInLaborForceCount={notInLaborForce}
      />

      {/* Optional Side-by-Side Cohort Compare Drawer */}
      {showCompare && (
        <div
          data-testid="cohort-compare-panel"
          className="mb-6 p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/30 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
        >
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25">
            <div className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
              Employed Cohort
            </div>
            <div className="text-xl font-black text-white mt-1">
              {data.metrics.employed.formattedValue}
            </div>
            <div className="text-slate-300 mt-1">
              Full-Time: {data.metrics.employed.subSegments?.fullTime?.formatted} (
              {data.metrics.employed.subSegments?.fullTime?.percentage}%)
            </div>
            <div className="text-slate-400">
              Part-Time: {data.metrics.employed.subSegments?.partTime?.formatted} (
              {data.metrics.employed.subSegments?.partTime?.percentage}%)
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/25">
            <div className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
              Unemployed Cohort
            </div>
            <div className="text-xl font-black text-white mt-1">
              {data.metrics.unemployed.formattedValue}
            </div>
            <div className="text-slate-300 mt-1">
              Official U-3 Rate: {data.unemploymentRate}%
            </div>
            <div className="text-slate-400">
              1.12 open roles per active job seeker
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/25">
            <div className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
              Market Velocity Balance
            </div>
            <div className="text-xl font-black text-white mt-1">
              {data.metrics.job_postings.formattedValue} Open
            </div>
            <div className="text-slate-300 mt-1">
              Monthly Hires: {data.metrics.hires.formattedValue} ({data.runRatesPerSecond.hires}/sec)
            </div>
            <div className="text-slate-400">
              Monthly Layoffs: {data.metrics.layoffs.formattedValue} ({data.runRatesPerSecond.layoffs}/sec)
            </div>
          </div>
        </div>
      )}

      {/* Top Macro Status Header */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {effectivePulseMode === 'snapshot' ? 'Live Baseline' : 'Realtime Pulse'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {data.monthReported}
            </span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            Macro Metrics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {data.headlineSummary}
          </p>
        </div>

        {/* Vital stats pill + Compare & Reset utility */}
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

          <button
            type="button"
            data-testid="compare-cohorts-btn"
            onClick={() => setShowCompare((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              showCompare
                ? 'bg-cyan-600 text-white border-cyan-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Compare Employed vs Unemployed cohorts side by side"
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>

          {hasNonDefaultState && (
            <button
              type="button"
              data-testid="reset-view-btn"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Reset lens, ticker, and selection"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

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

      {/* Main Content: Responsive Split-Screen on Wide Desktop (xl:) when inspecting Micro */}
      <div
        data-testid="dashboard-workspace"
        className={isSplitActive ? 'grid grid-cols-1 xl:grid-cols-12 gap-6 items-start' : ''}
      >
        <div
          className={
            isSplitActive
              ? 'xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
          }
        >
          {metricOrder.map((metricId) => {
            const metric = data.metrics[metricId];
            const isDimmed = lensSummary.dimmedMetricIds.includes(metricId);
            const isHighlighted = lensSummary.highlightMetricIds.includes(metricId);

            return (
              <MetricCard
                key={metricId}
                metric={metric}
                isSelected={selectedMetricId === metricId}
                onSelect={onSelectMetric}
                activeLens={activeLens}
                onQuickFilter={onLensChange}
                isDimmed={isDimmed}
                isHighlighted={isHighlighted}
                liveFlowBadge={getLiveBadgeForCard(metricId)}
              />
            );
          })}
        </div>

        {/* Desktop Split-Screen Micro Inspector */}
        {isSplitActive && selectedMetricId && (
          <div className="xl:col-span-5">
            <MicroDrilldownSheet
              variant="inline"
              metric={data.metrics[selectedMetricId]}
              allMetrics={data.metrics}
              activeLens={activeLens}
              onClose={handleCloseMicro}
              onSelectMetric={onSelectMetric}
            />
          </div>
        )}
      </div>

      {/* Attribution footer */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 px-1">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Source: {data.source}</span>
          <button
            type="button"
            onClick={() => setShowMethodology(true)}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
          >
            View Proof &amp; Series IDs
          </button>
        </div>
        {lastUpdated && <span>Sync timestamp: {lastUpdated}</span>}
      </div>

      {/* Data Proof & Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodology}
        onClose={() => setShowMethodology(false)}
        data={data}
      />

      {/* Citizen Check-In Modal */}
      <CitizenCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        currentRecord={userCheckIn}
        onSubmitCheckIn={(record) => {
          if (onSubmitCitizenCheckIn) onSubmitCitizenCheckIn(record);
        }}
      />

      {/* Mobile / Standard Viewport Overlay Sheet */}
      {!isWideDesktop && (
        <MicroDrilldownSheet
          variant="overlay"
          metric={selectedMetricId ? data.metrics[selectedMetricId] : null}
          allMetrics={data.metrics}
          activeLens={activeLens}
          onClose={handleCloseMicro}
          onSelectMetric={onSelectMetric}
        />
      )}
    </section>
  );
};
