import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  MapPin,
  Navigation,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { RouteComparisonCard } from '../components/emergencies/RouteComparisonCard';
import { generateCandidateRoutes } from '../services/mapService';
import { LiveNavigationModal } from '../components/navigation/LiveNavigationModal';

export const RoutesPage: React.FC = () => {
  const {
    emergencies,
    selectedEmergency,
    setSelectedEmergency,
    hospitals,
    switchEmergencyRoute,
    triggerSimulatedTrafficIncident,
  } = useEmergency();

  const [navModalOpen, setNavModalOpen] = useState(false);

  const targetEmergency = selectedEmergency || emergencies[0];
  const targetHospital = hospitals.find((h) => h.id === targetEmergency?.hospitalId) || hospitals[0];

  const candidateRoutes = targetEmergency
    ? generateCandidateRoutes(targetEmergency.location, targetHospital.location, targetEmergency.severity)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-6 h-6 text-cyan-400" />
            <span>AI Route Optimization & Multi-Path Comparison</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluation of dynamic travel time, traffic congestion penalties, road quality indices, and emergency severity weights.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {targetEmergency && (
            <button
              onClick={() => setNavModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch Turn-by-Turn Navigation</span>
            </button>
          )}

          <button
            onClick={triggerSimulatedTrafficIncident}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulate Traffic Gridlock Spike</span>
          </button>
        </div>
      </div>

      {/* Target Emergency Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap mr-1">
          Select Incident:
        </span>
        {emergencies.map((emg) => (
          <button
            key={emg.id}
            onClick={() => setSelectedEmergency(emg)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              targetEmergency?.id === emg.id
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {emg.id} ({emg.emergencyType})
          </button>
        ))}
      </div>

      {/* Main Route Comparison Component */}
      {targetEmergency && <RouteComparisonCard emergency={targetEmergency} />}

      {/* Alternative Route Dynamic Alert Demo Box */}
      {targetEmergency?.alternativeRouteAvailable && targetEmergency.alternativeRoute && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </span>
              <div>
                <h3 className="text-base font-black text-amber-300">
                  ⚠️ Real-Time Traffic Alert: Alternative Route Available!
                </h3>
                <p className="text-xs text-slate-400">
                  Sensor data indicates sudden bottlenecking on the primary corridor.
                </p>
              </div>
            </div>

            <button
              onClick={() => switchEmergencyRoute(targetEmergency.id, targetEmergency.alternativeRoute!)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>Switch to {targetEmergency.alternativeRoute.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Impeded Route</span>
              <p className="font-mono font-bold text-rose-400 text-base mt-0.5">
                {targetEmergency.selectedRoute?.durationMinutes || 18} min
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">Congestion Level: High / Severe</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30">
              <span className="text-[10px] text-amber-400 block uppercase font-bold">Recommended Bypass Route</span>
              <p className="font-mono font-bold text-emerald-400 text-base mt-0.5">
                {targetEmergency.alternativeRoute.durationMinutes} min
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">Congestion Level: Low (Express Highway)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">Estimated Time Saved</span>
              <p className="font-mono font-bold text-cyan-400 text-base mt-0.5">
                ~{targetEmergency.timeDifferenceMinutes || 6} min saved
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">Critical time benefit for patient survival</p>
            </div>
          </div>
        </div>
      )}

      {/* Formula & Mathematical Model Educational Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span>Mathematical Formulation for Emergency Route Cost Optimization</span>
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed">
          Standard shortest-path algorithms (like raw Dijkstra or A*) compute solely spatial distance. MediRoute AI maps a dynamically weighted cost surface where every edge is evaluated through time-varying impedance penalties:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-purple-300 border border-purple-900/50 space-y-1">
          <p className="font-bold text-white">Cost(Route_k) = w_t • T(k) + w_c • P_traffic(k) + w_d • D(k) + w_r • (10 - Q_road(k))</p>
          <p className="text-slate-500 text-[10px]">
            Where: T(k) = Travel time, P_traffic = Congestion penalty, D(k) = Distance, Q_road = Road surface score (1-10)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 pt-2">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">Route A (Direct Arterial)</strong>
            <span>Balances straight-line distance with moderate urban traffic signal delays.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">Route B (Highway Bypass)</strong>
            <span>Longer spatial distance, but high speeds and minimal stops result in lower total cost.</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-slate-200 block mb-1">Route C (Surface Cut)</strong>
            <span>Shortest geometry, but burdened by heavy traffic penalties and high pedestrian density.</span>
          </div>
        </div>
      </div>

      {targetEmergency && (
        <LiveNavigationModal
          emergency={targetEmergency}
          isOpen={navModalOpen}
          onClose={() => setNavModalOpen(false)}
        />
      )}
    </div>
  );
};
