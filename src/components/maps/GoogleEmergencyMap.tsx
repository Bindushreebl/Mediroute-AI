/// <reference types="@types/google.maps" />
import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  Ambulance,
  Emergency,
  EmergencySeverity,
  Hospital,
  RouteOption,
  TrafficLevel,
  TrafficZone,
} from '../../types';
import { useEmergency } from '../../context/EmergencyContext';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Compass,
  Crosshair,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Radio,
  RefreshCw,
  ShieldAlert,
  Siren,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';

interface GoogleEmergencyMapProps {
  heightClass?: string;
  focusedEmergencyId?: string;
  onSelectEmergency?: (emg: Emergency) => void;
  onSelectAmbulance?: (amb: Ambulance) => void;
  onSelectHospital?: (hosp: Hospital) => void;
}

// Sub-component for Google Maps Live Traffic Layer
const LiveTrafficLayer: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }

    if (enabled) {
      trafficLayerRef.current.setMap(map);
    } else {
      trafficLayerRef.current.setMap(null);
    }

    return () => {
      if (trafficLayerRef.current) {
        trafficLayerRef.current.setMap(null);
      }
    };
  }, [map, enabled]);

  return null;
};

// Sub-component for Emergency Route Polylines
const RoutePolylines: React.FC<{
  emergencies: Emergency[];
  selectedEmergency: Emergency | null;
  enabled: boolean;
}> = ({ emergencies, selectedEmergency, enabled }) => {
  const map = useMap();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clean up previous lines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    if (!enabled) return;

    const routesToRender = selectedEmergency
      ? [selectedEmergency]
      : emergencies.filter((e) => e.status !== 'completed').slice(0, 5);

    routesToRender.forEach((emg) => {
      const isSelected = selectedEmergency?.id === emg.id;
      const waypoints = emg.selectedRoute?.waypoints || [];

      if (waypoints.length >= 2) {
        const path = waypoints.map(([lat, lng]) => ({ lat, lng }));

        const polyline = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: isSelected ? '#f43f5e' : '#06b6d4',
          strokeOpacity: isSelected ? 0.95 : 0.6,
          strokeWeight: isSelected ? 6 : 4,
          map,
        });

        polylinesRef.current.push(polyline);
      }
    });

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, emergencies, selectedEmergency, enabled]);

  return null;
};

// Sub-component for Traffic Congestion Polygons
const TrafficPolygons: React.FC<{
  zones: TrafficZone[];
  enabled: boolean;
}> = ({ zones, enabled }) => {
  const map = useMap();
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!map) return;

    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    if (!enabled || !zones) return;

    zones.forEach((zone) => {
      const color =
        zone.level === 'severe'
          ? '#ef4444'
          : zone.level === 'high'
          ? '#f97316'
          : '#eab308';

      const poly = new google.maps.Polygon({
        paths: zone.polygon.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: color,
        strokeOpacity: 0.85,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.25,
        map,
      });

      polygonsRef.current.push(poly);
    });

    return () => {
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, zones, enabled]);

  return null;
};

// Sub-component for pan to center
const PanToController: React.FC<{ center: { lat: number; lng: number } | null }> = ({
  center,
}) => {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(14);
    }
  }, [map, center]);

  return null;
};

export const GoogleEmergencyMap: React.FC<GoogleEmergencyMapProps> = ({
  heightClass = 'h-[650px]',
  focusedEmergencyId,
  onSelectEmergency,
  onSelectAmbulance,
  onSelectHospital,
}) => {
  const {
    emergencies,
    ambulances,
    hospitals,
    trafficZones,
    selectedEmergency,
    setSelectedEmergency,
    userLiveLocation,
    userLocationAddress,
    detectLiveLocation,
    theme,
  } = useEmergency();

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyB801YMiCS5l5Fx2QOEuk6LuD9jk1YLcNI';

  const [isLocating, setIsLocating] = useState(false);
  const [panTarget, setPanTarget] = useState<{ lat: number; lng: number } | null>(null);

  // Layer filters
  const [severityFilter, setSeverityFilter] = useState<'all' | EmergencySeverity>('all');
  const [showAmbulances, setShowAmbulances] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showGoogleLiveTraffic, setShowGoogleLiveTraffic] = useState(true);

  // InfoWindow states
  const [activeAmbulanceInfo, setActiveAmbulanceInfo] = useState<Ambulance | null>(null);
  const [activeHospitalInfo, setActiveHospitalInfo] = useState<Hospital | null>(null);
  const [activeEmergencyInfo, setActiveEmergencyInfo] = useState<Emergency | null>(null);

  // Center on Karnataka Center (Vidhana Soudha, Bengaluru) or Live Location
  const defaultCenter = userLiveLocation
    ? { lat: userLiveLocation.lat, lng: userLiveLocation.lng }
    : { lat: 12.9716, lng: 77.5946 };

  // Static Aid Posts
  const aidPosts = [
    { lat: 12.9782, lng: 77.5721, name: 'Majestic KSRTC Emergency Substation (Bengaluru)' },
    { lat: 12.9279, lng: 77.6271, name: 'Central Silk Board 108 Aid Post (Bengaluru)' },
    { lat: 13.0067, lng: 77.5684, name: 'Yeshwantpur Toll Gate 108 Relay Post (Bengaluru)' },
    { lat: 12.3160, lng: 76.6540, name: 'Mysuru Suburban Bus Stand 108 Relay (Mysuru)' },
    { lat: 12.8712, lng: 74.8491, name: 'State Bank Circle Aid Post (Mangaluru)' },
    { lat: 15.3585, lng: 75.1325, name: 'Chennamma Circle 108 Relay (Hubballi)' },
    { lat: 15.8572, lng: 74.5098, name: 'Civil Hospital Road Aid Post (Belagavi)' },
  ];

  const handleLocateMe = async () => {
    setIsLocating(true);
    const loc = await detectLiveLocation();
    if (loc.lat && loc.lng) {
      setPanTarget({ lat: loc.lat, lng: loc.lng });
    }
    setIsLocating(false);
  };

  const filteredEmergencies = emergencies.filter((emg) => {
    if (severityFilter === 'all') return true;
    return emg.severity === severityFilter;
  });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 flex flex-col">
      {/* Top Map Control Bar */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Maps Platform Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span>Map ID: DEMO_MAP_ID</span>
          </div>
        </div>

        {/* Granular Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setShowGoogleLiveTraffic(!showGoogleLiveTraffic)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
              showGoogleLiveTraffic
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 opacity-60'
            }`}
            title="Toggle Google Maps real-time traffic layer"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Live Traffic</span>
          </button>

          <button
            onClick={() => setShowAmbulances(!showAmbulances)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
              showAmbulances
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 opacity-60'
            }`}
          >
            <Truck className="w-3 h-3 text-emerald-400" />
            <span>Fleet ({ambulances.length})</span>
          </button>

          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
              showHospitals
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 opacity-60'
            }`}
          >
            <Building2 className="w-3 h-3 text-blue-400" />
            <span>Hospitals ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setShowEmergencies(!showEmergencies)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
              showEmergencies
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 opacity-60'
            }`}
          >
            <Siren className="w-3 h-3 text-rose-400" />
            <span>Incidents ({emergencies.filter((e) => e.status !== 'completed').length})</span>
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all ${
              showRoutes
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border border-slate-800 opacity-60'
            }`}
          >
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>Corridors</span>
          </button>

          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1 transition-all"
            title="Auto-detect current GPS location and center map"
          >
            <Crosshair className={`w-3 h-3 text-cyan-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Main Google Maps Viewport */}
      <div className={`w-full ${heightClass} relative z-10`}>
        <APIProvider apiKey={apiKey} libraries={['marker', 'routes', 'geometry']}>
          <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={defaultCenter}
            defaultZoom={12}
            gestureHandling="greedy"
            disableDefaultUI={false}
            fullscreenControl={true}
            zoomControl={true}
            mapTypeControl={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            colorScheme={theme === 'high-contrast' ? 'DARK' : 'LIGHT'}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Live Traffic Layer */}
            <LiveTrafficLayer enabled={showGoogleLiveTraffic} />

            {/* Emergency Route Polylines */}
            <RoutePolylines
              emergencies={emergencies}
              selectedEmergency={selectedEmergency}
              enabled={showRoutes}
            />

            {/* Traffic Congestion Polygons */}
            <TrafficPolygons zones={trafficZones} enabled={showTraffic} />

            {/* Pan Controller */}
            <PanToController center={panTarget} />

            {/* User Live Location Marker */}
            {userLiveLocation && (
              <AdvancedMarker
                position={{ lat: userLiveLocation.lat, lng: userLiveLocation.lng }}
                title="Your Current Location (GPS)"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-400 opacity-75" />
                  <div className="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-black">
                    📍
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Ambulance Fleet Advanced Markers */}
            {showAmbulances &&
              ambulances.map((amb) => (
                <AdvancedMarker
                  key={amb.id}
                  position={{ lat: amb.location.lat, lng: amb.location.lng }}
                  title={`${amb.vehicleNumber} (${amb.driverName})`}
                  onClick={() => {
                    setActiveAmbulanceInfo(amb);
                    setActiveHospitalInfo(null);
                    setActiveEmergencyInfo(null);
                    onSelectAmbulance?.(amb);
                  }}
                >
                  <div className="relative group cursor-pointer">
                    <div
                      className={`px-2 py-1 rounded-xl shadow-2xl border flex items-center gap-1.5 transition-all transform hover:scale-110 ${
                        amb.status === 'en_route'
                          ? 'bg-rose-950/95 text-rose-300 border-rose-500 ring-2 ring-rose-500/50'
                          : amb.status === 'transporting_patient'
                          ? 'bg-amber-950/95 text-amber-300 border-amber-500 ring-2 ring-amber-500/50'
                          : 'bg-emerald-950/95 text-emerald-300 border-emerald-500'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px] font-mono font-bold">{amb.vehicleNumber.split('-').slice(-2).join('-')}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

            {/* Hospital Advanced Markers */}
            {showHospitals &&
              hospitals.map((hosp) => (
                <AdvancedMarker
                  key={hosp.id}
                  position={{ lat: hosp.location.lat, lng: hosp.location.lng }}
                  title={hosp.name}
                  onClick={() => {
                    setActiveHospitalInfo(hosp);
                    setActiveAmbulanceInfo(null);
                    setActiveEmergencyInfo(null);
                    onSelectHospital?.(hosp);
                  }}
                >
                  <div className="relative group cursor-pointer">
                    <div className="px-2 py-1 rounded-xl bg-blue-950/95 text-blue-300 border border-blue-500 shadow-2xl flex items-center gap-1.5 transition-all transform hover:scale-110">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] font-bold truncate max-w-[80px]">{hosp.name.split(' ')[0]}</span>
                      <span className="px-1 py-0.2 rounded bg-blue-800 text-white font-mono text-[9px] font-black">
                        {hosp.availableIcu} ICU
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

            {/* Emergency Incident Advanced Markers */}
            {showEmergencies &&
              filteredEmergencies
                .filter((e) => e.status !== 'completed')
                .map((emg) => (
                  <AdvancedMarker
                    key={emg.id}
                    position={{ lat: emg.location.lat, lng: emg.location.lng }}
                    title={`Incident: ${emg.patientName}`}
                    onClick={() => {
                      setActiveEmergencyInfo(emg);
                      setSelectedEmergency(emg);
                      setActiveAmbulanceInfo(null);
                      setActiveHospitalInfo(null);
                      onSelectEmergency?.(emg);
                    }}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer">
                      <span className="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-rose-500 opacity-75" />
                      <div className="w-7 h-7 rounded-2xl bg-rose-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-black">
                        🚨
                      </div>
                    </div>
                  </AdvancedMarker>
                ))}

            {/* Aid Posts Markers */}
            {aidPosts.map((post, idx) => (
              <AdvancedMarker
                key={`post-${idx}`}
                position={{ lat: post.lat, lng: post.lng }}
                title={post.name}
              >
                <div className="w-5 h-5 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center text-[10px] font-bold shadow-lg">
                  ⛑️
                </div>
              </AdvancedMarker>
            ))}

            {/* Ambulance InfoWindow */}
            {activeAmbulanceInfo && (
              <InfoWindow
                position={{
                  lat: activeAmbulanceInfo.location.lat,
                  lng: activeAmbulanceInfo.location.lng,
                }}
                onCloseClick={() => setActiveAmbulanceInfo(null)}
              >
                <div className="p-2.5 max-w-[260px] text-slate-900 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <strong className="text-sm font-black text-emerald-700">
                      {activeAmbulanceInfo.vehicleNumber}
                    </strong>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {activeAmbulanceInfo.type}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Pilot: <strong>{activeAmbulanceInfo.driverName}</strong>
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    Status: <strong className="capitalize">{activeAmbulanceInfo.status.replace('_', ' ')}</strong>
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-1 font-mono text-[11px]">
                    <span>Fuel: {activeAmbulanceInfo.fuelPercent}%</span>
                    <span>Score: {activeAmbulanceInfo.equipmentScore}/100</span>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Hospital InfoWindow */}
            {activeHospitalInfo && (
              <InfoWindow
                position={{
                  lat: activeHospitalInfo.location.lat,
                  lng: activeHospitalInfo.location.lng,
                }}
                onCloseClick={() => setActiveHospitalInfo(null)}
              >
                <div className="p-2.5 max-w-[280px] text-slate-900 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <strong className="text-sm font-black text-blue-800">
                      {activeHospitalInfo.name}
                    </strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                      {activeHospitalInfo.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{activeHospitalInfo.address}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-1 rounded bg-blue-50 border border-blue-200">
                      <span className="text-[10px] text-slate-500 block">Available ICU</span>
                      <strong className="text-blue-700">{activeHospitalInfo.availableIcu} Beds</strong>
                    </div>
                    <div className="p-1 rounded bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">General Beds</span>
                      <strong className="text-slate-800">{activeHospitalInfo.availableGeneralBeds} Beds</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Emergency Triage: {activeHospitalInfo.emergencyAvailable ? '🟢 Accepting Patients' : '🔴 Diversion'}
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* Emergency InfoWindow */}
            {activeEmergencyInfo && (
              <InfoWindow
                position={{
                  lat: activeEmergencyInfo.location.lat,
                  lng: activeEmergencyInfo.location.lng,
                }}
                onCloseClick={() => setActiveEmergencyInfo(null)}
              >
                <div className="p-2.5 max-w-[280px] text-slate-900 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b pb-1">
                    <strong className="text-sm font-black text-rose-700">
                      🚨 {activeEmergencyInfo.emergencyType}
                    </strong>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      {activeEmergencyInfo.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 font-semibold">
                    Patient: {activeEmergencyInfo.patientName}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {activeEmergencyInfo.locationAddress}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-700 font-bold uppercase">
                      Status: {activeEmergencyInfo.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Map Footer Telemetry Bar */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px]">Google Maps JavaScript API (New) • Vector Map</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>{filteredEmergencies.length} active incidents</span>
          <span>•</span>
          <span>{ambulances.length} GPS ambulances</span>
          <span>•</span>
          <span>{hospitals.length} clinical centers</span>
        </div>
      </div>
    </div>
  );
};
