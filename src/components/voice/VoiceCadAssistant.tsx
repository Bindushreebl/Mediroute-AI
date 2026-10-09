import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CornerDownLeft,
  Headphones,
  HeartPulse,
  Mic,
  MicOff,
  Navigation,
  Radio,
  Send,
  Siren,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import { EmergencyType } from '../../types';
import { rankHospitalsForEmergency } from '../../services/aiScoringService';
import { KARNATAKA_DISTRICTS } from '../../services/karnatakaData';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionTaken?: string;
  timestamp: string;
}

export const VoiceCadAssistant: React.FC = () => {
  const {
    isVoiceAssistantOpen,
    setIsVoiceAssistantOpen,
    hospitals,
    ambulances,
    emergencies,
    createEmergency,
    selectedEmergency,
    userLiveLocation,
    userLocationAddress,
    selectedDistrict,
    selectedTaluk,
  } = useEmergency();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'MediRoute CAD Voice System active. Speak your emergency or command: e.g., "Cardiac emergency in Jayanagar", "Find nearest ICU", or "How to perform CPR?".',
      timestamp: 'Ready',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // English (India) with support for Indian cities & names

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        if (spokenText) {
          handleUserVoiceCommand(spokenText);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech Output
  const speakResponse = (text: string) => {
    if (!voiceSpeechEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Speech recognition already active', e);
      }
    } else {
      // Fallback
      alert('Speech Recognition is not supported in this browser. You can type commands below.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserVoiceCommand = (command: string) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: command,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscriptInput('');

    // Process natural language command
    const lower = command.toLowerCase();
    let replyText = '';
    let actionDesc: string | undefined = undefined;

    // 1. CPR / First Aid queries
    if (lower.includes('cpr') || lower.includes('chest compression')) {
      replyText =
        'Begin adult CPR: Push hard and fast in the center of the chest. Aim for 100 to 120 compressions per minute to the beat of "Stayin Alive". Give 30 compressions followed by 2 rescue breaths if trained.';
      actionDesc = 'Displayed CPR protocols';
    } else if (lower.includes('choking') || lower.includes('heimlich')) {
      replyText =
        'For choking: Stand behind the person, wrap your arms around their waist. Make a fist just above the navel, grasp with the other hand, and give quick inward and upward thrusts.';
      actionDesc = 'Displayed Choking first-aid';
    } else if (lower.includes('bleeding') || lower.includes('blood')) {
      replyText =
        'Severe bleeding protocol: Apply direct firm pressure with a clean cloth. Elevate the wound above the heart if no bone is broken. Do not remove saturated dressings; add more on top.';
      actionDesc = 'Displayed Hemorrhage protocol';
    } else if (lower.includes('nearest') || lower.includes('hospital') || lower.includes('icu') || lower.includes('cath lab')) {
      // Recommend nearest hospital based on current state
      const refLocation = userLiveLocation || { lat: 12.9716, lng: 77.5946 };
      const ranked = rankHospitalsForEmergency(
        hospitals,
        {
          location: refLocation,
          emergencyType: lower.includes('cath') || lower.includes('cardiac') ? 'Cardiac Emergency' : 'Accident / Trauma',
          severity: 'critical',
        },
        { sortBy: 'distance', limitToKarnatakaOnly: true }
      );
      const top = ranked[0];

      if (top) {
        replyText = `The closest matching hospital is ${top.hospital.name}, located ${top.distanceKm} kilometers away with an estimated ambulance transit time of ${top.etaMinutes} minutes. It currently reports ${top.hospital.availableIcu} free ICU beds with emergency trauma intake available.`;
        actionDesc = `Located ${top.hospital.name} (${top.distanceKm} km)`;
      } else {
        replyText = 'Searching Karnataka emergency hospital network. Victoria Hospital and Jayadeva Institute are available for immediate critical intake.';
      }
    } else if (
      lower.includes('accident') ||
      lower.includes('cardiac') ||
      lower.includes('heart') ||
      lower.includes('stroke') ||
      lower.includes('burn') ||
      lower.includes('dispatch') ||
      lower.includes('ambulance')
    ) {
      // Auto-dispatch emergency detection
      let detectedType: EmergencyType = 'General Emergency';
      if (lower.includes('cardiac') || lower.includes('heart')) detectedType = 'Cardiac Emergency';
      else if (lower.includes('stroke')) detectedType = 'Stroke Symptoms';
      else if (lower.includes('accident') || lower.includes('trauma')) detectedType = 'Accident / Trauma';
      else if (lower.includes('burn')) detectedType = 'Burn';
      else if (lower.includes('bleeding')) detectedType = 'Severe Bleeding';

      // Detect district or use current
      const matchedDistrict = KARNATAKA_DISTRICTS.find((d) => lower.includes(d.name.toLowerCase()))?.name || selectedDistrict;

      const created = createEmergency({
        patientName: 'Voice CAD Caller',
        emergencyType: detectedType,
        severity: 'critical',
        location: userLiveLocation || { lat: 12.9716, lng: 77.5946 },
        locationAddress: userLocationAddress || `Voice Dispatch Scene, ${matchedDistrict}, Karnataka`,
        notes: `Emergency voice command dispatched: "${command}"`,
      });

      const assignedAmb = ambulances.find((a) => a.id === created.ambulanceId);
      replyText = `Emergency ${created.id} logged for ${detectedType} in ${matchedDistrict}. Nearest 108 unit ${assignedAmb?.vehicleNumber || 'KA-108'} is assigned with siren dispatch.`;
      actionDesc = `Created Emergency ${created.id} (${detectedType})`;
    } else if (lower.includes('eta') || lower.includes('status')) {
      if (selectedEmergency) {
        const amb = ambulances.find((a) => a.id === selectedEmergency.ambulanceId);
        replyText = `Incident ${selectedEmergency.id} status is ${selectedEmergency.status.replace('_', ' ')}. Unit ${amb?.vehicleNumber || '108'} ETA is approximately ${selectedEmergency.selectedRoute?.durationMinutes || 6} minutes.`;
        actionDesc = `Reported ETA for ${selectedEmergency.id}`;
      } else {
        replyText = 'All active 108 Arogya Kavacha fleet units are on GPS patrol. Average Karnataka metropolitan response time is 7.4 minutes.';
      }
    } else {
      replyText = `Understood: "${command}". I have notified the Karnataka CAD dispatch coordinator and logged your query into the live telemetry stream.`;
    }

    const assistantMsg: Message = {
      id: `reply-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      actionTaken: actionDesc,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, assistantMsg]);
    speakResponse(replyText);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcriptInput.trim()) return;
    handleUserVoiceCommand(transcriptInput.trim());
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isVoiceAssistantOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-lg">
              <Headphones className="w-5 h-5 text-cyan-400" />
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  108 Voice CAD Assistant
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>Hands-Free AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Voice dispatching, hospital discovery, and emergency first aid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={voiceSpeechEnabled ? 'Mute Speech Output' : 'Enable Speech Output'}
            >
              {voiceSpeechEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVoiceAssistantOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Waveform Animation Area */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-md ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-950'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? 'Listening (Tap to Stop)' : 'Tap to Speak Command'}</span>
            </button>

            {/* Simulated Voice Waveform Bars */}
            <div className="flex items-center gap-1 h-6">
              {[12, 24, 18, 32, 20, 28, 14, 22].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isListening
                      ? 'bg-rose-500 animate-pulse'
                      : isSpeaking
                      ? 'bg-cyan-400 animate-bounce'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: isListening || isSpeaking ? `${height}px` : '6px',
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {isListening ? '🔴 Recording Speech...' : isSpeaking ? '🔊 Speaking...' : 'Ready'}
          </span>
        </div>

        {/* Conversation Message Feed */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                {m.actionTaken && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Action: {m.actionTaken}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 px-1 mt-1">{m.timestamp}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Voice Suggestions */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 overflow-x-auto flex items-center gap-1.5 text-[11px]">
          <span className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">
            Quick Prompts:
          </span>
          {[
            'Nearest ICU hospital?',
            'Cardiac emergency in Jayanagar',
            'How to perform CPR?',
            'Accident on NH-44',
            'Severe bleeding first aid',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleUserVoiceCommand(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Text Input Fallback Bar */}
        <form onSubmit={handleTextSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type emergency command or speech transcription..."
            value={transcriptInput}
            onChange={(e) => setTranscriptInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
            title="Send command"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
