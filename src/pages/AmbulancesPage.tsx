import React, { useState } from 'react';
import {
  AlertTriangle,
  Battery,
  CheckCircle2,
  Filter,
  MapPin,
  Phone,
  PlusCircle,
  Radio,
  Search,
  Shield,
  Siren,
  Truck,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { Ambulance, AmbulanceStatus, AmbulanceType } from '../types';

export const AmbulancesPage: React.FC = () => {
  const {
    ambulances,
    emergencies,
    registerAmbulance,
    updateAmbulanceStatus,
    isSimulating,
    toggleSimulation,
  } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AmbulanceStatus>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(ambulances[0] || null);

  // New ambulance registration form state
  const [newVehicleNumber, setNewVehicleNumber] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newType, setNewType] = useState<AmbulanceType>('ALS');
  const [newSector, setNewSector] = useState('Central Depot Sector 1');

  const filteredAmbulances = ambulances.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      a.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = registerAmbulance({
      vehicleNumber: newVehicleNumber || `MED-${Math.floor(900 + Math.random() * 99)}`,
      driverName: newDriverName || 'Paramedic Recruit',
      driverPhone: newDriverPhone || '(555) 881-3000',
      type: newType,
      sector: newSector,
      status: 'available',
    });
    setSelectedAmbulance(created);
    setIsRegisterModalOpen(false);
    setNewVehicleNumber('');
    setNewDriverName('');
  };

  const getStatusBadge = (status: AmbulanceStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Available
          </span>
        );
      case 'en_route':
      case 'transporting_patient':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-950/80 text-blue-400 border border-blue-800 animate-pulse">
            {status.replace('_', ' ')}
          </span>
        );
      case 'at_emergency':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-950/80 text-amber-400 border border-amber-800">
            On Scene
          </span>
        );
      case 'at_hospital':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-950/80 text-purple-400 border border-purple-800">
            At Hospital
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-slate-800 text-slate-400 border border-slate-700">
            Offline
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            <span>Emergency Fleet Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GPS vehicle tracking, driver telemetry, crew readiness, and rapid dispatch assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              isSimulating
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {isSimulating ? '● GPS Simulation Active' : '○ GPS Simulation Paused'}
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/60 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Ambulance</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by vehicle ID, driver, sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {(['all', 'available', 'en_route', 'transporting_patient', 'at_emergency', 'offline'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Ambulance</th>
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Sector Base</th>
                  <th className="py-3.5 px-4 text-right">Battery / Fuel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredAmbulances.map((amb) => {
                  const isSelected = selectedAmbulance?.id === amb.id;
                  return (
                    <tr
                      key={amb.id}
                      onClick={() => setSelectedAmbulance(amb)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/30 font-semibold'
                          : 'hover:bg-slate-950/50'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                        <span className="text-base">🚑</span>
                        <span>{amb.vehicleNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {amb.driverName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold">
                          {amb.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(amb.status)}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[140px]">
                        {amb.sector}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400">
                        {amb.fuelPercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Ambulance Inspector Pane (1 col) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
          {selectedAmbulance ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">{selectedAmbulance.vehicleNumber}</h3>
                    <p className="text-xs text-slate-400">{selectedAmbulance.type} Life Support Unit</p>
                  </div>
                </div>
                {getStatusBadge(selectedAmbulance.status)}
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Crew Telemetry</span>
                  <p><span className="text-slate-400">Lead Driver:</span> <strong className="text-white">{selectedAmbulance.driverName}</strong></p>
                  <p><span className="text-slate-400">Crew Phone:</span> <span className="text-cyan-400 font-mono">{selectedAmbulance.driverPhone}</span></p>
                  <p><span className="text-slate-400">Sector:</span> {selectedAmbulance.sector}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">GPS Coordinates</span>
                  <p className="font-mono text-xs text-slate-200">
                    Lat: {selectedAmbulance.location.lat.toFixed(5)}, Lng: {selectedAmbulance.location.lng.toFixed(5)}
                  </p>
                  {selectedAmbulance.currentDestination && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-300">
                      Destination: <strong className="text-white">{selectedAmbulance.currentDestination}</strong>
                      <div className="text-slate-400">ETA: {selectedAmbulance.etaMinutes || 4} min</div>
                    </div>
                  )}
                </div>

                {/* Status manual override for dispatcher testing */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                    Dispatcher Status Override:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['available', 'en_route', 'at_emergency', 'transporting_patient', 'at_hospital', 'offline'] as AmbulanceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateAmbulanceStatus(selectedAmbulance.id, st)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          selectedAmbulance.status === st
                            ? 'bg-emerald-600 text-white shadow'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">Select an ambulance to inspect telemetry.</p>
          )}
        </div>
      </div>

      {/* Register Ambulance Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>Register Emergency Ambulance</span>
              </h3>
              <button onClick={() => setIsRegisterModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle License / ID</label>
                <input
                  type="text"
                  placeholder="e.g. MED-912"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Paramedic Driver</label>
                <input
                  type="text"
                  placeholder="e.g. Officer Nathan Drake"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Driver Phone</label>
                <input
                  type="text"
                  placeholder="(555) 881-XXXX"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Life Support Class</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as AmbulanceType)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALS">Advanced Life Support (ALS)</option>
                  <option value="BLS">Basic Life Support (BLS)</option>
                  <option value="Neonatal">Neonatal Intensive Care</option>
                  <option value="Patient Transport">Non-Urgent Patient Transport</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Station Sector</label>
                <input
                  type="text"
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-950"
                >
                  Save & Enroll Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
