import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HeartPulse,
  Layers,
  MapPin,
  Navigation,
  Radio,
  Shield,
  Siren,
  Sparkles,
  TrendingDown,
  Truck,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { DriverDashboard } from '../components/roles/DriverDashboard';
import { PatientDashboard } from '../components/roles/PatientDashboard';
import { HospitalDashboard } from '../components/roles/HospitalDashboard';
import { AdminDashboard } from '../components/roles/AdminDashboard';
import { UserRole } from '../types';

interface DashboardPageProps {
  onOpenCreateEmergency: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateEmergency,
  onNavigateTab,
}) => {
  const { currentUser } = useEmergency();

  // Determine active view mode based on current user role, with evaluator override
  const getInitialViewMode = (): 'driver' | 'patient' | 'hospital' | 'admin' => {
    if (currentUser?.role === 'driver') return 'driver';
    if (currentUser?.role === 'patient') return 'patient';
    if (currentUser?.role === 'hospital') return 'hospital';
    return 'admin';
  };

  const [viewMode, setViewMode] = useState<'driver' | 'patient' | 'hospital' | 'admin'>(
    getInitialViewMode()
  );

  useEffect(() => {
    setViewMode(getInitialViewMode());
  }, [currentUser?.role]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Role Perspective Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 px-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active Role Perspective:
          </span>
          <span className="text-xs font-bold text-white capitalize bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
            {currentUser?.role || 'admin'} session
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full sm:w-auto text-xs font-bold">
          <button
            onClick={() => setViewMode('driver')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'driver'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>🚑 Ambulance Pilot</span>
          </button>

          <button
            onClick={() => setViewMode('patient')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'patient'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>👤 Patient / Citizen</span>
          </button>

          <button
            onClick={() => setViewMode('hospital')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'hospital'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>🏥 Hospital Staff</span>
          </button>

          <button
            onClick={() => setViewMode('admin')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>🛡️ CAD Admin</span>
          </button>
        </div>
      </div>

      {/* Render Dynamic Role View */}
      {viewMode === 'driver' && (
        <DriverDashboard
          onOpenCreateEmergency={onOpenCreateEmergency}
          onNavigateTab={onNavigateTab}
        />
      )}

      {viewMode === 'patient' && (
        <PatientDashboard
          onOpenCreateEmergency={onOpenCreateEmergency}
          onNavigateTab={onNavigateTab}
        />
      )}

      {viewMode === 'hospital' && (
        <HospitalDashboard onNavigateTab={onNavigateTab} />
      )}

      {viewMode === 'admin' && (
        <AdminDashboard
          onOpenCreateEmergency={onOpenCreateEmergency}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
