import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { UserRole } from '../../types';

interface AuthSectionProps {
  onSuccess: () => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ onSuccess }) => {
  const { login, signup, loginWithRolePreset, isAuthenticated, currentUser, logout, authToken } = useEmergency();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('marcus.dispatch@mediroute.org');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('dispatcher');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onSuccess();
        } else {
          setErrorMessage(res.error || 'Authentication failed');
        }
      } else {
        const res = await signup({ name, email, password, role });
        if (res.success) {
          onSuccess();
        } else {
          setErrorMessage(res.error || 'Registration failed');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoPreset = (presetRole: UserRole) => {
    loginWithRolePreset(presetRole);
    onSuccess();
  };

  // If already authenticated, show active session banner with Logout action
  if (isAuthenticated && currentUser) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center justify-center font-bold text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Active JWT Session Verified
            </span>
            <h3 className="text-base font-black text-white">{currentUser.name}</h3>
            <p className="text-xs text-slate-400 font-mono capitalize">Role: {currentUser.role}</p>
          </div>
        </div>

        {authToken && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 break-all space-y-1">
            <span className="text-emerald-400 font-bold block uppercase tracking-wider">
              Bearer Token (HS256 Header.Payload.Sig):
            </span>
            <p className="line-clamp-2 text-slate-300">{authToken}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onSuccess}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Command Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-md space-y-6 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Login / Sign Up Segmented Control */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMessage(null);
          }}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'login'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>CAD Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMessage(null);
          }}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === 'signup'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New Account</span>
        </button>
      </div>

      <div className="text-left space-y-1">
        <h3 className="text-lg font-black text-white">
          {mode === 'login' ? 'Dispatch Authentication' : 'Create CAD Personnel Account'}
        </h3>
        <p className="text-xs text-slate-400">
          {mode === 'login'
            ? 'Sign in to access live ambulance tracking and route planning.'
            : 'Register a new responder profile with mock JWT role authorization.'}
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-left">
        {mode === 'signup' && (
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name & Rank</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Officer Nathan Drake"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Official Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="responder@mediroute.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              required
            />
          </div>
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select User Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(['driver', 'patient', 'hospital', 'admin', 'dispatcher'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-2.5 rounded-xl border text-xs capitalize text-left transition-all ${
                    role === r
                      ? 'bg-rose-500/10 border-rose-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'driver'
                    ? '🚑 Ambulance Driver'
                    : r === 'patient'
                    ? '👤 Patient / Citizen'
                    : r === 'hospital'
                    ? '🏥 Hospital Staff'
                    : r === 'admin'
                    ? '🛡️ System Admin'
                    : '👨‍💼 CAD Dispatcher'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 font-semibold">Security Password</label>
            <span className="text-[10px] text-slate-500 font-mono">Demo: Password123!</span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-rose-950/70 border border-rose-500/40 transition-all active:scale-95 disabled:opacity-50 mt-2"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying JWT Credentials...</span>
            </span>
          ) : mode === 'login' ? (
            <span className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              <span>Sign In with JWT Auth</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Create Account & Sign In</span>
            </span>
          )}
        </button>
      </form>

      {/* 1-Click Demo Profiles */}
      <div className="pt-2 border-t border-slate-800 space-y-2 text-left">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>1-Click Evaluator Demo Credentials:</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => handleDemoPreset('driver')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-semibold text-left transition-colors"
          >
            🚑 Driver (Manjunath)
          </button>
          <button
            type="button"
            onClick={() => handleDemoPreset('patient')}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-semibold text-left transition-colors"
          >
            👤 Patient (Pooja)
          </button>
          <button
            type="button"
            onClick={() => handleDemoPreset('hospital')}
            className="px-2.5 py-1.5 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 font-semibold text-left transition-colors"
          >
            🏥 Hospital (Dr. Patil)
          </button>
          <button
            type="button"
            onClick={() => handleDemoPreset('admin')}
            className="px-2.5 py-1.5 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 font-semibold text-left transition-colors"
          >
            🛡️ Admin (Jenkins)
          </button>
          <button
            type="button"
            onClick={() => handleDemoPreset('dispatcher')}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 font-semibold text-left transition-colors"
          >
            👨‍💼 Dispatcher (Vance)
          </button>
        </div>
      </div>
    </div>
  );
};
