import React from 'react';
import {
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Gauge,
  TrendingDown,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Emergency, RouteOption } from '../../types';
import { useEmergency } from '../../context/EmergencyContext';
import { generateCandidateRoutes } from '../../services/mapService';

interface RouteComparisonCardProps {
  emergency: Emergency;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({ emergency }) => {
  const { hospitals, switchEmergencyRoute } = useEmergency();

  const hospital = hospitals.find((h) => h.id === emergency.hospitalId) || hospitals[0];
  const candidateRoutes = generateCandidateRoutes(emergency.location, hospital.location, emergency.severity);

  const selectedRouteId = emergency.selectedRoute?.id || candidateRoutes[0].id;

  const handleSelectRoute = (route: RouteOption) => {
    switchEmergencyRoute(emergency.id, route);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <h3 className="font-extrabold text-sm text-white">Smart Route Optimization & Comparison</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
              AI Multi-Path Scoring
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluating travel time, traffic congestion penalties, distance, and road risk index.
          </p>
        </div>

        {/* Formula summary pill */}
        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Score = Time + TrafficPen + DistPen + RiskPen</span>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {candidateRoutes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isBestScore = route.recommended;

          return (
            <div
              key={route.id}
              className={`p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-950 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {isBestScore && (
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-extrabold tracking-wider uppercase shadow">
                  ⭐ Recommended by AI
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mt-1 mb-2">
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>{route.name}</span>
                    <span className="text-slate-400 font-normal text-xs">• {route.label}</span>
                  </h4>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>

                {/* Primary Metrics */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Estimated ETA</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">
                      {route.durationMinutes} <span className="text-xs font-normal text-slate-400">min</span>
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Distance</span>
                    <span className="text-lg font-black text-white font-mono">
                      {route.distanceKm} <span className="text-xs font-normal text-slate-400">km</span>
                    </span>
                  </div>
                </div>

                {/* Secondary breakdown */}
                <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/60 pt-2 mb-3">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Traffic Condition:</span>
                    <span
                      className={`font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                        route.trafficLevel === 'low'
                          ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                          : route.trafficLevel === 'moderate'
                          ? 'text-yellow-400 bg-yellow-950/80 border border-yellow-800'
                          : 'text-rose-400 bg-rose-950/80 border border-rose-800'
                      }`}
                    >
                      {route.trafficLevel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Road Quality Index:</span>
                    <span className="font-mono text-slate-200">{route.roadConditionScore}/10</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Signal Delays (est):</span>
                    <span className="font-mono text-slate-200">~{route.signalDelays}s</span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/40">
                    <span className="text-slate-400 font-semibold">Total Cost Score:</span>
                    <span className="font-mono font-extrabold text-amber-400">{route.routeScore} pts</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handleSelectRoute(route)}
                disabled={isSelected}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
                }`}
              >
                {isSelected ? 'Active Route Applied' : 'Apply This Route'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Prototype Decision-Support Notice:</strong> Route comparisons use simulated traffic sensors and penalty equations. Emergency vehicle priority signaling and real-world bypasses must be coordinated through municipal dispatch.
        </p>
      </div>
    </div>
  );
};
