import { useState } from 'react';
import { US_LABOR_BASELINE } from './data/usLaborBaseline';
import { MacroDashboard } from './components/MacroDashboard';
import { MacroMetricId, PopulationLens } from './types/labor';
import { Activity } from 'lucide-react';

export function App() {
  const [data] = useState(US_LABOR_BASELINE);
  const [selectedMetricId, setSelectedMetricId] = useState<MacroMetricId | null>(null);
  const [activeLens, setActiveLens] = useState<PopulationLens>('all');

  const handleSelectMetric = (id: MacroMetricId) => {
    setSelectedMetricId(id);
  };

  const handleCloseMetric = () => {
    setSelectedMetricId(null);
  };

  const handleLensChange = (lens: PopulationLens) => {
    setActiveLens(lens);
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
          onLensChange={handleLensChange}
          lastUpdated={new Date().toLocaleTimeString()}
        />
      </main>
    </div>
  );
}

export default App;
