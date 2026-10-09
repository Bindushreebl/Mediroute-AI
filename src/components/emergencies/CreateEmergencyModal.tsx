import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  Compass,
  Crosshair,
  HeartPulse,
  Info,
  MapPin,
  Navigation,
  Radio,
  Sparkles,
  Siren,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencySeverity, EmergencyType, Coordinates } from '../../types';
import { KARNATAKA_DISTRICTS } from '../../services/karnatakaData';
import { rankHospitalsForEmergency } from '../../services/aiScoringService';

interface CreateEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (emergencyId: string) => void;
}

export const CreateEmergencyModal: React.FC<CreateEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    createEmergency,
    detectLiveLocation,
    userLiveLocation,
    userLocationAddress,
    selectedDistrict,
    selectedTaluk,
    setKarnatakaDistrictAndTaluk,
    hospitals,
  } = useEmergency();

  const [patientName, setPatientName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('Cardiac Emergency');
  const [customType, setCustomType] = useState('');
  const [severity, setSeverity] = useState<EmergencySeverity>('critical');
  const [requiredDepartment, setRequiredDepartment] = useState('Cardiology & Cath Lab');
  const [patientCount, setPatientCount] = useState<number>(1);
  const [customAddress, setCustomAddress] = useState(
    userLocationAddress || 'MG Road Metro Station, Bengaluru, Karnataka'
  );
  const [incidentCoords, setIncidentCoords] = useState<Coordinates>(
    userLiveLocation || { lat: 12.9738, lng: 77.6080 }
  );
  const [notes, setNotes] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');

  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  const [activeDistrict, setActiveDistrict] = useState<string>(selectedDistrict || 'Bengaluru Urban');
  const districtObj = KARNATAKA_DISTRICTS.find((d) => d.name === activeDistrict) || KARNATAKA_DISTRICTS[0];
  const [activeTaluk, setActiveTaluk] = useState<string>(districtObj.taluks[0]);

  // Compute live ranking of Karnataka hospitals (nearest first) based on incident coordinates
  const rankedKarnatakaHospitals = rankHospitalsForEmergency(
    hospitals,
    {
      location: incidentCoords,
      emergencyType,
      requiredDepartment,
      severity,
    },
    { sortBy: 'distance', limitToKarnatakaOnly: true }
  );

  const topHospital = rankedKarnatakaHospitals[0];

  if (!isOpen) return null;

  const emergencyTypeOptions: { type: EmergencyType; defaultDept: string; icon: string }[] = [
    { type: 'Cardiac Emergency', defaultDept: 'Cardiology & Cath Lab', icon: '❤️' },
    { type: 'Accident / Trauma', defaultDept: 'Trauma Center Level 1', icon: '🚗' },
    { type: 'Stroke Symptoms', defaultDept: 'Comprehensive Stroke & Neurology', icon: '🧠' },
    { type: 'Breathing Difficulty', defaultDept: 'Pulmonary & Respiratory Care', icon: '🫁' },
    { type: 'Severe Bleeding', defaultDept: 'Emergency Surgery & Hemodynamic Triage', icon: '🩸' },
    { type: 'Burn', defaultDept: 'Burn Unit & Intensive Triage', icon: '🔥' },
    { type: 'Poisoning', defaultDept: 'Emergency Toxicology & Critical Care', icon: '🧪' },
    { type: 'Pregnancy Emergency', defaultDept: 'OB-GYN & Neonatal ICU', icon: '👶' },
    { type: 'Pediatric Emergency', defaultDept: 'Pediatric ICU (PICU)', icon: '🧸' },
    { type: 'Eye Emergency', defaultDept: 'Ophthalmology & Ocular Trauma', icon: '👁️' },
    { type: 'General Emergency', defaultDept: 'General Medicine & Rapid Triage', icon: '🏥' },
    { type: 'Other', defaultDept: 'General Emergency', icon: '⚠️' },
  ];

  const handleDetectGPS = async () => {
    setIsLocating(true);
    setLocationSuccessMsg(null);
    const res = await detectLiveLocation();
    setIsLocating(false);

    if (res.success && res.lat && res.lng && res.address) {
      setIncidentCoords({ lat: res.lat, lng: res.lng });
      setCustomAddress(res.address);
      if (res.district) setActiveDistrict(res.district);
      if (res.taluk) setActiveTaluk(res.taluk);
      setLocationSuccessMsg(`📍 Live GPS Locked: ${res.address}`);
    } else {
      setLocationSuccessMsg(res.error || 'Failed to get GPS location.');
    }
  };

  const handleDistrictChange = (distName: string) => {
    setActiveDistrict(distName);
    const matched = KARNATAKA_DISTRICTS.find((d) => d.name === distName) || KARNATAKA_DISTRICTS[0];
    const newTaluk = matched.taluks[0];
    setActiveTaluk(newTaluk);
    setIncidentCoords(matched.center);
    setCustomAddress(`${newTaluk} Taluk, ${matched.name}, Karnataka`);
    setKarnatakaDistrictAndTaluk(distName, newTaluk);
  };

  const handleTalukChange = (talukName: string) => {
    setActiveTaluk(talukName);
    setCustomAddress(`${talukName} Taluk, ${activeDistrict}, Karnataka`);
    setKarnatakaDistrictAndTaluk(activeDistrict, talukName);
  };

  const handleQuickPreset = (name: string, lat: number, lng: number, addr: string, dist: string) => {
    setIncidentCoords({ lat, lng });
    setCustomAddress(addr);
    setActiveDistrict(dist);
    const matched = KARNATAKA_DISTRICTS.find((d) => d.name === dist);
    if (matched) setActiveTaluk(matched.taluks[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenHospitalId = selectedHospitalId || topHospital?.hospital.id;

    const newEmg = createEmergency({
      patientName: patientName.trim() || 'Unidentified Patient (108 Triage)',
      contactPhone: contactPhone.trim() || '98450 10800',
      emergencyType,
      customType: emergencyType === 'Other' ? customType : undefined,
      severity,
      requiredDepartment,
      patientCount,
      location: incidentCoords,
      locationAddress: customAddress,
      hospitalId: chosenHospitalId,
      notes: notes.trim(),
    });

    onSuccess(newEmg.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-red-950/50 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Create Emergency Request</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  AI Auto-Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Log critical incident details to compute closest ambulance and matching hospital.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Severity Radio Tiles */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Emergency Severity Level *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { level: 'critical', label: 'Critical', desc: 'Life-threatening', color: 'border-red-500 bg-red-950/40 text-red-300 ring-red-500' },
                { level: 'high', label: 'High', desc: 'Urgent Intervention', color: 'border-orange-500 bg-orange-950/40 text-orange-300 ring-orange-500' },
                { level: 'medium', label: 'Medium', desc: 'Stable / Monitored', color: 'border-yellow-500 bg-yellow-950/40 text-yellow-300 ring-yellow-500' },
                { level: 'low', label: 'Low', desc: 'Non-Acute Transport', color: 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-emerald-500' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.level}
                  onClick={() => setSeverity(s.level as EmergencySeverity)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    severity === s.level
                      ? `${s.color} ring-2 ring-offset-2 ring-offset-slate-900 shadow-lg font-bold`
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase">{s.label}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{
                      backgroundColor: s.level === 'critical' ? '#ef4444' : s.level === 'high' ? '#f97316' : s.level === 'medium' ? '#eab308' : '#10b981'
                    }}></span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Type Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Emergency Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {emergencyTypeOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => {
                    setEmergencyType(opt.type);
                    setRequiredDepartment(opt.defaultDept);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    emergencyType === opt.type
                      ? 'border-rose-500/80 bg-rose-500/10 text-white font-bold ring-1 ring-rose-500'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate">{opt.type}</span>
                </button>
              ))}
            </div>

            {emergencyType === 'Other' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Specify Custom Emergency Condition..."
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          {/* Patient Details & Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Patient Name / Identifier</label>
              <input
                type="text"
                placeholder="e.g. John Doe (or Unknown Male, Approx 45)"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Number of Victims</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    type="button"
                    key={count}
                    onClick={() => setPatientCount(count)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      patientCount === count
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location & GPS Detection */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Karnataka Incident Location *</span>
              </label>

              {/* LIVE GPS DETECT BUTTON */}
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-60"
              >
                <Crosshair className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{isLocating ? 'Acquiring GPS Satellite Lock...' : 'Use My Live GPS Location'}</span>
              </button>
            </div>

            {locationSuccessMsg && (
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800 text-[11px] text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{locationSuccessMsg}</span>
              </div>
            )}

            {/* Karnataka District & Taluk Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Karnataka District (31 Districts)
                </label>
                <select
                  value={activeDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                >
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.code.split('/')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Taluk / Sub-District
                </label>
                <select
                  value={activeTaluk}
                  onChange={(e) => handleTalukChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
                >
                  {districtObj.taluks.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick City Presets */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Bengaluru (MG Road)', lat: 12.9738, lng: 77.6080, addr: 'MG Road Metro Station, Bengaluru, Karnataka', dist: 'Bengaluru Urban' },
                { label: 'Mysuru (K.R. Circle)', lat: 12.3148, lng: 76.6492, addr: 'Sayyaji Rao Road, K.R. Circle, Mysuru, Karnataka', dist: 'Mysuru (Mysore)' },
                { label: 'Mangaluru (Hampankatta)', lat: 12.8712, lng: 74.8491, addr: 'Hampankatta, Mangaluru, Dakshina Kannada, Karnataka', dist: 'Dakshina Kannada (Mangaluru)' },
                { label: 'Hubballi (Vidyanagar)', lat: 15.3585, lng: 75.1325, addr: 'Vidyanagar Corridor, Hubballi, Dharwad, Karnataka', dist: 'Dharwad (Hubballi-Dharwad)' },
                { label: 'Belagavi (Chennamma Circle)', lat: 15.8572, lng: 74.5098, addr: 'Civil Hospital Road, Belagavi, Karnataka', dist: 'Belagavi (Belgaum)' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => handleQuickPreset(p.label, p.lat, p.lng, p.addr, p.dist)}
                  className="px-2 py-1 rounded-md text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                >
                  📍 {p.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Street address, landmark, taluk, village or GPS description..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
                {incidentCoords.lat.toFixed(4)}, {incidentCoords.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Required Medical Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Target Clinical Specialization</span>
            </label>
            <input
              type="text"
              value={requiredDepartment}
              onChange={(e) => setRequiredDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* AI Recommended Destination Hospitals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Recommended Receiving Hospitals (Nearest First)</span>
              </label>
              <span className="text-[10px] text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800">
                AI Clinical Matching
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {rankedKarnatakaHospitals.slice(0, 3).map((analysis, idx) => {
                const hosp = analysis.hospital;
                const isSelected = (selectedHospitalId || topHospital?.hospital.id) === hosp.id;

                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospitalId(hosp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          {idx === 0 ? '⭐ Top Match' : `#${idx + 1} Option`}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-950 text-purple-300 border border-purple-800">
                          {analysis.matchScore}% Match
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-white line-clamp-1">{hosp.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{hosp.address}</p>

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-300 font-mono">
                        <span className="text-cyan-300 font-bold">{analysis.distanceKm} km</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">~{analysis.etaMinutes}m ETA</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{hosp.availableIcu} ICU</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {isSelected ? '✓ Selected Bay' : 'Click to Select'}
                      </span>
                      <span className="text-slate-500">{hosp.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Triage Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Paramedic Notes & Symptoms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vitals, conscious state, bleeding, suspected fractures, allergies..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* AI Automated Pipeline Preview Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-950 border border-blue-500/30 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Automated Dispatch Pipeline on Submit:</span>
            </div>
            <ol className="text-[11px] text-slate-300 list-decimal list-inside space-y-0.5 pl-1">
              <li>Calculates Haversine distance to available ambulances in fleet</li>
              <li>Scores matching hospitals by department readiness & ICU bed ratio</li>
              <li>Runs AI Route Scoring equation considering live traffic penalties</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/80 transition-all active:scale-95"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Dispatch Emergency Response</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
