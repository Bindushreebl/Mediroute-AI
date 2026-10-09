import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Building2,
  Filter,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { EmergencyReportModal } from '../components/reports/EmergencyReportModal';
import { Emergency } from '../types';

export const ReportsPage: React.FC = () => {
  const { emergencies, ambulances, hospitals } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filteredEmergencies = emergencies.filter((emg) => {
    return (
      searchQuery === '' ||
      emg.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emg.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emg.emergencyType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOpenReport = (emg: Emergency) => {
    setSelectedEmergency(emg);
    setReportModalOpen(true);
  };

  const assignedAmbulance = ambulances.find((a) => a.id === selectedEmergency?.ambulanceId);
  const assignedHospital = hospitals.find((h) => h.id === selectedEmergency?.hospitalId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-rose-500" />
            <span>Emergency Incident Reports & CAD Audits</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal dispatch logs, response time SLA metrics, clinical handoff timestamps, and printable PDF documents.
          </p>
        </div>

        <button
          onClick={() => handleOpenReport(emergencies[0])}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
        >
          <Printer className="w-4 h-4 text-cyan-400" />
          <span>Quick Print Latest Incident</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report by incident ID, patient name, medical category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Showing {filteredEmergencies.length} Archival Records
        </span>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Emergency ID</th>
                <th className="py-3.5 px-4">Patient / Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Fleet Vehicle</th>
                <th className="py-3.5 px-4">Receiving Hospital</th>
                <th className="py-3.5 px-4">Calculated Dist & ETA</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmergencies.map((emg) => {
                const amb = ambulances.find((a) => a.id === emg.ambulanceId);
                const hosp = hospitals.find((h) => h.id === emg.hospitalId);

                return (
                  <tr key={emg.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                      <span>📄</span>
                      <span>{emg.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-slate-200 block">{emg.patientName}</strong>
                      <span className="text-amber-400 text-[11px]">{emg.emergencyType}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-[160px]">
                      {emg.locationAddress}
                    </td>
                    <td className="py-3.5 px-4">
                      {amb ? (
                        <div>
                          <strong className="text-emerald-400 font-mono block">{amb.vehicleNumber}</strong>
                          <span className="text-slate-500 text-[10px]">{amb.driverName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 truncate max-w-[160px]">
                      {hosp?.name || 'Triage Assigned'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      {emg.selectedRoute?.distanceKm || 6.2} km • {emg.selectedRoute?.durationMinutes || 11}m
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          emg.severity === 'critical'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : emg.severity === 'high'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                        }`}
                      >
                        {emg.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReport(emg)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        <span>Generate Audit Report</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {selectedEmergency && (
        <EmergencyReportModal
          emergency={selectedEmergency}
          ambulance={assignedAmbulance}
          hospital={assignedHospital}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
};
