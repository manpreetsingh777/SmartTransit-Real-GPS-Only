import React, { useState } from 'react';
import { useTransitStore } from '../store/useTransitStore';
import {
  Sparkles,
  X,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Radio,
  Zap,
  WifiOff,
  Navigation,
  CheckCircle2,
  Send
} from 'lucide-react';

export const DemoControlModal: React.FC = () => {
  const {
    demoModalOpen,
    setDemoModalOpen,
    triggerScenario,
    activeScenario,
    speedMultiplier,
    setSpeedMultiplier,
    isPaused,
    togglePause,
    buses,
    driverSession,
    toggleDriverOfflineSimulation,
    syncDriverQueue
  } = useTransitStore();

  const [selectedDemoBus, setSelectedDemoBus] = useState<string>('BUS-5081');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');

  if (!demoModalOpen) return null;

  const handleSyncTest = async () => {
    setSyncStatusMsg('Synchronizing queued offline records...');
    const res = await syncDriverQueue();
    if (res.success) {
      setSyncStatusMsg(`✅ Successfully synced ${res.synced} records to central dispatch!`);
    } else {
      setSyncStatusMsg('Sync completed.');
    }
    setTimeout(() => setSyncStatusMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0d121f] border border-[#1e293e] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-950/60 via-[#121828] to-[#121828] border-b border-[#1e293e] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base text-white tracking-wide">
                SIH Prototype Demo Control Studio
              </h3>
              <p className="text-xs text-slate-400">
                Trigger edge cases, corridor deviations & anomalies across 37 PSIT routes
              </p>
            </div>
          </div>

          <button
            onClick={() => setDemoModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Target Vehicle & Simulation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#121828] p-4 rounded-2xl border border-[#1e293e]">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Target PSIT Vehicle
              </label>
              <select
                value={selectedDemoBus}
                onChange={(e) => setSelectedDemoBus(e.target.value)}
                className="w-full bg-[#0d121f] border border-[#24314e] text-xs font-semibold rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bus {b.busNumber} • {b.driverName} ({b.routeName?.slice(0, 24)}...)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Simulation Multiplier
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 4, 8].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setSpeedMultiplier(mult)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      speedMultiplier === mult
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                        : 'bg-[#0d121f] text-slate-400 hover:text-white border border-[#24314e]'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
                <button
                  onClick={togglePause}
                  className="px-3 py-2 rounded-xl bg-[#0d121f] border border-[#24314e] text-slate-300 hover:text-white text-xs font-bold"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Test Scenarios Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Interactive Test Scenarios (1-Click Trigger)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Scenario 1: Normal Live Tracking */}
              <button
                onClick={() => triggerScenario('NORMAL', selectedDemoBus)}
                className={`p-4 rounded-2xl border text-left transition ${
                  activeScenario === 'NORMAL'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950'
                    : 'bg-[#121828] border-[#1e293e] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>1. Normal Tracking</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Smooth movement along designated Kanpur route corridor with live ETA countdown.
                </p>
              </button>

              {/* Scenario 2: GPS Failure */}
              <button
                onClick={() => triggerScenario('GPS_FAILURE', selectedDemoBus)}
                className={`p-4 rounded-2xl border text-left transition ${
                  activeScenario === 'GPS_FAILURE'
                    ? 'bg-orange-950/40 border-orange-500 shadow-lg shadow-orange-950'
                    : 'bg-[#121828] border-[#1e293e] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 text-orange-400 font-bold text-sm mb-1">
                  <Radio className="w-4 h-4" />
                  <span>2. GPS Signal Loss</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulate GPS antenna drop. System shows "GPS Unavailable" + signal age timer + admin alert.
                </p>
              </button>

              {/* Scenario 3: Route Corridor Deviation */}
              <button
                onClick={() => triggerScenario('ROUTE_DEVIATION', selectedDemoBus)}
                className={`p-4 rounded-2xl border text-left transition ${
                  activeScenario === 'ROUTE_DEVIATION'
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950'
                    : 'bg-[#121828] border-[#1e293e] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm mb-1">
                  <Navigation className="w-4 h-4" />
                  <span>3. Route Deviation</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bus deviates +400m into unassigned detour. Geofence fires "OUT OF ROUTE" incident.
                </p>
              </button>

              {/* Scenario 4: GPS Anomaly Detection */}
              <button
                onClick={() => triggerScenario('GPS_ANOMALY', selectedDemoBus)}
                className={`p-4 rounded-2xl border text-left transition ${
                  activeScenario === 'GPS_ANOMALY'
                    ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950'
                    : 'bg-[#121828] border-[#1e293e] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm mb-1">
                  <Zap className="w-4 h-4" />
                  <span>4. Velocity Anomaly</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Injects 385 km/h jump. Intelligence engine computes Anomaly Score (88/100) and reasons.
                </p>
              </button>

            </div>
          </div>

          {/* Scenario 5: Offline Queue & Sync */}
          <div className="bg-[#121828] p-4 rounded-2xl border border-[#1e293e] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <WifiOff className="w-4 h-4" />
                <span>5. Driver Offline Queue & Batch Synchronization</span>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#0d121f] text-slate-300">
                Pending: {driverSession.pendingRecordsCount} records
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Disconnect network to test local buffering. Reconnect and push batch synchronization to central server.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={toggleDriverOfflineSimulation}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  driverSession.isSimulatedOffline
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#0d121f] text-slate-300 hover:bg-slate-800 border border-[#24314e]'
                }`}
              >
                {driverSession.isSimulatedOffline ? '🔴 Disconnected (Offline)' : '🟢 Connected (Online)'}
              </button>

              <button
                onClick={handleSyncTest}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sync Buffered Records</span>
              </button>
            </div>

            {syncStatusMsg && (
              <div className="text-xs font-medium text-emerald-400 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800 animate-in fade-in">
                {syncStatusMsg}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#0a0e1a] border-t border-[#1e293e] flex items-center justify-between">
          <button
            onClick={() => triggerScenario('RESET_ALL')}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-rose-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All 37 Buses</span>
          </button>

          <button
            onClick={() => setDemoModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#1e293e] hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
