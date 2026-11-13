import { useState, useEffect } from 'react';
import { US_LABOR_BASELINE } from './data/usLaborBaseline';
import { INITIAL_CITIZEN_TALLY } from './data/citizenBaseline';
import { fetchLiveCitizenTally, submitCitizenCheckInToDb } from './lib/supabase';
import { MacroDashboard } from './components/MacroDashboard';
import { usePersistentState } from './hooks/usePersistentState';
import {
  CitizenCheckInRecord,
  CitizenTallySummary,
  LivePulseMode,
  MacroMetricId,
  PopulationLens,
} from './types/labor';
import { Activity } from 'lucide-react';

const ALLOWED_LENSES: readonly PopulationLens[] = ['all', 'employed', 'unemployed'];
const ALLOWED_PULSE_MODES: readonly LivePulseMode[] = ['snapshot', 'session', 'today'];

export function App() {
  const [data, setData] = useState(US_LABOR_BASELINE);
  const [selectedMetricId, setSelectedMetricId] = useState<MacroMetricId | null>(null);

  // Auto-fetch latest static synced snapshot if available
  useEffect(() => {
    fetch('/data/latest.json')
      .then((res) => {
        if (!res.ok) throw new Error('No synced snapshot found');
        return res.json();
      })
      .then((remoteSnapshot) => {
        if (remoteSnapshot && remoteSnapshot.metrics) {
          setData(remoteSnapshot);
        }
      })
      .catch(() => {
        // Silently use built-in baseline if offline or running in local test mode
      });
  }, []);
  const [activeLens, setActiveLens, resetLens] = usePersistentState<PopulationLens>(
    'usjp_population_lens',
    'all',
    ALLOWED_LENSES
  );
  const [pulseMode, setPulseMode, resetPulseMode] = usePersistentState<LivePulseMode>(
    'usjp_pulse_mode',
    'snapshot',
    ALLOWED_PULSE_MODES
  );

  // Local persistent state for the citizen check-in record
  const [userCheckIn, setUserCheckIn] = useState<CitizenCheckInRecord | null>(() => {
    try {
      const stored = window.localStorage.getItem('usjp_citizen_record');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [citizenTally, setCitizenTally] = useState<CitizenTallySummary>(INITIAL_CITIZEN_TALLY);

  // Load live crowdsourced database tally from Supabase on mount
  useEffect(() => {
    fetchLiveCitizenTally().then((liveTally) => {
      setCitizenTally(liveTally);
    });
  }, []);

  useEffect(() => {
    if (userCheckIn) {
      try {
        window.localStorage.setItem('usjp_citizen_record', JSON.stringify(userCheckIn));
      } catch {
        // Ignore storage error
      }
    }
  }, [userCheckIn]);

  const handleSubmitCheckIn = (record: CitizenCheckInRecord) => {
    setUserCheckIn(record);

    // Save to PostgreSQL database via Supabase
    submitCitizenCheckInToDb(record).then((success) => {
      if (success) {
        // Re-fetch fresh aggregate from database
        fetchLiveCitizenTally().then(setCitizenTally);
      }
    });

    // Optimistically update the live citizen tally on screen immediately
    setCitizenTally((prev) => {
      const isWorking = record.status.startsWith('working');
      const newTotal = prev.totalCheckIns + (userCheckIn ? 0 : 1);
      const newWorking = prev.workingCount + (isWorking ? (userCheckIn?.status.startsWith('working') ? 0 : 1) : 0);
      const newLooking = prev.lookingCount + (!isWorking ? (!userCheckIn || userCheckIn.status.startsWith('working') ? 1 : 0) : 0);

      return {
        ...prev,
        totalCheckIns: newTotal,
        workingCount: newWorking,
        workingPercentage: (newWorking / newTotal) * 100,
        lookingCount: newLooking,
        lookingPercentage: (newLooking / newTotal) * 100,
      };
    });
  };

  const handleSelectMetric = (id: MacroMetricId) => {
    setSelectedMetricId(id);
  };

  const handleCloseMetric = () => {
    setSelectedMetricId(null);
  };

  const handleResetPreferences = () => {
    resetLens();
    resetPulseMode();
    setSelectedMetricId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Mobile/Desktop Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
              US
            </div>
            <div>
              <div className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base sm:text-lg">
                US Job Pulse
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Realtime US Population & Employment Velocity Monitor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              {activeLens === 'all' && 'All US Pop'}
              {activeLens === 'employed' && 'Employed Cohort'}
              {activeLens === 'unemployed' && 'Unemployed Cohort'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        <MacroDashboard
          data={data}
          selectedMetricId={selectedMetricId}
          onSelectMetric={handleSelectMetric}
          onCloseMetric={handleCloseMetric}
          activeLens={activeLens}
          onLensChange={setActiveLens}
          pulseMode={pulseMode}
          onPulseModeChange={setPulseMode}
          onResetPreferences={handleResetPreferences}
          citizenTally={citizenTally}
          userCheckIn={userCheckIn}
          onSubmitCitizenCheckIn={handleSubmitCheckIn}
          lastUpdated={new Date().toLocaleTimeString()}
        />
      </main>
    </div>
  );
}

export default App;
