import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Crosshair,
  FileText,
  HeartHandshake,
  HeartPulse,
  Info,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Radio,
  ShieldCheck,
  Siren,
  Sparkles,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { Emergency, EmergencyType, Coordinates } from '../../types';
import { KARNATAKA_DISTRICTS } from '../../services/karnatakaData';
import { rankHospitalsForEmergency } from '../../services/aiScoringService';

interface PatientDashboardProps {
  onOpenCreateEmergency: () => void;
  onNavigateTab: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onOpenCreateEmergency,
  onNavigateTab,
}) => {
  const {
    currentUser,
    emergencies,
    ambulances,
    hospitals,
    userLiveLocation,
    userLocationAddress,
    detectLiveLocation,
    createEmergency,
    selectedDistrict,
    selectedTaluk,
    setKarnatakaDistrictAndTaluk,
  } = useEmergency();

  const [isLocating, setIsLocating] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType>('Cardiac Emergency');
  const [patientNote, setPatientNote] = useState('');
  const [sosSentSuccess, setSosSentSuccess] = useState(false);

  // Patient's active emergency or most recent
  const myActiveEmergency = emergencies.find(
    (e) => e.patientName.toLowerCase().includes('pooja') || e.status !== 'completed'
  );

  const assignedAmbulance = ambulances.find((a) => a.id === myActiveEmergency?.ambulanceId);
  const assignedHospital = hospitals.find((h) => h.id === myActiveEmergency?.hospitalId);

  // Quick 1-Tap SOS dispatch
  const handleQuickSos = async () => {
    let loc: Coordinates | null = userLiveLocation;
    let addr: string | null | undefined = userLocationAddress;

    if (!loc) {
      const res = await detectLiveLocation();
      if (res.lat && res.lng) {
        loc = { lat: res.lat, lng: res.lng };
        addr = res.address || null;
      } else {
        loc = { lat: 12.9716, lng: 77.5946 };
        addr = 'MG Road, Bengaluru, Karnataka';
      }
    }

    createEmergency({
      patientName: currentUser?.name || 'Pooja Sharma (Citizen Requester)',
      contactPhone: currentUser?.phone || '98452 77890',
      emergencyType: selectedEmergencyType,
      severity: 'critical',
      location: loc,
      locationAddress: addr || `${selectedTaluk} Taluk, ${selectedDistrict}, Karnataka`,
      notes: patientNote || 'Emergency assistance requested via Citizen 108 Arogya Kavacha Mobile Portal',
    });

    setSosSentSuccess(true);
    setTimeout(() => setSosSentSuccess(false), 4000);
  };

  const handleDetectGPS = async () => {
    setIsLocating(true);
    await detectLiveLocation();
    setIsLocating(false);
  };

  // First-Aid Guidance tips for emergencies
  const firstAidTips: Record<string, string[]> = {
    'Cardiac Emergency': [
      'Keep patient resting comfortably in a semi-upright position.',
      'Loosen any tight clothing around the neck and chest.',
      'If prescribed, assist the patient in taking Nitroglycerin or Aspirin (if not allergic).',
      'Keep AED / CPR ready if patient becomes unresponsive.',
    ],
    'Accident / Trauma': [
      'Do not move the patient unless there is an immediate danger (fire or traffic).',
      'Apply direct, steady pressure on any severe bleeding with a clean cloth.',
      'Keep the patient warm with a blanket or jacket to prevent trauma shock.',
      'Do not give anything to eat or drink.',
    ],
    'Stroke Symptoms': [
      'Check F.A.S.T: Face drooping, Arm weakness, Speech difficulty, Time to call 108.',
      'Note the exact time symptoms started for hospital stroke clot-buster medication.',
      'Keep patient lying on their side if vomiting or unconscious.',
      'Do not give aspirin or food.',
    ],
    'Breathing Difficulty': [
      'Sit the patient upright; leaning forward slightly helps ease breathing.',
      'Help patient administer their prescribed rescue inhaler or nebulizer.',
      'Ensure adequate ventilation / open windows or clear crowds.',
      'Remain calm to reduce hyperventilation.',
    ],
    'Severe Bleeding': [
      'Apply firm, continuous pressure directly over the wound with clean cloth.',
      'Elevate the injured limb above heart level if no fracture is suspected.',
      'Do not remove objects deeply embedded; stabilize them in place.',
      'Keep patient lying down and calm.',
    ],
  };

  const currentTips = firstAidTips[selectedEmergencyType] || firstAidTips['Cardiac Emergency'];

  return (
    <div className="space-y-6">
      {/* Citizen 108 Emergency Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-r from-red-950/70 via-rose-950/50 to-slate-900 border-2 border-red-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-600 text-white flex items-center justify-center font-black text-3xl shadow-2xl shadow-rose-900/80 shrink-0">
            <span className="text-3xl">🆘</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                Arogya Kavacha 108 Emergency
              </span>
              <span className="text-xs text-rose-300 font-semibold">• Government of Karnataka</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {currentUser?.name || 'Pooja Sharma'} — Emergency Assistance
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Current Location: <strong className="text-cyan-300">{userLocationAddress || `${selectedTaluk} Taluk, ${selectedDistrict}, Karnataka`}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all shadow-md"
          >
            <Crosshair className={`w-4 h-4 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating GPS...' : 'Use My Live GPS Location'}</span>
          </button>

          <a
            href="tel:108"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-xl shadow-rose-950/80 transition-all active:scale-95"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Call 108 Hotline</span>
          </a>
        </div>
      </div>

      {/* Active Request Live Status Tracker */}
      {myActiveEmergency ? (
        <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ASSISTANCE ACTIVE • {myActiveEmergency.id}
                </span>
                <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                  {myActiveEmergency.severity}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {myActiveEmergency.emergencyType} — Response Dispatched
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance ETA</span>
              <span className="text-2xl font-black text-rose-400 font-mono">
                ~{myActiveEmergency.selectedRoute?.durationMinutes || 7} mins
              </span>
            </div>
          </div>

          {/* Stepper Status Visualizer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              {
                title: '1. Request Received',
                active: true,
                desc: 'Logged with CAD dispatch center',
              },
              {
                title: '2. Ambulance En Route',
                active:
                  myActiveEmergency.status !== 'REQUESTED' &&
                  myActiveEmergency.status !== 'SEARCHING',
                desc: assignedAmbulance ? `${assignedAmbulance.vehicleNumber}` : 'Assigning unit',
              },
              {
                title: '3. Paramedic Triage',
                active:
                  myActiveEmergency.status === 'reached_patient' ||
                  myActiveEmergency.status === 'patient_picked_up' ||
                  myActiveEmergency.status === 'patient_transporting' ||
                  myActiveEmergency.status === 'arrived_hospital' ||
                  myActiveEmergency.status === 'completed',
                desc: 'On-scene medical assessment',
              },
              {
                title: '4. Hospital Receiving',
                active:
                  myActiveEmergency.status === 'patient_transporting' ||
                  myActiveEmergency.status === 'arrived_hospital' ||
                  myActiveEmergency.status === 'completed',
                desc: assignedHospital ? assignedHospital.name : 'Emergency Bay',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  step.active
                    ? 'bg-slate-950 border-emerald-500/50 shadow-md'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-1.5 font-extrabold">
                  {step.active ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className={step.active ? 'text-white' : 'text-slate-500'}>
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Assigned Unit & Recommended Hospital Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assigned Ambulance Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" /> Assigned 108 Ambulance Unit
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  {assignedAmbulance?.type || 'ALS'}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-white">
                  {assignedAmbulance?.vehicleNumber || '108 Arogya Kavacha'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lead Pilot: <strong className="text-slate-200">{assignedAmbulance?.driverName || 'Paramedic Crew'}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <span className="text-slate-400">Sector: {assignedAmbulance?.sector || 'Karnataka'}</span>
                <a
                  href={`tel:${assignedAmbulance?.driverPhone || '108'}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Crew ({assignedAmbulance?.driverPhone || '108'})</span>
                </a>
              </div>
            </div>

            {/* Recommended Hospital Card with AI Suitability Score */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Matched Receiving Hospital
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Suitability: 94%</span>
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-white">
                  {assignedHospital?.name || 'State Trauma Hospital'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{assignedHospital?.address}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <p className="leading-snug">
                  🤖 <strong className="text-purple-300">AI Match:</strong> Selected for specialized emergency casualty triage, immediate ICU readiness ({assignedHospital?.availableIcu || 8} free beds), and fastest clear corridor (~{myActiveEmergency.selectedRoute?.durationMinutes || 7}m).
                </p>
                <span className="text-[9px] text-slate-500 block mt-1">
                  *Software recommendation score — Prototype Decision Support (not medical diagnosis).
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 1-Tap SOS Request Panel (if no emergency or to dispatch another) */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Siren className="w-5 h-5 text-rose-500" />
              <span>Instant Emergency Assistance Dispatcher</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select condition and confirm location for nearest 108 Arogya Kavacha dispatch.
            </p>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Auto-Proximity Match
          </span>
        </div>

        {/* Emergency Type Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Select Emergency Category:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { type: 'Cardiac Emergency', icon: '❤️', label: 'Heart Attack / Chest Pain' },
              { type: 'Accident / Trauma', icon: '🚗', label: 'Road Accident / Trauma' },
              { type: 'Stroke Symptoms', icon: '🧠', label: 'Stroke / Facial Numbness' },
              { type: 'Breathing Difficulty', icon: '🫁', label: 'Severe Asthma / Choking' },
              { type: 'Severe Bleeding', icon: '🩸', label: 'Hemorrhage / Deep Cut' },
              { type: 'Burn', icon: '🔥', label: 'Thermal / Chemical Burn' },
              { type: 'Pregnancy Emergency', icon: '👶', label: 'Labor / Obstetric Complication' },
              { type: 'General Emergency', icon: '🏥', label: 'High Fever / Convulsions' },
            ].map((cat) => (
              <button
                key={cat.type}
                type="button"
                onClick={() => setSelectedEmergencyType(cat.type as EmergencyType)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedEmergencyType === cat.type
                    ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/20 text-white shadow-lg font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="text-xs font-bold text-white truncate">{cat.type}</div>
                <div className="text-[10px] text-slate-400 truncate">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes & Location Confirmation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Incident Scene Notes (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g., Near Bus Stand, 2nd floor, patient is conscious..."
              value={patientNote}
              onChange={(e) => setPatientNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Karnataka District / Taluk:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedDistrict}
                onChange={(e) => setKarnatakaDistrictAndTaluk(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {KARNATAKA_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.code.split('/')[0]})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-colors"
                title="Detect live GPS"
              >
                📍 GPS
              </button>
            </div>
          </div>
        </div>

        {/* SOS Action Button */}
        <button
          onClick={handleQuickSos}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-rose-950/90 border border-rose-500/40 transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <AlertOctagon className="w-5 h-5 animate-pulse" />
          <span>CONFIRM & DISPATCH 108 AMBULANCE NOW</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {sosSentSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Emergency request successfully transmitted to Karnataka 108 State Dispatch Center!</span>
          </div>
        )}
      </div>

      {/* First-Aid Life Support Guidance Card while waiting */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white">
              What to Do While Waiting for the 108 Ambulance: {selectedEmergencyType}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Triage Advisory</span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          {currentTips.map((tip, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-snug">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
