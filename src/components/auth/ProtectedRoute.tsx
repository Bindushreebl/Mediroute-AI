import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  LogIn,
  Shield,
  ShieldAlert,
  Siren,
  Sparkles,
  Truck,
  UserCheck,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigateToAuth?: () => void;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onNavigateToAuth,
  requiredRole,
}) => {
  const { isAuthenticated, currentUser, loginWithRolePreset } = useEmergency();

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          {/* Subtle glow header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 blur-sm" />

          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600/20 to-red-600/10 border border-rose-500/30 text-rose-400 shadow-xl">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Authentication Required</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Emergency Command Center Protected
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Access to real-time ambulance fleet telemetry, active 911 dispatch corridors, and hospital diversion coordination is restricted to authorized credentials.
            </p>
          </div>

          {/* Quick Demo Authenticate Options */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Demo CAD Authentication:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => loginWithRolePreset('dispatcher')}
                className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 hover:border-blue-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-blue-300 font-bold group-hover:text-white">
                    Dispatcher CAD
                  </strong>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Marcus Vance • Full Intake & Route Control
                </span>
              </button>

              <button
                onClick={() => loginWithRolePreset('admin')}
                className="p-3 rounded-xl bg-purple-950/60 border border-purple-800/60 hover:border-purple-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-purple-300 font-bold group-hover:text-white">
                    System Admin
                  </strong>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Capt. Jenkins • All Facilities & Fleet
                </span>
              </button>

              <button
                onClick={() => loginWithRolePreset('driver')}
                className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 hover:border-emerald-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 font-bold group-hover:text-white">
                    Ambulance Driver
                  </strong>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  MED-901 Unit • Real-Time Route & Vitals
                </span>
              </button>

              <button
                onClick={() => loginWithRolePreset('viewer')}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-slate-300 font-bold group-hover:text-white">
                    Health Auditor
                  </strong>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Dr. Elena • Read-Only Incident Analytics
                </span>
              </button>
            </div>
          </div>

          {/* Action to Landing page form */}
          {onNavigateToAuth && (
            <button
              onClick={onNavigateToAuth}
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In with Custom Email & Password or Register on Landing</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Check role authorization if specified
  if (requiredRole && currentUser.role !== requiredRole && currentUser.role !== 'admin') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3 max-w-md">
          <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Insufficient Role Privileges</h3>
          <p className="text-xs text-slate-400">
            This module requires <strong>{requiredRole}</strong> role permissions. Your current account role is <span className="capitalize text-amber-300">{currentUser.role}</span>.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
