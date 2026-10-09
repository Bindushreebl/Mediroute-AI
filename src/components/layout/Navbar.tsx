import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Bell,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  Headphones,
  Hospital as HospitalIcon,
  Layers,
  LogIn,
  LogOut,
  MapPin,
  Mic,
  Moon,
  Navigation,
  PlusCircle,
  Radio,
  Settings,
  Shield,
  Siren,
  Sparkles,
  Sun,
  Truck,
  UserCheck,
  X,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { INITIAL_USERS } from '../../services/storageService';
import { UserRole } from '../../types';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateEmergency: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenCreateEmergency }) => {
  const {
    currentUser,
    setCurrentUser,
    alerts,
    dismissAlert,
    isAuthenticated,
    logout,
    theme,
    toggleTheme,
    setIsVoiceAssistantOpen,
  } = useEmergency();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.read);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'emergencies', label: 'Emergencies', icon: Siren },
    { id: 'live-map', label: 'Live Map', icon: MapPin },
    { id: 'ambulances', label: 'Fleet', icon: Truck },
    { id: 'hospitals', label: 'Hospitals', icon: HospitalIcon },
    { id: 'routes', label: 'Routes & AI', icon: Navigation },
    { id: 'analytics', label: 'Analytics', icon: Layers },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleRoleSelect = (role: UserRole) => {
    const matchedUser = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    setCurrentUser(matchedUser);
    setShowRoleDropdown(false);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-950/80 text-purple-300 border-purple-600/50',
    dispatcher: 'bg-cyan-950/80 text-cyan-300 border-cyan-600/50',
    driver: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
    hospital: 'bg-blue-950/80 text-blue-300 border-blue-600/50',
    patient: 'bg-rose-950/80 text-rose-300 border-rose-600/50',
    viewer: 'bg-slate-800 text-slate-300 border-slate-600',
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Mark (Zone 1: Single Line, Clean) */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => onTabChange('landing')}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-950/50">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black tracking-tight text-white font-sans">
                MediRoute
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">AI</span>
            </div>
          </div>

          {/* Navigation Links (Zone 2: Clean Typography) */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Zone (Zone 3) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 108 Voice CAD Button */}
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 text-xs font-bold transition-all shadow-sm active:scale-95"
              title="Launch Hands-Free Voice CAD Dispatcher"
            >
              <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Voice CAD</span>
            </button>

            {/* Theme Selector (High Contrast vs Minimalist Daylight) */}
            <ThemeSelector variant="navbar" />

            {/* Create Emergency Button */}
            <button
              onClick={onOpenCreateEmergency}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/60 border border-rose-500/40 transition-all active:scale-95 group"
            >
              <AlertOctagon className="w-4 h-4 text-white" />
              <span>SOS Emergency</span>
            </button>

            {/* Alerts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
                title="System notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] font-bold text-white shadow">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {showAlertsDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span className="font-bold text-xs text-white uppercase tracking-wider">
                        Operational Alerts ({alerts.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAlertsDropdown(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {alerts.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No active alerts.</p>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs flex items-start justify-between gap-2 hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                              {alert.type === 'critical' ? (
                                <span className="text-rose-400">🚨</span>
                              ) : alert.type === 'traffic' ? (
                                <span className="text-amber-400">⚠️</span>
                              ) : (
                                <span className="text-blue-400">ℹ️</span>
                              )}
                              {alert.title}
                            </p>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{alert.message}</p>
                            <span className="text-[10px] text-slate-500 mt-1 block">{alert.timestamp}</span>
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-slate-500 hover:text-slate-300 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher or Sign In CTA */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    roleColors[currentUser.role]
                  }`}
                  title="Switch active user role"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="capitalize hidden md:inline">{currentUser.role}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2">
                    <div className="px-2.5 py-1.5 border-b border-slate-800 mb-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Role Permission Switcher
                      </p>
                      <p className="text-xs text-slate-200 font-semibold mt-0.5">{currentUser.name}</p>
                    </div>

                    {(['driver', 'patient', 'hospital', 'admin', 'dispatcher', 'viewer'] as UserRole[]).map((r) => {
                      const isSelected = currentUser.role === r;
                      return (
                        <button
                          key={r}
                          onClick={() => handleRoleSelect(r)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-slate-800 text-rose-400 font-bold' : 'text-slate-300 hover:bg-slate-950'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span className="capitalize">{r}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                        </button>
                      );
                    })}

                    <div className="mt-1 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setShowRoleDropdown(false);
                          onTabChange('landing');
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out of CAD Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onTabChange('landing')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
