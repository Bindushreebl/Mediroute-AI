import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  Brain,
  Calendar,
  Clock,
  Flame,
  Layers,
  MapPin,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import {
  HISTORICAL_EMERGENCIES_DATA,
  EMERGENCY_TYPES_DISTRIBUTION,
  HEATMAP_HOTSPOTS,
} from '../services/storageService';
import { getPredictiveAnalyticsModel } from '../services/aiScoringService';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | '6months'>('7days');

  const { sectors, hourlyForecast, disclaimer } = getPredictiveAnalyticsModel();

  // Hospital utilization demo data
  const hospitalLoadData = [
    { name: 'St. Jude Cardiac', capacity: 28, inUse: 20 },
    { name: 'Metro General', capacity: 34, inUse: 28 },
    { name: 'Apex Children', capacity: 18, inUse: 13 },
    { name: 'City Care', capacity: 14, inUse: 12 },
    { name: 'Highland Memorial', capacity: 22, inUse: 13 },
    { name: 'Mercy Emergency', capacity: 12, inUse: 12 },
  ];

  // Ambulance fleet mileage/dispatch count
  const ambulanceUsageData = [
    { unit: 'MED-901', runs: 28, status: 'ALS' },
    { unit: 'MED-902', runs: 24, status: 'ALS' },
    { unit: 'MED-903', runs: 19, status: 'BLS' },
    { unit: 'MED-904', runs: 14, status: 'Neonatal' },
    { unit: 'MED-905', runs: 31, status: 'ALS' },
    { unit: 'MED-906', runs: 22, status: 'BLS' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            <span>Emergency Operations Analytics & AI Forecast</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical incident trends, response time SLA benchmarks, fleet utilization, and predictive demand estimation.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          {(['today', '7days', '30days', '6months'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                timeframe === tf
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf === '7days' ? 'Last 7 Days' : tf === '30days' ? 'Last 30 Days' : tf === '6months' ? '6 Months' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Volume & Response Time SLA Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Emergency Incident Volume */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Daily Emergency Incident Volume</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Dispatches handled across metropolitan sectors</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400">187 calls / wk</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HISTORICAL_EMERGENCIES_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} name="Emergencies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Performance vs 12min SLA Benchmark */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Average Response Time vs SLA</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Municipal Target Threshold: &lt; 12.0 Minutes</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">Avg: 11.2 min</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_EMERGENCIES_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" domain={[6, 16]} fontSize={11} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgResponseMin"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4' }}
                  name="Response (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Emergency Categories Donut & Peak Hours Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Types Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Emergency Category Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total 128 Cases</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EMERGENCY_TYPES_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {EMERGENCY_TYPES_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Emergency Hours */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Hourly Peak Emergency Distribution</span>
            </h3>
            <span className="text-xs text-purple-400 font-mono font-bold">Peak: 16:00 - 20:00</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyForecast}>
                <defs>
                  <linearGradient id="hourRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="incidents"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hourRisk)"
                  name="Incidents"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Heatmap High-Risk Incident Clusters & Sector Demand AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Incident Density */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Emergency Frequency Heatmap Density</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Filtered: {timeframe}</span>
          </div>

          <div className="space-y-2.5">
            {HEATMAP_HOTSPOTS.map((spot, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3.5 h-3.5 rounded-full ${
                      spot.intensity > 0.85
                        ? 'bg-red-500 ring-4 ring-red-500/20 animate-pulse'
                        : spot.intensity > 0.7
                        ? 'bg-orange-500 ring-2 ring-orange-500/20'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <strong className="text-white block">{spot.label}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Relative Density</span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.round(spot.intensity * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive AI Demand Forecast */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="font-extrabold text-sm text-white">
                Predictive AI: Ambulance Fleet Pre-Positioning
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-bold border border-purple-800">
              AI Forecast
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Calculated via time-series Poisson incident clustering to stage standby ambulances ahead of peak collision periods:
          </p>

          <div className="space-y-2.5">
            {sectors.map((sec, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-white">{sec.sector}</strong>
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                      sec.riskFactor === 'Elevated'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : sec.riskFactor === 'Moderate'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {sec.riskFactor} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Standby Allocation: <strong className="text-emerald-400 font-mono">{sec.recommendedStandbyAmbulances} units</strong></span>
                  <span className="text-[10px] text-purple-300">{sec.predictedPeakWindow}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2 text-[11px] text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>{disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
