import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownRight,
  Gauge,
  MapPin,
  Maximize2,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Siren,
  Sparkles,
  Truck,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { Emergency, EmergencyStatus, RouteOption } from '../../types';
import { useEmergency } from '../../context/EmergencyContext';

interface LiveNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: Emergency;
}

interface NavStep {
  id: number;
  instruction: string;
  distanceMeters: number;
  icon: string;
  landmark: string;
  targetStage: 'to_patient' | 'to_hospital';
}

export const LiveNavigationModal: React.FC<LiveNavigationModalProps> = ({
  isOpen,
  onClose,
  emergency,
}) => {
  const {
    ambulances,
    hospitals,
    updateEmergencyStatus,
    switchEmergencyRoute,
  } = useEmergency();

  const assignedAmb = ambulances.find((a) => a.id === emergency.ambulanceId);
  const assignedHosp = hospitals.find((h) => h.id === emergency.hospitalId);
  const selectedRoute = emergency.selectedRoute;

  // Turn-by-turn steps
  const navSteps: NavStep[] = [
    {
      id: 1,
      instruction: 'Head northeast on Outpost Exit toward Main Arterial Road',
      distanceMeters: 350,
      icon: '⬆️',
      landmark: '108 Arogya Kavacha Station',
      targetStage: 'to_patient',
    },
    {
      id: 2,
      instruction: 'Turn right onto Primary Corridor / Express Highway with Siren Active',
      distanceMeters: 1200,
      icon: '↗️',
      landmark: 'Signal Corridor Priority Override',
      targetStage: 'to_patient',
    },
    {
      id: 3,
      instruction: `Arrive at Patient Incident Scene: ${emergency.locationAddress}`,
      distanceMeters: 450,
      icon: '📍',
      landmark: emergency.patientName,
      targetStage: 'to_patient',
    },
    {
      id: 4,
      instruction: `Depart scene with patient secured, head toward ${assignedHosp?.name || 'Hospital'}`,
      distanceMeters: 800,
      icon: '🚑',
      landmark: 'Pre-notification sent to Emergency ER Bay',
      targetStage: 'to_hospital',
    },
    {
      id: 5,
      instruction: 'Merge onto NH Priority Medical Lane — Keep right at Junction',
      distanceMeters: 2600,
      icon: '⬆️',
      landmark: 'Green Corridor Traffic Signal Green Wave',
      targetStage: 'to_hospital',
    },
    {
      id: 6,
      instruction: 'Take ramp toward Hospital Emergency Entrance / Casualty Wing',
      distanceMeters: 550,
      icon: '↘️',
      landmark: 'Ambulance Bay Priority Ramp',
      targetStage: 'to_hospital',
    },
    {
      id: 7,
      instruction: `Arrive at ${assignedHosp?.name || 'Hospital'} Emergency Resuscitation Bay`,
      distanceMeters: 100,
      icon: '🏥',
      landmark: 'Trauma & ICU Receiving Bay',
      targetStage: 'to_hospital',
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 5>(2);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(62);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(
    selectedRoute ? selectedRoute.distanceKm : 5.8
  );
  const [etaRemainingMinutes, setEtaRemainingMinutes] = useState(
    selectedRoute ? selectedRoute.durationMinutes : 9
  );
  const [sirenActive, setSirenActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Web Audio API emergency siren synthesizer
  useEffect(() => {
    if (!soundEnabled || !isOpen) {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore
        }
        oscillatorRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Pitch sweep European / Indian 108 ambulance sound
      let up = true;
      let freq = 650;
      const pitchInterval = setInterval(() => {
        if (!oscillatorRef.current) return;
        freq = up ? freq + 35 : freq - 35;
        if (freq > 950) up = false;
        if (freq < 580) up = true;
        try {
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
        } catch {
          // ignore
        }
      }, 50);

      osc.start();
      oscillatorRef.current = osc;

      return () => {
        clearInterval(pitchInterval);
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
        oscillatorRef.current = null;
      };
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }, [soundEnabled, isOpen]);

  // Simulation timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const intervalTime = 1200 / playbackSpeed;
    const timer = setInterval(() => {
      setDistanceRemainingKm((prev) => {
        const next = Math.max(0, prev - 0.15 * playbackSpeed);
        if (next === 0 && currentStepIndex < navSteps.length - 1) {
          setCurrentStepIndex((s) => Math.min(navSteps.length - 1, s + 1));
        }
        return Math.round(next * 10) / 10;
      });

      setEtaRemainingMinutes((prev) => {
        if (prev <= 1) return 1;
        return Math.max(1, prev - (Math.random() > 0.6 ? 1 : 0));
      });

      // Small jitter for speed
      setCurrentSpeedKmh((prev) => {
        const jitter = Math.floor(Math.random() * 7) - 3;
        return Math.min(85, Math.max(45, prev + jitter));
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, playbackSpeed, currentStepIndex, navSteps.length]);

  if (!isOpen) return null;

  const currentStep = navSteps[currentStepIndex];
  const nextStep = navSteps[currentStepIndex + 1];
  const progressPercent = Math.min(
    100,
    Math.round(((currentStepIndex + 1) / navSteps.length) * 100)
  );

  const handleNextStep = () => {
    if (currentStepIndex < navSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Navigation HUD Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-red-600/30 text-red-400 border border-red-500/50 shadow-lg">
              <Navigation className="w-6 h-6 animate-pulse" />
              {sirenActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Tactical Turn-by-Turn CAD Navigation</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  GPS LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Unit: <strong className="text-emerald-400">{assignedAmb?.vehicleNumber || '108 Arogya Kavacha'}</strong> ({assignedAmb?.driverName || 'Pilot On-Duty'}) • Incident: <strong className="text-white">{emergency.id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-rose-600/30 text-rose-300 border-rose-500/50 ring-2 ring-rose-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={soundEnabled ? 'Mute 108 Siren Audio' : 'Play 108 Siren Synthesizer'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-rose-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Siren Audio ON' : 'Muted'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live HUD Dashboard Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Main Giant Instruction Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-2 border-cyan-500/40 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/20 text-3xl border border-cyan-400/40 shrink-0">
                  {currentStep.icon}
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>In {currentStep.distanceMeters} Meters:</span>
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {currentStep.instruction}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>Waymark: <strong className="text-slate-200">{currentStep.landmark}</strong></span>
                  </p>
                </div>
              </div>

              {nextStep && (
                <div className="hidden md:block p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-right text-xs shrink-0 max-w-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Then Next:</span>
                  <p className="text-slate-300 font-semibold truncate mt-0.5">{nextStep.instruction}</p>
                </div>
              )}
            </div>

            {/* Route progress line */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Nav Step:</span>
                <span className="font-mono font-bold text-white">
                  {currentStepIndex + 1} of {navSteps.length}
                </span>
              </div>
              <div className="w-1/2 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-rose-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-cyan-400 font-bold">{progressPercent}% Route Progress</span>
            </div>
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Speed Gauge */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ground Speed
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {currentSpeedKmh}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">km/h</span>
              </div>
              <Gauge className="w-6 h-6 text-emerald-500/50" />
            </div>

            {/* Distance Remaining */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Remaining Dist
                </span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
                  {distanceRemainingKm}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">km</span>
              </div>
              <Compass className="w-6 h-6 text-cyan-500/50" />
            </div>

            {/* Dynamic ETA */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Priority ETA
                </span>
                <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                  ~{etaRemainingMinutes}
                </span>
                <span className="text-[10px] text-slate-500 ml-1">min</span>
              </div>
              <Clock className="w-6 h-6 text-rose-500/50 animate-pulse" />
            </div>

            {/* Corridor Signal State */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Corridor Signals
                </span>
                <span className="text-sm font-extrabold text-emerald-400 block mt-1">
                  GREEN WAVE
                </span>
                <span className="text-[10px] text-slate-400">108 Priority Active</span>
              </div>
              <Zap className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>
          </div>

          {/* Destination Hospital Intake Status Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold">
                🏥
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  Target Destination Hospital
                </span>
                <h4 className="font-extrabold text-sm text-white">{assignedHosp?.name}</h4>
                <p className="text-xs text-slate-400">
                  {assignedHosp?.address} • ICU Beds Free: <strong className="text-emerald-400">{assignedHosp?.availableIcu}</strong>
                </p>
              </div>
            </div>

            {emergency.alternativeRouteAvailable && emergency.alternativeRoute && (
              <button
                onClick={() => switchEmergencyRoute(emergency.id, emergency.alternativeRoute!)}
                className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Bypass ({emergency.alternativeRoute.name})</span>
              </button>
            )}
          </div>

          {/* Mission Milestones - Advance Emergency Status Buttons */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Siren className="w-3.5 h-3.5 text-rose-500" />
                <span>Mission Status Progression (Driver Action)</span>
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Current: {emergency.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <button
                onClick={() => updateEmergencyStatus(emergency.id, 'reached_patient')}
                className={`p-2.5 rounded-xl border font-bold transition-all ${
                  emergency.status === 'reached_patient'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                1. Reached Patient
              </button>
              <button
                onClick={() => updateEmergencyStatus(emergency.id, 'patient_picked_up')}
                className={`p-2.5 rounded-xl border font-bold transition-all ${
                  emergency.status === 'patient_picked_up'
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                2. Patient Secured
              </button>
              <button
                onClick={() => updateEmergencyStatus(emergency.id, 'patient_transporting')}
                className={`p-2.5 rounded-xl border font-bold transition-all ${
                  emergency.status === 'patient_transporting'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                3. En-Route Hospital
              </button>
              <button
                onClick={() => updateEmergencyStatus(emergency.id, 'arrived_hospital')}
                className={`p-2.5 rounded-xl border font-bold transition-all ${
                  emergency.status === 'arrived_hospital'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                4. Arrived at Bay
              </button>
              <button
                onClick={() => {
                  updateEmergencyStatus(emergency.id, 'completed');
                  onClose();
                }}
                className={`p-2.5 rounded-xl border font-bold transition-all ${
                  emergency.status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900/60'
                }`}
              >
                5. Complete Handoff
              </button>
            </div>
          </div>
        </div>

        {/* Footer HUD Simulation Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Resume Telemetry'}</span>
            </button>

            <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-1 text-xs">
              <span className="text-[10px] text-slate-500 font-bold px-2 uppercase">Speed:</span>
              {([1, 2, 5] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    playbackSpeed === s
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setDistanceRemainingKm(selectedRoute?.distanceKm || 5.8);
                setEtaRemainingMinutes(selectedRoute?.durationMinutes || 9);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-800"
              title="Reset route navigation step"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-40 text-xs font-semibold border border-slate-800"
            >
              Previous Turn
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === navSteps.length - 1}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-40"
            >
              <span>Next Turn</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
