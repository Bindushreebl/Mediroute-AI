import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Navigation,
  PlusCircle,
  Search,
  Siren,
  Sparkles,
  Truck,
  Users,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { Emergency, EmergencySeverity, EmergencyStatus } from '../types';
import { EmergencyTimeline } from '../components/emergencies/EmergencyTimeline';
import { RouteComparisonCard } from '../components/emergencies/RouteComparisonCard';
import { EmergencyReportModal } from '../components/reports/EmergencyReportModal';
import { LiveNavigationModal } from '../components/navigation/LiveNavigationModal';

interface EmergenciesPageProps {
  onOpenCreateEmergency: () => void;
}

export const EmergenciesPage: React.FC<EmergenciesPageProps> = ({ onOpenCreateEmergency }) => {
  const { emergencies, ambulances, hospitals, selectedEmergency, setSelectedEmergency } = useEmergency();

  const [severityFilter, setSeverityFilter] = useState<'all' | EmergencySeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);

  const filteredEmergencies = emergencies.filter((emg) => {
    const matchesSev = severityFilter === 'all' || emg.severity === severityFilter;
    const matchesSearch =
      searchQuery === '' ||
      emg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emg.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emg.emergencyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emg.locationAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const assignedAmbulance = ambulances.find((a) => a.id === selectedEmergency?.ambulanceId);
  const assignedHospital = hospitals.find((h) => h.id === selectedEmergency?.hospitalId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Siren className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>Emergency Operations Dispatch Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse active and historical 911 medical alerts, triage progress, and automated vehicle routing.
          </p>
        </div>

        <button
          onClick={onOpenCreateEmergency}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/60 border border-rose-500/40 active:scale-95 transition-all"
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Create Emergency Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, patient, condition, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Severity:
          </span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                severityFilter === s
                  ? s === 'critical'
                    ? 'bg-red-600 text-white shadow-md'
                    : s === 'high'
                    ? 'bg-orange-500 text-white shadow-md'
                    : s === 'medium'
                    ? 'bg-yellow-500 text-slate-950 font-extrabold shadow-md'
                    : s === 'low'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmergencies.map((emg) => {
          const isSelected = selectedEmergency?.id === emg.id;
          const amb = ambulances.find((a) => a.id === emg.ambulanceId);
          const hosp = hospitals.find((h) => h.id === emg.hospitalId);

          return (
            <div
              key={emg.id}
              onClick={() => setSelectedEmergency(emg)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-rose-500 ring-2 ring-rose-500/20 shadow-2xl'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-300 flex items-center gap-1.5">
                    <span>🚨</span> {emg.id}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      emg.severity === 'critical'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : emg.severity === 'high'
                        ? 'bg-orange-950 text-orange-400 border border-orange-800'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}
                  >
                    {emg.severity}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white">{emg.emergencyType}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Patient: <strong className="text-slate-200">{emg.patientName}</strong></p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-start gap-1.5 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="truncate">{emg.locationAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{hosp?.name || 'Assigned to nearest trauma'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Unit: <strong className="text-emerald-400">{amb?.vehicleNumber || 'Unassigned'}</strong> ({amb?.driverName || 'Standby'})</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-cyan-400 uppercase font-bold font-mono">
                  {emg.status.replace('_', ' ')}
                </span>
                <span className="text-slate-500 text-[10px]">{emg.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Emergency Detailed Workspace */}
      {selectedEmergency && (
        <div className="pt-6 border-t border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Active Incident Timeline & Routing
              </span>
              <h2 className="text-lg font-black text-white">
                {selectedEmergency.id}: {selectedEmergency.patientName} ({selectedEmergency.emergencyType})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setNavModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Start Navigation HUD</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
              >
                <span>CAD Incident Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmergencyTimeline emergency={selectedEmergency} />
            <RouteComparisonCard emergency={selectedEmergency} />
          </div>

          <EmergencyReportModal
            emergency={selectedEmergency}
            ambulance={assignedAmbulance}
            hospital={assignedHospital}
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
          />

          <LiveNavigationModal
            emergency={selectedEmergency}
            isOpen={navModalOpen}
            onClose={() => setNavModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
