import React, { useState } from 'react';
import { AlertTriangle, Play, Pause, RotateCcw, Zap, ChevronDown, ChevronUp, Crosshair, MapPin } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';

export const DemoNotice: React.FC = () => {
  const {
    isSimulating,
    toggleSimulation,
    resetDemoData,
    triggerSimulatedTrafficIncident,
    userLiveLocation,
    userLocationAddress,
    selectedDistrict,
    detectLiveLocation,
  } = useEmergency();
  const [collapsed, setCollapsed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = async () => {
    setIsLocating(true);
    await detectLiveLocation();
    setIsLocating(false);
  };

  return (
    <aside aria-label="Demo environment notice" className="bg-slate-900/95 border-b border-amber-500/30 text-xs px-4 py-2 text-slate-300 relative z-30 shadow-md backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
            KARNATAKA 108 CAD • DEMO PROTOTYPE
          </span>

          {/* District / Live Location Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span className="text-slate-400">Jurisdiction:</span>
            <strong className="text-white">{userLocationAddress ? userLocationAddress.split(',')[0] : selectedDistrict}</strong>
          </div>

          {!collapsed && (
            <p className="hidden md:inline text-slate-400">
              Evaluates live GPS proximity to real Karnataka hospitals & 108 Arogya Kavacha dispatch.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Quick Live GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/50 transition-all active:scale-95 disabled:opacity-50"
            title="Detect my real-time GPS location"
          >
            <Crosshair className={`w-3.5 h-3.5 text-cyan-400 ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isLocating ? 'Locking GPS...' : userLiveLocation ? 'GPS Synced' : 'Detect My Live Location'}</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              isSimulating
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
            title={isSimulating ? 'Pause live coordinate progression' : 'Resume live coordinate progression'}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Sim Running</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" />
                <span>Sim Paused</span>
              </>
            )}
          </button>

          {/* Trigger Traffic Alert simulation */}
          <button
            onClick={triggerSimulatedTrafficIncident}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all font-semibold"
            title="Simulate sudden traffic spike on Zone C to demonstrate alternative route alert"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Simulate Traffic Spike</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
            title="Reset telemetry to initial demo state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-200 p-1"
            title={collapsed ? 'Expand notice' : 'Collapse notice'}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
