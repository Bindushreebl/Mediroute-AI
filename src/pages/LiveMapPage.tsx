import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Compass,
  FileText,
  MapPin,
  Navigation,
  Radio,
  Siren,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { LiveEmergencyMap } from '../components/maps/LiveEmergencyMap';
import { EmergencyReportModal } from '../components/reports/EmergencyReportModal';
import { LiveNavigationModal } from '../components/navigation/LiveNavigationModal';
import { Emergency, Ambulance, Hospital } from '../types';

export const LiveMapPage: React.FC = () => {
  const {
    emergencies,
    ambulances,
    hospitals,
    selectedEmergency,
    setSelectedEmergency,
    triggerSimulatedTrafficIncident,
    switchEmergencyRoute,
  } = useEmergency();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [inspectedAmbulance, setInspectedAmbulance] = useState<Ambulance | null>(null);
  const [inspectedHospital, setInspectedHospital] = useState<Hospital | null>(null);

  const assignedAmbulance = ambulances.find((a) => a.id === selectedEmergency?.ambulanceId);
  const assignedHospital = hospitals.find((h) => h.id === selectedEmergency?.hospitalId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-cyan-400" />
            <span>Tactical GIS Live Map & Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full-screen geospatial dashboard with live coordinates, traffic congestion zones, and dynamic corridor rerouting.
          </p>
        </div>

        <button
          onClick={triggerSimulatedTrafficIncident}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Simulate Traffic Alert</span>
        </button>
      </div>

      {/* Main Full-Screen Map Component */}
      <LiveEmergencyMap
        heightClass="h-[680px]"
        focusedEmergencyId={selectedEmergency?.id}
        onSelectEmergency={(emg) => {
          setSelectedEmergency(emg);
          setInspectedAmbulance(null);
          setInspectedHospital(null);
        }}
        onSelectAmbulance={(amb) => {
          setInspectedAmbulance(amb);
          setInspectedHospital(null);
        }}
        onSelectHospital={(hosp) => {
          setInspectedHospital(hosp);
          setInspectedAmbulance(null);
        }}
      />

      {/* Selected Entity Drawer at Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Selected Emergency Summary */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Siren className="w-3.5 h-3.5 text-rose-500" />
              <span>Target Incident Details</span>
            </span>
            {selectedEmergency && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold uppercase">
                {selectedEmergency.severity}
              </span>
            )}
          </div>

          {selectedEmergency ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold text-sm text-white">{selectedEmergency.patientName}</p>
              <p className="text-amber-400 font-semibold">{selectedEmergency.emergencyType}</p>
              <p className="text-slate-400 text-[11px]">{selectedEmergency.locationAddress}</p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-cyan-400 capitalize font-mono text-[11px]">
                  Status: {selectedEmergency.status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setNavModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 px-1.5 py-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">Click an emergency marker on the map to inspect.</p>
          )}
        </div>

        {/* Card 2: Assigned or Clicked Ambulance Telemetry */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ambulance Telemetry</span>
            </span>
            {(inspectedAmbulance || assignedAmbulance) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                {(inspectedAmbulance || assignedAmbulance)?.type}
              </span>
            )}
          </div>

          {(inspectedAmbulance || assignedAmbulance) ? (
            (() => {
              const amb = inspectedAmbulance || assignedAmbulance!;
              return (
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="font-extrabold text-sm text-white">{amb.vehicleNumber} — {amb.driverName}</p>
                  <p className="text-slate-400">Sector: <span className="text-slate-200">{amb.sector}</span></p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">Status</span>
                      <strong className="text-emerald-400 capitalize">{amb.status.replace('_', ' ')}</strong>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">Fuel / Battery</span>
                      <strong className="text-cyan-400">{amb.fuelPercent}%</strong>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No active ambulance unit selected.</p>
          )}
        </div>

        {/* Card 3: Receiving Hospital Capacity */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Destination Hospital Triage</span>
            </span>
            {(inspectedHospital || assignedHospital) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 uppercase">
                {(inspectedHospital || assignedHospital)?.status}
              </span>
            )}
          </div>

          {(inspectedHospital || assignedHospital) ? (
            (() => {
              const hosp = inspectedHospital || assignedHospital!;
              return (
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className="font-extrabold text-sm text-white">{hosp.name}</p>
                  <p className="text-slate-400 text-[11px] truncate">{hosp.address}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">ICU Beds Free</span>
                      <strong className="text-emerald-400 font-mono text-sm">{hosp.availableIcu} / {hosp.icuCapacity}</strong>
                    </div>
                    <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-500 block">ED Wait Time</span>
                      <strong className="text-cyan-400 font-mono text-sm">~{hosp.waitTimeMinutes} min</strong>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No hospital facility selected.</p>
          )}
        </div>
      </div>

      {/* Emergency Report Modal */}
      {selectedEmergency && (
        <EmergencyReportModal
          emergency={selectedEmergency}
          ambulance={assignedAmbulance}
          hospital={assignedHospital}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* Live Navigation Modal */}
      {selectedEmergency && (
        <LiveNavigationModal
          emergency={selectedEmergency}
          isOpen={navModalOpen}
          onClose={() => setNavModalOpen(false)}
        />
      )}
    </div>
  );
};
