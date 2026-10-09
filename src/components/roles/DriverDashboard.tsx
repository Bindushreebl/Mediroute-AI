import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Battery,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Crosshair,
  FileText,
  Fuel,
  Gauge,
  HeartPulse,
  MapPin,
  Navigation,
  Phone,
  Radio,
  RotateCcw,
  ShieldCheck,
  Siren,
  Sparkles,
  Truck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { Emergency, Ambulance, RouteOption } from '../../types';
import { LiveNavigationModal } from '../navigation/LiveNavigationModal';
import { RouteComparisonCard } from '../emergencies/RouteComparisonCard';
import { KARNATAKA_DISTRICTS } from '../../services/karnatakaData';

interface DriverDashboardProps {
  onOpenCreateEmergency: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  onOpenCreateEmergency,
  onNavigateTab,
}) => {
  const {
    currentUser,
    ambulances,
    emergencies,
    selectedEmergency,
    setSelectedEmergency,
    hospitals,
    userLiveLocation,
    userLocationAddress,
    detectLiveLocation,
    updateEmergencyStatus,
    updateAmbulanceStatus,
    selectedDistrict,
    selectedTaluk,
    setKarnatakaDistrictAndTaluk,
  } = useEmergency();

  const [navModalOpen, setNavModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Match driver's assigned ambulance or default to first 108 unit
  const myAmbulance =
    ambulances.find((a) => a.id === currentUser?.assignedAmbulanceId) ||
    ambulances.find((a) => a.driverName.toLowerCase().includes('manjunath')) ||
    ambulances[0];

  // Active emergency assigned to this driver's ambulance or current active
  const activeEmergency =
    emergencies.find((e) => e.ambulanceId === myAmbulance?.id && e.status !== 'completed') ||
    emergencies.find((e) => e.status !== 'completed') ||
    selectedEmergency;

  const targetHospital = hospitals.find((h) => h.id === activeEmergency?.hospitalId);

  // Completed missions by this ambulance
  const completedMissions = emergencies.filter(
    (e) => (e.ambulanceId === myAmbulance?.id || e.status === 'completed') && e.status === 'completed'
  );

  const handleDetectGPS = async () => {
    setIsLocating(true);
    await detectLiveLocation();
    setIsLocating(false);
  };

  return (
    <div className="space-y-6">
      {/* Driver Welcome & Fleet Telemetry Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-2xl shadow-lg">
            <Truck className="w-8 h-8 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                108 Arogya Kavacha Pilot
              </span>
              <span className="text-xs text-slate-400">• Karnataka Emergency Medical Services</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {currentUser?.name || myAmbulance?.driverName || 'Pilot Manjunath Gowda'}
            </h1>
            <p className="text-xs text-slate-400">
              Vehicle Registration: <strong className="text-emerald-400 font-mono">{myAmbulance?.vehicleNumber}</strong> • Class: <strong className="text-slate-200">{myAmbulance?.type} (Advanced Life Support)</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-md"
          >
            <Crosshair className={`w-4 h-4 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Syncing GPS...' : 'Sync Live GPS Outpost'}</span>
          </button>

          <button
            onClick={onOpenCreateEmergency}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/60 border border-rose-500/40 transition-all active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Report Road Emergency</span>
          </button>
        </div>
      </div>

      {/* Ambulance Live Vitals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Unit Status */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Status
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-emerald-400 capitalize">
              {myAmbulance?.status.replace('_', ' ')}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] text-slate-500 block">Stationed at {myAmbulance?.sector}</span>
        </div>

        {/* Fuel Level */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-amber-400" /> Fuel Reserve
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">{myAmbulance?.fuelPercent || 96}%</span>
            <span className="text-[10px] text-emerald-400 font-bold">Optimal Tank</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${myAmbulance?.fuelPercent || 96}%` }} />
          </div>
        </div>

        {/* Medical Equipment Score */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Equipment Triage Readiness
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white font-mono">{myAmbulance?.equipmentScore || 99}%</span>
            <span className="text-[10px] text-cyan-400 font-bold">ALS Certified</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Defibrillator, O2 & Ventilator Active</span>
        </div>

        {/* Outpost Location */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Outpost Substation
          </span>
          <span className="text-xs font-extrabold text-white truncate block">
            {selectedDistrict}
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            {selectedTaluk} Taluk (108 Arogya Kavacha)
          </span>
        </div>
      </div>

      {/* Main Active Incident & Turn-by-Turn Card */}
      {activeEmergency ? (
        <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border-2 border-rose-500/40 shadow-2xl space-y-5 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-sm">
                  ACTIVE MISSION: {activeEmergency.id}
                </span>
                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                  {activeEmergency.severity}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {activeEmergency.emergencyType}: {activeEmergency.patientName}
              </h2>
            </div>

            {/* Launch Turn-by-Turn Navigation */}
            <button
              onClick={() => setNavModalOpen(true)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-cyan-950/70 border border-cyan-400/40 transition-all active:scale-95 group animate-pulse self-start sm:self-auto"
            >
              <Navigation className="w-5 h-5 text-white group-hover:rotate-45 transition-transform" />
              <span>Start Turn-by-Turn Navigation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Mission Route & Destination Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pickup Location */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> 1. Patient Pickup Location
              </span>
              <p className="font-extrabold text-sm text-white">{activeEmergency.locationAddress}</p>
              <p className="text-xs text-slate-400">
                Contact: <strong className="text-slate-200">{activeEmergency.contactPhone}</strong>
              </p>
              <button
                onClick={() => updateEmergencyStatus(activeEmergency.id, 'reached_patient')}
                className="w-full mt-2 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
              >
                Mark Reached Patient
              </button>
            </div>

            {/* Recommended Destination Hospital */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> 2. Recommended Hospital
              </span>
              <p className="font-extrabold text-sm text-white">{targetHospital?.name || 'Nearest Trauma Center'}</p>
              <p className="text-xs text-slate-400 truncate">{targetHospital?.address}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-300">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  ICU Beds: {targetHospital?.availableIcu || 8}
                </span>
                <span className="text-slate-400">ER Ready</span>
              </div>
              <button
                onClick={() => updateEmergencyStatus(activeEmergency.id, 'patient_transporting')}
                className="w-full mt-2 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-colors"
              >
                Depart for Hospital (Transporting)
              </button>
            </div>

            {/* Route & ETA Overview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5" /> 3. Tactical Route & Status
              </span>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-white font-mono">
                    {activeEmergency.selectedRoute?.durationMinutes || 8}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">mins priority ETA</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {activeEmergency.selectedRoute?.distanceKm || 4.2} km
                  </span>
                  <span className="text-[10px] text-slate-500 block">corridor distance</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Corridor: <strong className="text-slate-200">{activeEmergency.selectedRoute?.name || 'Corridor Alpha NH-44'}</strong>
              </p>
              <button
                onClick={() => updateEmergencyStatus(activeEmergency.id, 'completed')}
                className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
              >
                Complete Handoff & Mission
              </button>
            </div>
          </div>

          {/* Alternative Route Quick Switch Bar */}
          {activeEmergency.alternativeRouteAvailable && activeEmergency.alternativeRoute && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-950 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Alternative route available: <strong>{activeEmergency.alternativeRoute.name}</strong> (Saves 5m bypass)
                </span>
              </div>
              <button
                onClick={() => setNavModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-colors"
              >
                Inspect in Navigation HUD
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Active Emergencies Assigned</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            108 Arogya Kavacha unit is on standby at {myAmbulance?.sector}. You will be alerted immediately when a priority 108 dispatch occurs in your sector.
          </p>
          <button
            onClick={onOpenCreateEmergency}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Simulate Incoming Emergency Call</span>
          </button>
        </div>
      )}

      {/* Driver's Mission History */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="font-extrabold text-base text-white">Pilot Mission & Route Log</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {completedMissions.length} Missions Handled
          </span>
        </div>

        <div className="space-y-2">
          {completedMissions.slice(0, 4).map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-bold text-white font-mono">{m.id}</span> •{' '}
                <strong className="text-amber-400">{m.emergencyType}</strong> •{' '}
                <span className="text-slate-300">{m.patientName}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{m.locationAddress}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  Handoff Completed
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ~{m.selectedRoute?.durationMinutes || 7}m transit
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Modal */}
      {activeEmergency && (
        <LiveNavigationModal
          isOpen={navModalOpen}
          onClose={() => setNavModalOpen(false)}
          emergency={activeEmergency}
        />
      )}
    </div>
  );
};
