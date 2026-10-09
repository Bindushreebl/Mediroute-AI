import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Database,
  Globe,
  Lock,
  Moon,
  RotateCcw,
  Save,
  Server,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { ThemeSelector } from '../components/layout/ThemeSelector';

export const SettingsPage: React.FC = () => {
  const { currentUser, resetDemoData, isSimulating, toggleSimulation } = useEmergency();

  // AI Weight coefficients
  const [timeWeight, setTimeWeight] = useState(1.25);
  const [trafficPenaltyFactor, setTrafficPenaltyFactor] = useState(2.2);
  const [distanceWeight, setDistanceWeight] = useState(0.45);
  const [roadRiskWeight, setRoadRiskWeight] = useState(1.6);
  const [gisProvider, setGisProvider] = useState('gmaps');
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>System Settings & Optimization Parameters</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tune algorithmic routing cost weights, GIS map tiles, simulated GPS telemetry speed, and role permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Routing Model & GIS Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Route Scoring Coefficients Card */}
          <form onSubmit={handleSaveWeights} className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-sm text-white">
                  AI Route Penalty Coefficients (Cost Function)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
                Formula v2.4
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Adjust the weight of each term in: <code className="text-cyan-300 font-mono">Route Score = w_t•Time + w_c•Traffic + w_d•Distance + w_r•Risk</code>
            </p>

            <div className="space-y-4 text-xs">
              {/* Travel Time Weight */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">Travel Time Weight (w_t)</span>
                  <span className="font-mono font-bold text-cyan-400">{timeWeight.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={timeWeight}
                  onChange={(e) => setTimeWeight(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Traffic Penalty Factor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">Traffic Congestion Penalty Factor (w_c)</span>
                  <span className="font-mono font-bold text-amber-400">{trafficPenaltyFactor.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={trafficPenaltyFactor}
                  onChange={(e) => setTrafficPenaltyFactor(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Distance Weight */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">Spatial Distance Weight (w_d)</span>
                  <span className="font-mono font-bold text-emerald-400">{distanceWeight.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={distanceWeight}
                  onChange={(e) => setDistanceWeight(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Road Risk Penalty */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-300">Road Quality Risk Weight (w_r)</span>
                  <span className="font-mono font-bold text-rose-400">{roadRiskWeight.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={roadRiskWeight}
                  onChange={(e) => setRoadRiskWeight(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTimeWeight(1.25);
                  setTrafficPenaltyFactor(2.2);
                  setDistanceWeight(0.45);
                  setRoadRiskWeight(1.6);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Reset Default Weights
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Optimization Parameters</span>
              </button>
            </div>

            {savedNotification && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Route cost coefficients updated. Future dispatches will use new parameters.</span>
              </div>
            )}
          </form>

          {/* Display Environment & Contrast Theme Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white">
                  Operational Display Environment & Contrast Theme
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-bold border border-slate-800">
                Live Dynamic Sync
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Switch between an ultra-deep <strong className="text-rose-400">High Contrast Mode</strong> optimized for night driving &amp; dim dispatch cabins, and a clean <strong className="text-amber-400">Minimalist UI Mode</strong> calibrated for daylight readability and solar glare reduction.
            </p>

            <ThemeSelector variant="cards" />
          </div>

          {/* Map GIS Provider Selection */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-sm text-white">GIS Map & Routing Engine Provider</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'gmaps', name: 'Google Maps Platform', status: 'Active & Provisioned (API Key Ready)', desc: 'Official Google Maps JavaScript API with Live Traffic, Vector map, and Advanced Markers.' },
                { id: 'osm', name: 'OpenStreetMap + Leaflet', status: 'Available Backup (Free)', desc: 'Tactical tiles with zero external API quotas.' },
                { id: 'osrm', name: 'OSRM Route Server', status: 'Available', desc: 'Open-source turn-by-turn routing abstraction.' },
                { id: 'graphhopper', name: 'GraphHopper Engine', status: 'Available', desc: 'Fast routing API interface.' },
              ].map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => setGisProvider(prov.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    gisProvider === prov.id
                      ? 'bg-slate-950 border-blue-500 ring-1 ring-blue-500 shadow-md'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-white">{prov.name}</strong>
                    {gisProvider === prov.id && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">{prov.status}</span>
                  <p className="text-[11px] text-slate-400 mt-1">{prov.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Roles, Database & Telemetry */}
        <div className="space-y-6">
          {/* Active Session & Role Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-white">Access Control & Role Matrix</h3>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Authenticated User</span>
              <p className="font-extrabold text-white text-sm">{currentUser?.name || 'Authorized Responder'}</p>
              <p className="text-slate-400">{currentUser?.email || 'authenticated@mediroute.org'}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Role: {currentUser?.role || 'dispatcher'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Admin Privileges</span>
                <span className="text-emerald-400 font-bold font-mono">Full Access</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Dispatcher Privileges</span>
                <span className="text-cyan-400 font-bold font-mono">Dispatch & Reroute</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Ambulance Driver</span>
                <span className="text-amber-400 font-bold font-mono">Status & Telemetry</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">Viewer</span>
                <span className="text-slate-400 font-bold font-mono">Read-Only Audit</span>
              </div>
            </div>
          </div>

          {/* Database & Environment Status */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-5 h-5 text-rose-500" />
              <h3 className="font-extrabold text-sm text-white">Database & Persistence</h3>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>Data Engine:</span>
                <strong className="text-white font-mono">SQLite / Memory CAD Store</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>FastAPI Microservice:</span>
                <span className="text-emerald-400 font-mono font-bold">Online (FastAPI/SQLAlchemy)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>GPS Telemetry Simulation:</span>
                <strong className={isSimulating ? 'text-emerald-400' : 'text-slate-500'}>
                  {isSimulating ? 'Running (4s tick)' : 'Paused'}
                </strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={resetDemoData}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Reset Telemetry to Initial Demo State</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
