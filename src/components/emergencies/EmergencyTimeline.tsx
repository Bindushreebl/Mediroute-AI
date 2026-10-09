import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  ArrowDown,
  ChevronRight,
  ShieldCheck,
  Siren,
  Truck,
  Building2,
  HeartHandshake,
  Check,
} from 'lucide-react';
import { Emergency, EmergencyStatus } from '../../types';
import { useEmergency } from '../../context/EmergencyContext';

interface EmergencyTimelineProps {
  emergency: Emergency;
}

const STAGES: { status: EmergencyStatus; label: string; icon: string }[] = [
  { status: 'created', label: 'Emergency Created', icon: '🚨' },
  { status: 'ambulance_assigned', label: 'Ambulance Assigned', icon: '🚑' },
  { status: 'dispatched', label: 'Ambulance Dispatched', icon: '💨' },
  { status: 'reached_patient', label: 'Reached Patient', icon: '🩺' },
  { status: 'patient_picked_up', label: 'Patient Picked Up', icon: '🛏️' },
  { status: 'hospital_selected', label: 'Hospital Selected', icon: '🏥' },
  { status: 'patient_transporting', label: 'Patient Transporting', icon: '⚡' },
  { status: 'arrived_hospital', label: 'Arrived at Hospital', icon: '🚪' },
  { status: 'completed', label: 'Emergency Completed', icon: '✅' },
];

export const EmergencyTimeline: React.FC<EmergencyTimelineProps> = ({ emergency }) => {
  const { updateEmergencyStatus } = useEmergency();

  const currentStageIndex = STAGES.findIndex((s) => s.status === emergency.status);
  const nextStage = STAGES[currentStageIndex + 1];

  const handleAdvance = () => {
    if (nextStage) {
      updateEmergencyStatus(emergency.id, nextStage.status);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <span>Operational Response Timeline</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              Stage {currentStageIndex + 1} of {STAGES.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit log of triage milestones and transport status
          </p>
        </div>

        {nextStage && (
          <button
            onClick={handleAdvance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            title={`Advance status to ${nextStage.label}`}
          >
            <span>Advance to: {nextStage.label}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {!nextStage && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mission Completed</span>
          </span>
        )}
      </div>

      {/* Visual Timeline Steps */}
      <div className="relative pl-3 space-y-4 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isUpcoming = idx > currentStageIndex;

          const recordedEvent = emergency.timeline.find((t) => t.status === stage.status);

          return (
            <div key={stage.status} className="relative flex items-start gap-3 group">
              {/* Status node */}
              <div
                className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-rose-600 text-white ring-4 ring-rose-500/30 shadow-lg shadow-rose-950'
                    : isPassed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isPassed ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="animate-pulse">{stage.icon}</span>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Stage content */}
              <div
                className={`flex-1 p-2.5 rounded-xl border transition-all text-xs ${
                  isCurrent
                    ? 'bg-slate-950 border-rose-500/40 shadow-md'
                    : isPassed
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    : 'bg-slate-950/30 border-slate-800/40 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      isCurrent
                        ? 'text-rose-400 text-sm'
                        : isPassed
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                  {recordedEvent && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {recordedEvent.timestamp}
                    </span>
                  )}
                </div>

                {recordedEvent && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {recordedEvent.description}{' '}
                    <span className="text-slate-500">({recordedEvent.actor})</span>
                  </p>
                )}

                {isCurrent && !recordedEvent && (
                  <p className="text-[11px] text-rose-300/80 mt-1 italic animate-pulse">
                    Currently in progress. Monitoring live telemetry...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
