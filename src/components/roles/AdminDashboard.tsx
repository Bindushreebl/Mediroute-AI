import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Edit,
  Eye,
  FileText,
  Filter,
  Layers,
  MapPin,
  Navigation,
  PlusCircle,
  Radio,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Trash2,
  Truck,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { INITIAL_USERS } from '../../services/storageService';
import { Hospital, Ambulance, Emergency, EmergencyStatus, UserRole } from '../../types';

interface AdminDashboardProps {
  onOpenCreateEmergency: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenCreateEmergency,
  onNavigateTab,
}) => {
  const {
    emergencies,
    ambulances,
    hospitals,
    currentUser,
    cancelEmergency,
    reassignAmbulance,
    updateHospitalStatus,
    updateHospitalBeds,
    deleteHospital,
    addHospital,
    resetDemoData,
    triggerSimulatedTrafficIncident,
  } = useEmergency();

  const [activeTab, setActiveTab] = useState<'emergencies' | 'hospitals' | 'ambulances' | 'users'>('emergencies');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);

  // New hospital form
  const [newHospName, setNewHospName] = useState('');
  const [newHospAddr, setNewHospAddr] = useState('');
  const [newHospPhone, setNewHospPhone] = useState('');
  const [newHospIcu, setNewHospIcu] = useState(10);
  const [newHospBeds, setNewHospBeds] = useState(150);

  // Stats calculation
  const totalCases = emergencies.length;
  const activeCases = emergencies.filter((e) => e.status !== 'completed' && e.status !== 'CANCELLED').length;
  const availableAmbs = ambulances.filter((a) => a.status === 'available').length;
  const availableBedsSum = hospitals.reduce((acc, h) => acc + h.availableGeneralBeds, 0);
  const availableIcuSum = hospitals.reduce((acc, h) => acc + h.availableIcu, 0);

  const handleAddHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName.trim()) return;

    addHospital({
      name: newHospName.trim(),
      address: newHospAddr.trim() || 'Bengaluru, Karnataka',
      phone: newHospPhone.trim() || '080-22220000',
      icuCapacity: newHospIcu,
      availableIcu: Math.floor(newHospIcu / 2),
      generalBedsCapacity: newHospBeds,
      availableGeneralBeds: Math.floor(newHospBeds / 3),
      traumaCenter: true,
      cardiology: true,
      neurology: true,
      emergencyAvailable: true,
      status: 'available',
    });

    setNewHospName('');
    setNewHospAddr('');
    setShowAddHospitalModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Admin Operations Command Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-purple-600/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            <Shield className="w-9 h-9 text-purple-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800">
                State Operations Director
              </span>
              <span className="text-xs text-slate-400">• Karnataka Emergency Management Administration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              MediRoute CAD State Administration Portal
            </h1>
            <p className="text-xs text-slate-400">
              System Administrator: <strong className="text-purple-300">{currentUser?.name || 'Capt. Sarah Jenkins'}</strong> • Full CAD Dispatch & Telemetry Access
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerSimulatedTrafficIncident}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Simulate Traffic Spike</span>
          </button>

          <button
            onClick={resetDemoData}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm"
            title="Reload initial demo telemetry and fleet"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={onOpenCreateEmergency}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/60 border border-rose-500/40 transition-all active:scale-95"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Create Emergency</span>
          </button>
        </div>
      </div>

      {/* State-Wide Vital KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Active Cases
          </span>
          <div className="text-3xl font-black text-white font-mono">{activeCases}</div>
          <span className="text-[10px] text-slate-400">Under CAD Triage</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Ready Fleet
          </span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {availableAmbs} / {ambulances.length}
          </div>
          <span className="text-[10px] text-slate-400">108 Outposts</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Network Hospitals
          </span>
          <div className="text-3xl font-black text-blue-400 font-mono">{hospitals.length}</div>
          <span className="text-[10px] text-slate-400">Karnataka Covered</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            Available ICU Beds
          </span>
          <div className="text-3xl font-black text-cyan-400 font-mono">{availableIcuSum}</div>
          <span className="text-[10px] text-slate-400">Critical Care Beds</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            General Beds Free
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono">{availableBedsSum}</div>
          <span className="text-[10px] text-slate-400">Emergency Casualty</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            CAD Operators
          </span>
          <div className="text-3xl font-black text-purple-400 font-mono">{INITIAL_USERS.length}</div>
          <span className="text-[10px] text-slate-400">Authorized Personnel</span>
        </div>
      </div>

      {/* Administrative Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'emergencies', label: '🚨 Emergency Requests Monitor', count: emergencies.length },
          { id: 'hospitals', label: '🏥 Hospital Network Management', count: hospitals.length },
          { id: 'ambulances', label: '🚑 Ambulance Fleet Activity', count: ambulances.length },
          { id: 'users', label: '👥 CAD Personnel & Roles', count: INITIAL_USERS.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950 font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: Emergency Requests Management */}
      {activeTab === 'emergencies' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-base text-white">Live Emergency Dispatch Directory</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search emergency by ID, patient, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ID & Time</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Emergency Type</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Assigned Unit</th>
                  <th className="py-2.5 px-3">Receiving Hospital</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {emergencies
                  .filter((e) =>
                    searchTerm === '' ||
                    e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.emergencyType.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((emg) => {
                    const amb = ambulances.find((a) => a.id === emg.ambulanceId);
                    const hosp = hospitals.find((h) => h.id === emg.hospitalId);

                    return (
                      <tr key={emg.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {emg.id}
                          <span className="text-[10px] text-slate-500 block font-normal">{emg.createdAt}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{emg.patientName}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                            {emg.locationAddress}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{emg.emergencyType}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              emg.severity === 'critical'
                                ? 'bg-red-950 text-red-300 border border-red-800'
                                : 'bg-orange-950 text-orange-300 border border-orange-800'
                            }`}
                          >
                            {emg.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">
                          {amb?.vehicleNumber || 'Unassigned'}
                        </td>
                        <td className="py-3 px-3 text-slate-300 truncate max-w-xs">{hosp?.name || 'Nearest'}</td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold">
                            {emg.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {emg.status !== 'completed' && emg.status !== 'CANCELLED' && (
                              <button
                                onClick={() => cancelEmergency(emg.id)}
                                className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold transition-colors"
                              >
                                Stand Down / Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Hospital Network Management */}
      {activeTab === 'hospitals' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-white">Karnataka Registered Hospital Registry</h3>
              <p className="text-xs text-slate-400">
                Directly adjust acute bed limits, emergency divert triggers, and registry listings.
              </p>
            </div>

            <button
              onClick={() => setShowAddHospitalModal(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Hospital</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-slate-500">{hosp.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        hosp.status === 'available'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : hosp.status === 'limited'
                          ? 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {hosp.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white">{hosp.name}</h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{hosp.address}</p>

                  <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Free ICU Beds</span>
                      <span className="font-mono font-bold text-white text-base">
                        {hosp.availableIcu} / {hosp.icuCapacity}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">General Beds</span>
                      <span className="font-mono font-bold text-cyan-400 text-base">
                        {hosp.availableGeneralBeds} / {hosp.generalBedsCapacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateHospitalBeds(hosp.id, hosp.availableGeneralBeds + 5, hosp.availableIcu + 2)
                      }
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-300"
                    >
                      + Beds
                    </button>
                    <button
                      onClick={() =>
                        updateHospitalStatus(
                          hosp.id,
                          hosp.status === 'full' ? 'available' : 'full',
                          hosp.availableIcu
                        )
                      }
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-amber-300"
                    >
                      Toggle Divert
                    </button>
                  </div>

                  <button
                    onClick={() => deleteHospital(hosp.id)}
                    className="p-1.5 rounded text-rose-500 hover:bg-rose-950/40 transition-colors"
                    title="Remove from network"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Ambulance Fleet Activity */}
      {activeTab === 'ambulances' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white">Karnataka 108 Arogya Kavacha Fleet Telemetry</h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Units: {ambulances.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ambulances.map((amb) => (
              <div
                key={amb.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-emerald-400">{amb.vehicleNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-slate-300 border border-slate-800">
                    {amb.type}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <p>Pilot: <strong className="text-white">{amb.driverName}</strong> ({amb.driverPhone})</p>
                  <p className="text-slate-400 truncate">Outpost: {amb.sector}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-slate-400">Status: <strong className="text-white capitalize">{amb.status.replace('_', ' ')}</strong></span>
                  <span className="font-mono text-cyan-400 font-bold">Fuel: {amb.fuelPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: CAD Personnel & Roles */}
      {activeTab === 'users' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-white">Authorized CAD Dispatch Personnel & Role Registry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INITIAL_USERS.map((usr) => (
              <div
                key={usr.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={usr.avatar}
                    alt={usr.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white">{usr.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold uppercase">
                      {usr.role}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-900 space-y-0.5">
                  <p>Email: <strong className="text-slate-300">{usr.email}</strong></p>
                  <p>Phone: <strong className="text-slate-300">{usr.phone || '98450 10800'}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Hospital Modal */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-black text-lg text-white">Register New Karnataka Hospital</h3>
            <form onSubmit={handleAddHospitalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., District Civil Hospital"
                  value={newHospName}
                  onChange={(e) => setNewHospName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Address & District *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., B.M. Road, Hassan, Karnataka"
                  value={newHospAddr}
                  onChange={(e) => setNewHospAddr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">ICU Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={newHospIcu}
                    onChange={(e) => setNewHospIcu(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">General Beds</label>
                  <input
                    type="number"
                    min="1"
                    value={newHospBeds}
                    onChange={(e) => setNewHospBeds(parseInt(e.target.value) || 100)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddHospitalModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
