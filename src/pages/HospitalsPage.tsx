import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Compass,
  Filter,
  Flame,
  HeartPulse,
  Info,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  X,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { Hospital, HospitalStatus, EmergencyType } from '../types';
import { rankHospitalsForEmergency } from '../services/aiScoringService';
import { KARNATAKA_CENTER } from '../services/storageService';

export const HospitalsPage: React.FC = () => {
  const {
    hospitals,
    updateHospitalStatus,
    selectedEmergency,
    userLiveLocation,
    userLocationAddress,
  } = useEmergency();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | HospitalStatus>('all');
  const [sortOption, setSortOption] = useState<'distance' | 'suitability'>('distance');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(hospitals[0] || null);
  const [testEmergencyType, setTestEmergencyType] = useState<EmergencyType>('Cardiac Emergency');

  // User location or Karnataka state center
  const refLocation = userLiveLocation || selectedEmergency?.location || KARNATAKA_CENTER;

  // Run AI matching and distance calculation specifically for Karnataka hospitals
  const rankedAnalyses = rankHospitalsForEmergency(
    hospitals,
    {
      location: refLocation,
      emergencyType: testEmergencyType,
      severity: 'critical',
    },
    { sortBy: sortOption, limitToKarnatakaOnly: true }
  );

  // Filter hospitals preserving the sorted order (nearest first by default)
  const filteredAnalyses = rankedAnalyses.filter((item) => {
    const h = item.hospital;
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: HospitalStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Available
          </span>
        );
      case 'limited':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-yellow-950/80 text-yellow-400 border border-yellow-800">
            Limited
          </span>
        );
      case 'full':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-red-950/80 text-red-400 border border-red-800">
            Full / Diverting
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
            <Building2 className="w-6 h-6 text-rose-500" />
            <span>Karnataka Hospital Network & Triage</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-bold">
              Realistic Sample / Demo Data
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Displaying hospitals across Karnataka filtered against GPS coordinates — nearest facilities displayed first with AI suitability scoring.
          </p>
        </div>

        {/* Current Reference Location Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Origin: {userLocationAddress ? userLocationAddress.split(',')[0] : 'Karnataka Reference Point'}</span>
        </div>
      </div>

      {/* AI Recommendation Testing & Sorting Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="font-extrabold text-xs text-white uppercase tracking-wider">
              AI Smart Hospital Suitability Simulator
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Sort Order:</span>
            <button
              onClick={() => setSortOption('distance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sortOption === 'distance'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📍 Nearest First
            </button>
            <button
              onClick={() => setSortOption('suitability')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                sortOption === 'suitability'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Highest AI Match
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-300 font-semibold mr-1">Emergency Category:</span>
          {([
            'Cardiac Emergency',
            'Accident / Trauma',
            'Stroke Symptoms',
            'Breathing Difficulty',
            'Burn',
            'Pregnancy Emergency',
            'Pediatric Emergency',
          ] as EmergencyType[]).map((type) => (
            <button
              key={type}
              onClick={() => setTestEmergencyType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                testEmergencyType === type
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Karnataka hospital by name, district, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {(['all', 'available', 'limited', 'full'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Hospitals Grid (Nearest Displayed First) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnalyses.map((item, index) => {
          const hosp = item.hospital;
          const isSelected = selectedHospital?.id === hosp.id;

          return (
            <div
              key={hosp.id}
              onClick={() => setSelectedHospital(hosp)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-rose-500 ring-2 ring-rose-500/20 shadow-2xl'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-mono">
                      #{index + 1}
                    </span>
                    <h3 className="font-extrabold text-sm text-white line-clamp-1">{hosp.name}</h3>
                  </div>
                  {getStatusBadge(hosp.status)}
                </div>

                <p className="text-xs text-slate-400 line-clamp-1 mb-2.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{hosp.address}</span>
                </p>

                {/* Distance & AI Match Banner */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-sm font-black text-cyan-300 font-mono">
                        {item.distanceKm} km
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (~{item.etaMinutes} min)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Match:</span>
                      <span className="text-sm font-black text-purple-400 font-mono">
                        {item.matchScore}%
                      </span>
                    </div>
                  </div>

                  {item.aiRecommendationSummary && (
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-snug border-t border-slate-900 pt-1">
                      {item.aiRecommendationSummary}
                    </p>
                  )}
                </div>

                {/* Key Capacity Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">ICU Beds Free</span>
                    <span className={`text-base font-black font-mono ${hosp.availableIcu > 2 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {hosp.availableIcu} <span className="text-xs font-normal text-slate-400">/ {hosp.icuCapacity}</span>
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">ED Wait Time</span>
                    <span className="text-base font-black text-cyan-400 font-mono">
                      ~{hosp.waitTimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
                    </span>
                  </div>
                </div>

                {/* Capabilities pills */}
                <div className="flex flex-wrap gap-1">
                  {hosp.traumaCenter && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                      Trauma Center
                    </span>
                  )}
                  {hosp.cardiology && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      Cardiology
                    </span>
                  )}
                  {hosp.neurology && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      Stroke Center
                    </span>
                  )}
                  {hosp.burnUnit && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800">
                      Burn Unit
                    </span>
                  )}
                  {hosp.pediatrics && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-800">
                      Pediatrics
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{hosp.phone}</span>
                </span>
                <span className="text-slate-500 text-[10px]">{hosp.sector}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Hospital Bed Capacity Adjuster & Triage Control */}
      {selectedHospital && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Clinical Facility Operational Controls
              </span>
              <h3 className="text-base font-black text-white">
                {selectedHospital.name} (Triage Management)
              </h3>
            </div>
            {getStatusBadge(selectedHospital.status)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Quick status override */}
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase text-[10px]">
                Facility Receiving Status
              </label>
              <div className="flex items-center gap-1.5">
                {(['available', 'limited', 'full'] as HospitalStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateHospitalStatus(selectedHospital.id, st, selectedHospital.availableIcu)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      selectedHospital.status === st
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* ICU Beds slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Available ICU Beds
                </label>
                <span className="font-mono font-bold text-cyan-400">
                  {selectedHospital.availableIcu} of {selectedHospital.icuCapacity}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={selectedHospital.icuCapacity}
                value={selectedHospital.availableIcu}
                onChange={(e) =>
                  updateHospitalStatus(
                    selectedHospital.id,
                    selectedHospital.status,
                    parseInt(e.target.value, 10)
                  )
                }
                className="w-full accent-rose-500"
              />
            </div>

            {/* Proximity notice */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-snug">
                Updating bed numbers dynamically re-ranks candidate hospitals during emergency intake calls.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
