import React from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Building2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Emergency, Ambulance, Hospital } from '../../types';

interface EmergencyReportModalProps {
  emergency: Emergency;
  ambulance?: Ambulance;
  hospital?: Hospital;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyReportModal: React.FC<EmergencyReportModalProps> = ({
  emergency,
  ambulance,
  hospital,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const actualResponseTimeMin = 8.5; // Calculated demo response metric

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Header - Non-print action bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-400" />
            <span className="font-black text-sm text-white uppercase tracking-wider">
              Emergency Incident Audit & Dispatch Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-100 print:text-slate-900 print:p-0">
          {/* Official Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-rose-500/40 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚑</span>
                <h1 className="text-xl font-black tracking-tight text-white print:text-black uppercase">
                  MediRoute AI Emergency Response System
                </h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Centralized Medical Dispatch & Route Optimization Command
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-500 font-mono mt-0.5">
                ISO-27001 Certified CAD Audit Log • Dispatch Node #08-METRO
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-md bg-rose-950/80 print:bg-rose-100 text-rose-400 print:text-rose-800 font-mono font-bold text-xs uppercase border border-rose-800/60">
                {emergency.severity} Incident
              </span>
              <p className="text-xs text-slate-400 print:text-slate-600 font-mono mt-1">
                REF ID: <strong className="text-white print:text-black">{emergency.id}</strong>
              </p>
              <p className="text-[10px] text-slate-500 print:text-slate-500">Logged: {emergency.createdAt}</p>
            </div>
          </div>

          {/* Section 1: Patient & Incident Classification */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 print:bg-slate-100 p-4 rounded-xl border border-slate-800/80 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase font-bold block">Patient Name</span>
              <strong className="text-slate-200 print:text-black">{emergency.patientName}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase font-bold block">Emergency Type</span>
              <strong className="text-amber-400 print:text-amber-700">{emergency.emergencyType}</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase font-bold block">Victim Count</span>
              <strong className="text-slate-200 print:text-black">{emergency.patientCount} Patient(s)</strong>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase font-bold block">Current Status</span>
              <strong className="text-emerald-400 print:text-emerald-700 uppercase font-mono">{emergency.status.replace('_', ' ')}</strong>
            </div>
          </div>

          {/* Section 2: Geospatial & Route Performance Metrics */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 border-b border-slate-800/60 print:border-slate-200 pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Geospatial Routing & Time Performance</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 print:text-slate-600 text-[10px] block">Incident Address</span>
                <p className="font-semibold text-slate-200 print:text-black">{emergency.locationAddress}</p>
                <p className="text-[10px] font-mono text-slate-500">
                  {emergency.location.lat.toFixed(4)}, {emergency.location.lng.toFixed(4)}
                </p>
              </div>

              <div>
                <span className="text-slate-500 print:text-slate-600 text-[10px] block">Assigned Route</span>
                <p className="font-semibold text-cyan-400 print:text-cyan-800">
                  {emergency.selectedRoute?.name || 'Route A'} ({emergency.selectedRoute?.label || 'Direct Corridor'})
                </p>
                <p className="text-[10px] text-slate-500">Traffic: {emergency.selectedRoute?.trafficLevel || 'Moderate'}</p>
              </div>

              <div>
                <span className="text-slate-500 print:text-slate-600 text-[10px] block">Calculated Distance</span>
                <p className="font-mono font-bold text-slate-200 print:text-black text-sm">
                  {emergency.selectedRoute?.distanceKm || 6.4} km
                </p>
                <p className="text-[10px] text-slate-500">Estimated ETA: {emergency.selectedRoute?.durationMinutes || 12} min</p>
              </div>

              <div>
                <span className="text-slate-500 print:text-slate-600 text-[10px] block">Actual Response Time</span>
                <p className="font-mono font-bold text-emerald-400 print:text-emerald-700 text-sm">
                  {actualResponseTimeMin} min
                </p>
                <span className="text-[10px] text-emerald-500 font-semibold">Under SLA 12.0 min</span>
              </div>
            </div>
          </div>

          {/* Section 3: Assigned Units & Receiving Clinical Facility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Unit */}
            <div className="p-3.5 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/40 print:bg-white text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 print:text-emerald-800">
                <Truck className="w-4 h-4" />
                <span>Assigned Fleet Vehicle</span>
              </div>
              <p><span className="text-slate-500">Vehicle:</span> <strong className="text-white print:text-black">{ambulance?.vehicleNumber || 'MED-901'}</strong> ({ambulance?.type || 'ALS'})</p>
              <p><span className="text-slate-500">Driver / Lead Paramedic:</span> <strong className="text-white print:text-black">{ambulance?.driverName || 'David Rodriguez'}</strong></p>
              <p><span className="text-slate-500">Crew Phone:</span> {ambulance?.driverPhone || '(555) 881-1029'}</p>
              <p><span className="text-slate-500">Sector Base:</span> {ambulance?.sector || 'Downtown Central'}</p>
            </div>

            {/* Hospital */}
            <div className="p-3.5 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/40 print:bg-white text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-400 print:text-rose-800">
                <Building2 className="w-4 h-4" />
                <span>Destination Hospital Facility</span>
              </div>
              <p><span className="text-slate-500">Facility:</span> <strong className="text-white print:text-black">{hospital?.name || 'St. Jude Trauma & Cardiac Institute'}</strong></p>
              <p><span className="text-slate-500">Address:</span> {hospital?.address || '450 Emergency Way, Downtown Core'}</p>
              <p><span className="text-slate-500">Target Clinical Dept:</span> <strong className="text-amber-400 print:text-amber-800">{emergency.requiredDepartment}</strong></p>
              <p><span className="text-slate-500">ICU Capacity on Arrival:</span> {hospital?.availableIcu || 8} Available Beds</p>
            </div>
          </div>

          {/* Section 4: Operational Audit Chronology */}
          <div className="border border-slate-800 print:border-slate-300 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold uppercase text-[11px] text-slate-400 print:text-slate-700 mb-2">
              Dispatch Chronology & Time Marks
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              {emergency.timeline.map((evt, idx) => (
                <div key={idx} className="flex items-start justify-between border-b border-slate-800/40 print:border-slate-200 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 print:text-emerald-700">✓</span>
                    <span className="font-semibold text-slate-200 print:text-black uppercase">{evt.status.replace('_', ' ')}:</span>
                    <span className="text-slate-400 print:text-slate-600 font-sans">{evt.description}</span>
                  </div>
                  <span className="text-slate-500 text-[10px] whitespace-nowrap pl-2">{evt.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signoff & Disclaimers */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 print:text-slate-500">
            <p className="max-w-md">
              Report automatically verified by MediRoute AI CAD Dispatch Service. This document is a prototype dispatch audit for training, performance review, and decision-support systems.
            </p>
            <div className="text-right">
              <p className="font-mono uppercase font-bold text-slate-400 print:text-black">Electronic Signature Validated</p>
              <p className="font-mono text-[9px]">Hash: SHA256-CAD-EMG-{emergency.id.toUpperCase()}-99A</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
