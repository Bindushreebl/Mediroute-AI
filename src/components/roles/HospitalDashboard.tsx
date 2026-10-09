import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bed,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HeartPulse,
  Info,
  MapPin,
  Phone,
  Plus,
  Minus,
  RefreshCw,
  ShieldCheck,
  Siren,
  Sparkles,
  Stethoscope,
  Truck,
  UserCheck,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { Hospital, HospitalStatus, Emergency } from '../../types';

interface HospitalDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    hospitals,
    emergencies,
    ambulances,
    updateHospitalStatus,
    updateHospitalBeds,
    acceptEmergencyByHospital,
    rejectEmergencyByHospital,
  } = useEmergency();

  // Find user's assigned hospital or default to Victoria Hospital
  const assignedHospitalId = currentUser?.assignedHospitalId || 'hosp-ka-blr-01';
  const myHospital = hospitals.find((h) => h.id === assignedHospitalId) || hospitals[0];

  const [localIcuCount, setLocalIcuCount] = useState(myHospital.availableIcu);
  const [localGeneralBeds, setLocalGeneralBeds] = useState(myHospital.availableGeneralBeds);
  const [rejectReason, setRejectReason] = useState('Acute capacity overflow');

  // Incoming emergencies targeted to this hospital
  const incomingEmergencies = emergencies.filter(
    (e) => e.hospitalId === myHospital.id && e.status !== 'completed'
  );

  // Accepted emergencies list
  const acceptedList = emergencies.filter(
    (e) => (myHospital.acceptedEmergencyIds || []).includes(e.id)
  );

  const handleUpdateBeds = (newGeneral: number, newIcu: number) => {
    setLocalGeneralBeds(newGeneral);
    setLocalIcuCount(newIcu);
    updateHospitalBeds(myHospital.id, newGeneral, newIcu);
  };

  const handleStatusChange = (status: HospitalStatus) => {
    updateHospitalStatus(myHospital.id, status, localIcuCount);
  };

  return (
    <div className="space-y-6">
      {/* Hospital Command Center Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            <Building2 className="w-9 h-9 text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Hospital CAD Triage Gateway
              </span>
              <span className="text-xs text-slate-400">• Emergency Department Reception</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {myHospital.name}
            </h1>
            <p className="text-xs text-slate-400">
              Address: <strong className="text-slate-200">{myHospital.address}</strong> • Tel: <strong className="text-cyan-300">{myHospital.phone}</strong>
            </p>
          </div>
        </div>

        {/* Operating Status Badge & Intake Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase">
            ER Intake Status:
          </span>
          <div className="flex items-center gap-1">
            {(['available', 'limited', 'full'] as HospitalStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  myHospital.status === st
                    ? st === 'available'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : st === 'limited'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {st === 'full' ? 'Divert / Full' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bed & ICU Capacity Real-Time Manager */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ICU Beds Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-400" /> Free ICU Beds
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Cap: {myHospital.icuCapacity}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {myHospital.availableIcu}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleUpdateBeds(localGeneralBeds, Math.max(0, myHospital.availableIcu - 1))}
                className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateBeds(localGeneralBeds, Math.min(myHospital.icuCapacity, myHospital.availableIcu + 1))}
                className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            {myHospital.availableIcu > 2 ? 'Adequate critical reserve' : 'Low ICU reserves — diversion risk'}
          </p>
        </div>

        {/* General ER Beds Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-cyan-400" /> Free General Beds
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Cap: {myHospital.generalBedsCapacity}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
              {myHospital.availableGeneralBeds}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleUpdateBeds(Math.max(0, myHospital.availableGeneralBeds - 1), localIcuCount)}
                className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateBeds(Math.min(myHospital.generalBedsCapacity, myHospital.availableGeneralBeds + 1), localIcuCount)}
                className="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Casualty triage observation capacity
          </p>
        </div>

        {/* Ambulance Bay Status */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-400" /> Ambulance Bay Support
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-lg font-black text-emerald-400">ACTIVE 24/7</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400">
            Dedicated triage ramp & paramedical oxygen recharge active.
          </p>
        </div>

        {/* Average Wait Time */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> ER Door-to-Doctor
          </span>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-3xl font-black text-white font-mono">{myHospital.waitTimeMinutes}</span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Immediate resuscitation priority triage
          </p>
        </div>
      </div>

      {/* Incoming Emergency Requests Intake Queue */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border-2 border-red-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Siren className="w-6 h-6 text-rose-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-white">
              Incoming 108 Emergency Requests Queue ({incomingEmergencies.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Direct CAD Dispatch Links
          </span>
        </div>

        {incomingEmergencies.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-sm">No Pending Emergency Inbound Calls</h3>
            <p className="text-xs text-slate-400">
              The emergency department bay is currently on active standby.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingEmergencies.map((emg) => {
              const amb = ambulances.find((a) => a.id === emg.ambulanceId);
              const isAccepted = (myHospital.acceptedEmergencyIds || []).includes(emg.id);

              return (
                <div
                  key={emg.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {emg.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          emg.severity === 'critical'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : 'bg-orange-950 text-orange-300 border border-orange-800'
                        }`}
                      >
                        {emg.severity}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {emg.emergencyType}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        ETA: ~{emg.selectedRoute?.durationMinutes || 8} mins
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({emg.selectedRoute?.distanceKm || 4.2} km away)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <p>
                      Patient: <strong className="text-white">{emg.patientName}</strong>
                    </p>
                    <p className="truncate">
                      Origin: <strong className="text-slate-200">{emg.locationAddress}</strong>
                    </p>
                    <p>
                      Unit: <strong className="text-emerald-400">{amb?.vehicleNumber || '108 Kavacha'}</strong> ({amb?.driverName})
                    </p>
                  </div>

                  {/* Accept / Divert Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900">
                    <div>
                      {isAccepted ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-800">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Emergency Accepted — ER Bed Reserved</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-400 font-semibold">
                          ⚠️ Awaiting hospital intake confirmation
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAccepted && (
                        <button
                          onClick={() => acceptEmergencyByHospital(myHospital.id, emg.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Incoming Patient</span>
                        </button>
                      )}

                      <button
                        onClick={() => rejectEmergencyByHospital(myHospital.id, emg.id, rejectReason)}
                        className="px-3.5 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-bold text-xs transition-colors flex items-center gap-1.5"
                        title="Divert ambulance to next best Karnataka hospital"
                      >
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Divert / Reroute</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hospital Clinical Specialties & Accreditation */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="font-extrabold text-sm text-white">
          Active Hospital Departments & Clinical Accreditations
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { label: 'Cardiology & Cath Lab', active: myHospital.cardiology },
            { label: 'Level 1 Trauma Surgery', active: myHospital.traumaCenter },
            { label: 'Stroke & Neurology', active: myHospital.neurology },
            { label: 'Pediatric & PICU', active: myHospital.pediatrics },
            { label: 'Burn Care Unit', active: myHospital.burnUnit },
            { label: 'Ambulance Support', active: myHospital.ambulanceSupport },
            { label: '24/7 Blood Bank', active: true },
            { label: 'Emergency Toxicology', active: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                item.active
                  ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <span>{item.label}</span>
              {item.active ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-slate-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
