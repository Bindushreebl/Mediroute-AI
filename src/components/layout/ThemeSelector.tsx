import React from 'react';
import { Moon, Sun, Eye, Sparkles, Check, ShieldAlert } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { AppTheme } from '../../types';

interface ThemeSelectorProps {
  variant?: 'navbar' | 'segmented' | 'cards';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'navbar',
  className = '',
}) => {
  const { theme, setTheme } = useEmergency();

  const handleSelectTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
  };

  // Variant 1: Compact Navbar Toggle / Segmented Pill
  if (variant === 'navbar') {
    return (
      <div
        className={`relative inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 transition-all duration-300 ${className}`}
        role="radiogroup"
        aria-label="Display Environment & Theme Selector"
      >
        {/* Low-Light / High-Contrast Mode Button */}
        <button
          type="button"
          role="radio"
          aria-checked={theme === 'high-contrast'}
          onClick={() => handleSelectTheme('high-contrast')}
          className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
            theme === 'high-contrast'
              ? 'bg-black text-rose-300 border border-rose-500/50 shadow-md shadow-rose-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="High Contrast Mode: Ultra-deep contrast optimized for low-light ambulance cabins and night emergency dispatch"
        >
          <Moon className={`w-3.5 h-3.5 ${theme === 'high-contrast' ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">High Contrast</span>
          <span className="md:hidden">Night</span>
        </button>

        {/* Daylight / Minimalist Mode Button */}
        <button
          type="button"
          role="radio"
          aria-checked={theme === 'minimalist'}
          onClick={() => handleSelectTheme('minimalist')}
          className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
            theme === 'minimalist'
              ? 'bg-white text-slate-900 border border-slate-300 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Minimalist Mode: Clean daylight UI calibrated for sunlight readability and reduced glare"
        >
          <Sun className={`w-3.5 h-3.5 ${theme === 'minimalist' ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Minimalist</span>
          <span className="md:hidden">Day</span>
        </button>
      </div>
    );
  }

  // Variant 2: Full Segmented Pill
  if (variant === 'segmented') {
    return (
      <div
        className={`grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 transition-all ${className}`}
        role="radiogroup"
        aria-label="Display Environment & Theme Selector"
      >
        <button
          type="button"
          role="radio"
          aria-checked={theme === 'high-contrast'}
          onClick={() => handleSelectTheme('high-contrast')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            theme === 'high-contrast'
              ? 'bg-slate-900 text-rose-300 border border-rose-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Moon className="w-4 h-4 text-rose-400" />
          <span>High Contrast (Low-Light HUD)</span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={theme === 'minimalist'}
          onClick={() => handleSelectTheme('minimalist')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
            theme === 'minimalist'
              ? 'bg-white text-slate-900 border border-slate-200 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Minimalist (Daylight UI)</span>
        </button>
      </div>
    );
  }

  // Variant 3: Interactive Visual Cards (used in Settings or Command center)
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {/* High Contrast Mode Card */}
      <div
        onClick={() => handleSelectTheme('high-contrast')}
        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
          theme === 'high-contrast'
            ? 'bg-black border-rose-500 ring-2 ring-rose-500/30 shadow-2xl shadow-rose-950/30'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 shadow-inner">
              <Moon className="w-5 h-5 text-rose-400" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
                Night / Emergency HUD
              </span>
              {theme === 'high-contrast' && (
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
              <span>High Contrast Mode</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Designed specifically for low-light cabins, dim emergency dispatch rooms, and nighttime ambulance operations. Maximizes edge contrast and utilizes tactical dark GIS tiles to protect night vision.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
              #000000 True Black
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-rose-300 border border-slate-800">
              High Edge Definition
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
              Anti-Glare Night HUD
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Ambient condition:</span>
          <span className="font-bold text-rose-400 font-mono text-[11px]">Low Light &lt; 50 Lux</span>
        </div>
      </div>

      {/* Minimalist Daylight Mode Card */}
      <div
        onClick={() => handleSelectTheme('minimalist')}
        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
          theme === 'minimalist'
            ? 'bg-white border-amber-500 ring-2 ring-amber-500/30 text-slate-900 shadow-2xl'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
              theme === 'minimalist' ? 'bg-amber-50 border border-amber-200 text-amber-600' : 'bg-slate-900 border border-slate-800 text-amber-400'
            }`}>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                theme === 'minimalist'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-800 text-amber-300 border-slate-700'
              }`}>
                Daylight / Sunlight
              </span>
              {theme === 'minimalist' && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className={`text-base font-extrabold flex items-center gap-1.5 ${
              theme === 'minimalist' ? 'text-slate-900' : 'text-white'
            }`}>
              <span>Minimalist UI Mode</span>
            </h4>
            <p className={`text-xs mt-1 leading-relaxed ${
              theme === 'minimalist' ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Optimized for daylight environments and direct sunlight vehicle mounting. Soft daylight canvas prevents sunlight washout and glare, while clean typography ensures effortless daylight reading.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono">
            <span className={`px-2 py-0.5 rounded border ${
              theme === 'minimalist' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}>
              Daylight Slate Canvas
            </span>
            <span className={`px-2 py-0.5 rounded border ${
              theme === 'minimalist' ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-950 text-slate-300 border border-slate-800'
            }`}>
              Natural Map Tiles
            </span>
            <span className={`px-2 py-0.5 rounded border ${
              theme === 'minimalist' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-950 text-amber-300 border border-slate-800'
            }`}>
              Solar Glare Reduction
            </span>
          </div>
        </div>

        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
          theme === 'minimalist' ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-400'
        }`}>
          <span className="font-medium">Ambient condition:</span>
          <span className={`font-bold font-mono text-[11px] ${
            theme === 'minimalist' ? 'text-amber-600' : 'text-amber-400'
          }`}>Direct Daylight &gt; 1,000 Lux</span>
        </div>
      </div>
    </div>
  );
};
