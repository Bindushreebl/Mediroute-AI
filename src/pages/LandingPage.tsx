import React, { useRef } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Gauge,
  KeyRound,
  Layers,
  Lock,
  LogIn,
  MapPin,
  Mic,
  Navigation,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Truck,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { AuthSection } from '../components/auth/AuthSection';

interface LandingPageProps {
  onStartEmergency: () => void;
  onExploreDemo: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartEmergency,
  onExploreDemo,
  onNavigateTab,
}) => {
  const {
    emergencies,
    ambulances,
    hospitals,
    isAuthenticated,
    currentUser,
    loginWithRolePreset,
  } = useEmergency();
  const authSectionRef = useRef<HTMLDivElement>(null);

  const scrollToAuth = () => {
    if (authSectionRef.current) {
      authSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartResponse = () => {
    if (!isAuthenticated) {
      scrollToAuth();
    } else {
      onStartEmergency();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-rose-600/15 via-blue-600/15 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Clean Unboxed Editorial Eyebrow */}
          <div className="flex items-center justify-center gap-2 text-xs text-rose-300 font-semibold tracking-wide">
            <span>State of Karnataka</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>108 Arogya Kavacha Telemetry</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Emergency Decision Support</span>
          </div>

          {/* Main Title */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-sans text-balance">
              When Every Second Matters, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-red-400 to-cyan-400">
                Routing Is Survival.
              </span>
            </h1>
            <p className="text-lg sm:text-xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
              AI-assisted emergency routing, clinical hospital matching, and real-time fleet coordination across all Karnataka districts and taluks.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartResponse}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-950/70 border border-rose-500/40 transition-all active:scale-95 group"
            >
              <Siren className="w-4 h-4" />
              <span>{isAuthenticated ? 'Start Emergency Response' : 'Authenticate CAD Dispatch'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                // Trigger voice CAD assistant from context
                const btn = document.querySelector('header button[title*="Voice CAD"]') as HTMLButtonElement;
                if (btn) btn.click();
              }}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-300 font-bold text-sm border border-cyan-700/50 transition-all shadow-lg active:scale-95"
            >
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Speak to 108 Voice CAD</span>
            </button>

            {!isAuthenticated && (
              <button
                onClick={scrollToAuth}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold text-sm border border-rose-500/30 hover:border-rose-500/50 transition-all shadow-lg active:scale-95"
              >
                <KeyRound className="w-4 h-4 text-rose-400" />
                <span>Personnel Sign In</span>
              </button>
            )}

            <button
              onClick={onExploreDemo}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-800 hover:border-slate-700 transition-all shadow-lg active:scale-95"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Map</span>
            </button>
          </div>

          {/* Live Mini Stats Bar */}
          <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Fleet</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-emerald-400 font-mono">{ambulances.length} Units</span>
                <Truck className="w-5 h-5 text-emerald-500/60" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">ALS, BLS & Neonatal</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Network Hospitals</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-rose-400 font-mono">{hospitals.length} Centers</span>
                <Building2 className="w-5 h-5 text-rose-500/60" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Live ICU telemetry</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avg Response Time</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-cyan-400 font-mono">11 min</span>
                <Clock className="w-5 h-5 text-cyan-500/60" />
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-semibold">-28% vs city benchmark</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Routing Algorithm</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-purple-400 font-mono">AI Multi-Path</span>
                <Brain className="w-5 h-5 text-purple-500/60" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Penalty-scored cost</span>
            </div>
          </div>

          {/* 4 Dedicated Emergency Role Portals */}
          <div className="pt-6 max-w-6xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-800/50">
                Four Specialized Operational Portals
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Experience MediRoute AI by User Role
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Each stakeholder has a dedicated command interface designed for high-stress emergency response.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Role 1: Ambulance Driver */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/70 transition-all shadow-xl flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                    🚑
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">
                      Emergency Fleet
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Ambulance Pilot
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live GPS HUD navigation, turn-by-turn guidance, siren speed telemetry, and 1-tap CAD status progression.
                  </p>
                </div>

                <button
                  onClick={() => {
                    loginWithRolePreset('driver');
                    onNavigateTab('dashboard');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
                >
                  <span>Launch Driver Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Role 2: Patient / Citizen */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 hover:border-rose-500/70 transition-all shadow-xl flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                    👤
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">
                      Public Requester
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                      Citizen / Patient
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    1-Tap SOS Emergency dispatch, automated GPS location pickup, live 108 tracking, and AI hospital suitability.
                  </p>
                </div>

                <button
                  onClick={() => {
                    loginWithRolePreset('patient');
                    onNavigateTab('dashboard');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all active:scale-95"
                >
                  <span>Launch Patient Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Role 3: Hospital Staff */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/30 hover:border-blue-500/70 transition-all shadow-xl flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                    🏥
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
                      Clinical Reception
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      Hospital Triage
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Incoming emergency radar, Accept/Reject triage with automatic rerouting, and real-time ICU & bed inventory counters.
                  </p>
                </div>

                <button
                  onClick={() => {
                    loginWithRolePreset('hospital');
                    onNavigateTab('dashboard');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-950/50 transition-all active:scale-95"
                >
                  <span>Launch Hospital Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Role 4: CAD Administrator */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 hover:border-purple-500/70 transition-all shadow-xl flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold text-2xl shadow-inner">
                    🛡️
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                      Statewide Command
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      CAD Administrator
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Fleet management, district telemetry, ambulance reassignments, facility registries, and traffic simulations.
                  </p>
                </div>

                <button
                  onClick={() => {
                    loginWithRolePreset('admin');
                    onNavigateTab('dashboard');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/50 transition-all active:scale-95"
                >
                  <span>Launch Admin Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Embedded Auth Portal Section */}
          <div ref={authSectionRef} className="pt-12 max-w-xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/50">
                JWT CAD Access Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isAuthenticated ? 'Authenticated CAD Session' : 'First Responder & Dispatcher Access'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAuthenticated
                  ? 'Your session is active. You have full access to real-time dispatch and routing controls.'
                  : 'Toggle between CAD Sign In and New Account registration, or use 1-click demo presets.'}
              </p>
            </div>

            <AuthSection onSuccess={() => onNavigateTab('dashboard')} />
          </div>
        </div>
      </section>

      {/* The Core Problem & The Solution */}
      <section className="py-16 sm:py-24 bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400">
              The Critical Challenge in Emergency Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why Seconds Turn Into Fatal Minutes
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Urban medical emergencies suffer from fragmented dispatch, inaccurate traffic estimates, and hospital department mismatches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 text-rose-400 flex items-center justify-center font-bold text-lg border border-red-800/40">
                🚦
              </div>
              <h3 className="font-bold text-base text-white">Traffic Congestion Blindness</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard consumer GPS maps prioritize passenger comfort, not emergency priority lanes, bottlenecking sirens in sudden traffic choke points.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-800/40">
                🏥
              </div>
              <h3 className="font-bold text-base text-white">Hospital Capability Mismatches</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ambulances often arrive at the closest hospital only to find full ICU beds, diversion status, or an inactive cardiac catheterization lab.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-800/40">
                📡
              </div>
              <h3 className="font-bold text-base text-white">Disconnected Fleet Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Without a unified GIS command center, dispatchers lose track of units in transit, delaying second-stage handoffs and emergency reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The AI Optimization Model Formulation */}
      <section className="py-16 sm:py-24 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
              Core Engineering Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Intelligent Multi-Factor Route Scoring
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              MediRoute AI evaluates dynamic cost surfaces rather than simple shortest distance:
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-base sm:text-lg text-cyan-300 font-extrabold">
              Route Score = Travel Time + Traffic Penalty + Distance Penalty + Road Risk Penalty
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-emerald-400 block">1. Travel Time Component</span>
                <p className="text-slate-400">
                  Calculated dynamically from segment speed limits, green-light priority factor, and siren speeds.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-amber-400 block">2. Traffic Congestion Penalty</span>
                <p className="text-slate-400">
                  Exponential penalty curve applied to High and Severe zones to avoid gridlock risks.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-blue-400 block">3. Distance Penalty</span>
                <p className="text-slate-400">
                  Fuel conservation and wear optimization preventing excessive detour excursions.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                <span className="font-bold text-rose-400 block">4. Emergency Severity Multiplier</span>
                <p className="text-slate-400">
                  Critical life-threat events scale traffic penalties 1.6x, forcefully favoring high-speed express corridors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Modules Overview */}
      <section className="py-16 sm:py-24 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Full-Stack System Architecture</h2>
            <p className="text-xs sm:text-sm text-slate-400">Built for production emergency dispatch operations</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 text-sm block">Frontend</span>
              <p className="text-slate-300">React 19, TypeScript, Tailwind CSS, Leaflet, Recharts, Lucide React</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 text-sm block">Backend Architecture</span>
              <p className="text-slate-300">Python FastAPI, SQLAlchemy ORM, Pydantic Schemas, SQLite Database</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 text-sm block">AI & Optimization</span>
              <p className="text-slate-300">NumPy, Pandas, Scikit-learn, Multi-factor Cost Surface Optimizer</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-purple-400 text-sm block">Geospatial GIS</span>
              <p className="text-slate-300">OpenStreetMap, Haversine Matrix, GeoJSON Traffic Polygons</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Safety Notice */}
      <footer className="py-8 bg-slate-950 text-slate-500 text-xs text-center border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="text-slate-400">
            <strong>MediRoute AI</strong> — Smart Ambulance Route & Emergency Response System. Final Year Engineering Project.
          </p>
          <p className="text-[11px] text-slate-600">
            Disclaimer: This application is a prototype decision-support simulation. Emergency information and route estimates must be verified through authorized emergency services before real-world operational use.
          </p>
        </div>
      </footer>
    </div>
  );
};
