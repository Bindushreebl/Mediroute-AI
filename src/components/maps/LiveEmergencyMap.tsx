import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Ambulance,
  Emergency,
  EmergencySeverity,
  Hospital,
  RouteOption,
  TrafficLevel,
  TrafficZone,
} from '../../types';
import {
  createAmbulanceIcon,
  createEmergencyIcon,
  createHospitalIcon,
  createPostIcon,
  getTrafficZoneColor,
} from '../../services/mapService';
import { useEmergency } from '../../context/EmergencyContext';
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Crosshair,
  Eye,
  EyeOff,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  RefreshCw,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { GoogleEmergencyMap } from './GoogleEmergencyMap';

interface LiveEmergencyMapProps {
  heightClass?: string;
  focusedEmergencyId?: string;
  onSelectEmergency?: (emg: Emergency) => void;
  onSelectAmbulance?: (amb: Ambulance) => void;
  onSelectHospital?: (hosp: Hospital) => void;
}

export const LiveEmergencyMap: React.FC<LiveEmergencyMapProps> = ({
  heightClass = 'h-[650px]',
  focusedEmergencyId,
  onSelectEmergency,
  onSelectAmbulance,
  onSelectHospital,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups for granular toggle control
  const ambulanceLayerRef = useRef<L.LayerGroup | null>(null);
  const hospitalLayerRef = useRef<L.LayerGroup | null>(null);
  const emergencyLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const postsLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    emergencies,
    ambulances,
    hospitals,
    trafficZones,
    selectedEmergency,
    setSelectedEmergency,
    switchEmergencyRoute,
    userLiveLocation,
    userLocationAddress,
    detectLiveLocation,
  } = useEmergency();

  const [isLocating, setIsLocating] = useState(false);

  // Filter and layer states
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('google');
  const [severityFilter, setSeverityFilter] = useState<'all' | EmergencySeverity>('all');
  const [showAmbulances, setShowAmbulances] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showEmergencies, setShowEmergencies] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Karnataka Center (Vidhana Soudha, Bengaluru) or Live Location
    const initCenter: [number, number] = userLiveLocation
      ? [userLiveLocation.lat, userLiveLocation.lng]
      : [12.9716, 77.5946];

    const map = L.map(mapContainerRef.current, {
      center: initCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap Tile Layer with dark tactical styling
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | MediRoute AI Karnataka',
      className: 'leaflet-dark-mode',
    }).addTo(map);

    // Initialize LayerGroups
    ambulanceLayerRef.current = L.layerGroup().addTo(map);
    hospitalLayerRef.current = L.layerGroup().addTo(map);
    emergencyLayerRef.current = L.layerGroup().addTo(map);
    trafficLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);
    postsLayerRef.current = L.layerGroup().addTo(map);
    userLocationLayerRef.current = L.layerGroup().addTo(map);

    // Add static Karnataka Emergency Aid Posts
    const posts: [number, number, string][] = [
      [12.9782, 77.5721, 'Majestic KSRTC Emergency Substation (Bengaluru)'],
      [12.9279, 77.6271, 'Central Silk Board 108 Aid Post (Bengaluru)'],
      [13.0067, 77.5684, 'Yeshwantpur Toll Gate 108 Relay Post (Bengaluru)'],
      [12.3160, 76.6540, 'Mysuru Suburban Bus Stand 108 Relay (Mysuru)'],
      [12.8712, 74.8491, 'State Bank Circle Aid Post (Mangaluru)'],
      [15.3585, 75.1325, 'Chennamma Circle 108 Relay (Hubballi)'],
      [15.8572, 74.5098, 'Civil Hospital Road Aid Post (Belagavi)'],
    ];

    posts.forEach(([lat, lng, name]) => {
      const marker = L.marker([lat, lng], { icon: createPostIcon() });
      marker.bindPopup(`
        <div class="p-3 text-xs bg-slate-900 text-slate-100 rounded-lg">
          <div class="flex items-center gap-1.5 font-bold text-cyan-400">
            <span>⛑️</span>
            <span>${name}</span>
          </div>
          <p class="text-slate-400 text-[11px] mt-1">24/7 108 Arogya Kavacha Paramedic Staging & Battery Station</p>
        </div>
      `);
      if (postsLayerRef.current) postsLayerRef.current.addLayer(marker);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Live Location Marker
  useEffect(() => {
    if (!userLocationLayerRef.current) return;
    userLocationLayerRef.current.clearLayers();

    if (!userLiveLocation) return;

    const userHtml = `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white ring-4 ring-cyan-400/60 shadow-2xl animate-pulse">
        <span class="text-xs select-none">📍</span>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: 'custom-user-live-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });

    const userMarker = L.marker([userLiveLocation.lat, userLiveLocation.lng], {
      icon: userIcon,
      zIndexOffset: 3000,
    });

    userMarker.bindPopup(`
      <div class="p-3 text-xs bg-slate-900 text-slate-100 rounded-xl min-w-[200px]">
        <div class="font-extrabold text-sm text-cyan-400 flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
          <span>📍</span> Your Live GPS Position
        </div>
        <p class="text-slate-300">${userLocationAddress || 'Karnataka Location Lock'}</p>
        <p class="text-[10px] font-mono text-slate-500 mt-1">
          Lat: ${userLiveLocation.lat.toFixed(5)}, Lng: ${userLiveLocation.lng.toFixed(5)}
        </p>
      </div>
    `);

    userLocationLayerRef.current.addLayer(userMarker);
  }, [userLiveLocation, userLocationAddress]);

  // Update Ambulances Layer
  useEffect(() => {
    if (!ambulanceLayerRef.current) return;
    ambulanceLayerRef.current.clearLayers();

    if (!showAmbulances) return;

    ambulances.forEach((amb) => {
      const isSelected = selectedEmergency?.ambulanceId === amb.id;
      const marker = L.marker([amb.location.lat, amb.location.lng], {
        icon: createAmbulanceIcon(amb.status, isSelected),
        zIndexOffset: isSelected ? 1000 : 200,
      });

      marker.bindPopup(`
        <div class="p-3 text-xs bg-slate-900 text-slate-100 rounded-xl min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span class="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
              <span>🚑</span> ${amb.vehicleNumber}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
              amb.status === 'available'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-blue-950 text-blue-400 border border-blue-800'
            }">
              ${amb.status.replace('_', ' ')}
            </span>
          </div>
          <div class="space-y-1.5 text-slate-300">
            <p><span class="text-slate-500">Driver:</span> <strong class="text-white">${amb.driverName}</strong></p>
            <p><span class="text-slate-500">Fleet Type:</span> <span class="text-amber-400 font-semibold">${amb.type}</span></p>
            <p><span class="text-slate-500">Current Sector:</span> ${amb.sector}</p>
            <p><span class="text-slate-500">Fuel / Battery:</span> ${amb.fuelPercent}%</p>
            ${
              amb.currentDestination
                ? `<div class="mt-2 pt-1 border-t border-slate-800 text-[11px] text-cyan-300">
                     Destination: ${amb.currentDestination} (ETA: ${amb.etaMinutes || 4} min)
                   </div>`
                : ''
            }
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectAmbulance) onSelectAmbulance(amb);
      });

      ambulanceLayerRef.current?.addLayer(marker);
    });
  }, [ambulances, showAmbulances, selectedEmergency, onSelectAmbulance]);

  // Update Hospitals Layer
  useEffect(() => {
    if (!hospitalLayerRef.current) return;
    hospitalLayerRef.current.clearLayers();

    if (!showHospitals) return;

    hospitals.forEach((hosp) => {
      const isSelected = selectedEmergency?.hospitalId === hosp.id;
      const marker = L.marker([hosp.location.lat, hosp.location.lng], {
        icon: createHospitalIcon(hosp.status, isSelected),
        zIndexOffset: 150,
      });

      marker.bindPopup(`
        <div class="p-3.5 text-xs bg-slate-900 text-slate-100 rounded-xl min-w-[240px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span class="font-extrabold text-sm text-rose-400 flex items-center gap-1.5">
              <span>🏥</span> ${hosp.name}
            </span>
          </div>
          <div class="space-y-1.5 text-slate-300">
            <p class="text-slate-400 text-[11px]">${hosp.address}</p>
            <div class="flex items-center gap-3 my-2 pt-1 pb-1 border-y border-slate-800 text-[11px]">
              <div>
                <span class="text-slate-500 block">ICU Beds:</span>
                <strong class="${hosp.availableIcu > 2 ? 'text-emerald-400' : 'text-rose-400'} font-bold">
                  ${hosp.availableIcu} / ${hosp.icuCapacity}
                </strong>
              </div>
              <div>
                <span class="text-slate-500 block">Status:</span>
                <span class="uppercase font-bold ${
                  hosp.status === 'available'
                    ? 'text-emerald-400'
                    : hosp.status === 'limited'
                    ? 'text-amber-400'
                    : 'text-rose-500'
                }">${hosp.status}</span>
              </div>
              <div>
                <span class="text-slate-500 block">Wait Time:</span>
                <span class="text-cyan-400 font-bold">${hosp.waitTimeMinutes}m</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              ${hosp.traumaCenter ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-300 border border-red-800">Trauma L1</span>' : ''}
              ${hosp.cardiology ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800">Cardiology</span>' : ''}
              ${hosp.neurology ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">Stroke Unit</span>' : ''}
              ${hosp.burnUnit ? '<span class="px-1.5 py-0.5 rounded text-[10px] bg-orange-950 text-orange-300 border border-orange-800">Burn Center</span>' : ''}
            </div>
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectHospital) onSelectHospital(hosp);
      });

      hospitalLayerRef.current?.addLayer(marker);
    });
  }, [hospitals, showHospitals, selectedEmergency, onSelectHospital]);

  // Update Emergencies Layer
  useEffect(() => {
    if (!emergencyLayerRef.current) return;
    emergencyLayerRef.current.clearLayers();

    if (!showEmergencies) return;

    const filtered =
      severityFilter === 'all'
        ? emergencies
        : emergencies.filter((e) => e.severity === severityFilter);

    filtered.forEach((emg) => {
      const isSelected = selectedEmergency?.id === emg.id;
      const marker = L.marker([emg.location.lat, emg.location.lng], {
        icon: createEmergencyIcon(emg.severity, isSelected),
        zIndexOffset: isSelected ? 2000 : 300,
      });

      marker.bindPopup(`
        <div class="p-3 text-xs bg-slate-900 text-slate-100 rounded-xl min-w-[230px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span class="font-black text-sm text-rose-400 flex items-center gap-1.5">
              <span>🚨</span> ${emg.id}
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
              emg.severity === 'critical'
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }">
              ${emg.severity}
            </span>
          </div>
          <div class="space-y-1.5 text-slate-300">
            <p><span class="text-slate-500">Patient:</span> <strong class="text-white">${emg.patientName}</strong></p>
            <p><span class="text-slate-500">Type:</span> <span class="text-amber-300 font-semibold">${emg.emergencyType}</span></p>
            <p><span class="text-slate-500">Location:</span> ${emg.locationAddress}</p>
            <p><span class="text-slate-500">Stage:</span> <span class="text-cyan-400 capitalize font-medium">${emg.status.replace('_', ' ')}</span></p>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedEmergency(emg);
        if (onSelectEmergency) onSelectEmergency(emg);
      });

      emergencyLayerRef.current?.addLayer(marker);
    });
  }, [emergencies, showEmergencies, severityFilter, selectedEmergency, setSelectedEmergency, onSelectEmergency]);

  // Update Traffic Zones Layer
  useEffect(() => {
    if (!trafficLayerRef.current) return;
    trafficLayerRef.current.clearLayers();

    if (!showTraffic) return;

    trafficZones.forEach((zone) => {
      const colors = getTrafficZoneColor(zone.level);
      const polygon = L.polygon(zone.polygon, {
        color: colors.stroke,
        fillColor: colors.fill,
        fillOpacity: 0.18,
        weight: 2,
        dashArray: zone.level === 'severe' ? '6, 6' : undefined,
      });

      polygon.bindPopup(`
        <div class="p-3 text-xs bg-slate-900 text-slate-100 rounded-lg">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
            <strong class="text-slate-200">${zone.name}</strong>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style="color: ${colors.stroke}">
              ${zone.level}
            </span>
          </div>
          <p class="text-slate-400">Avg Speed: <strong class="text-white">${zone.averageSpeedKmh} km/h</strong></p>
          <p class="text-slate-400">Congestion Density: <strong class="text-white">${zone.vehicleCount} vehicles/km²</strong></p>
          <p class="text-slate-500 text-[10px] mt-1">Telemetry updated ${zone.lastUpdated}</p>
        </div>
      `);

      trafficLayerRef.current?.addLayer(polygon);
    });
  }, [trafficZones, showTraffic]);

  // Update Routes Layer
  useEffect(() => {
    if (!routesLayerRef.current) return;
    routesLayerRef.current.clearLayers();

    if (!showRoutes || !selectedEmergency) return;

    // Primary route
    if (selectedEmergency.selectedRoute) {
      const primaryLine = L.polyline(selectedEmergency.selectedRoute.waypoints, {
        color: '#06b6d4',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      });

      primaryLine.bindPopup(`
        <div class="p-2.5 text-xs bg-slate-900 text-slate-100 rounded-lg">
          <div class="font-bold text-cyan-400">Active Navigation Corridor: ${selectedEmergency.selectedRoute.name}</div>
          <p class="text-slate-300 mt-1">${selectedEmergency.selectedRoute.label}</p>
          <p class="text-slate-400 mt-0.5">ETA: ${selectedEmergency.selectedRoute.durationMinutes} min • Distance: ${selectedEmergency.selectedRoute.distanceKm} km</p>
        </div>
      `);

      routesLayerRef.current.addLayer(primaryLine);
    }

    // Alternative route (dashed yellow/orange)
    if (selectedEmergency.alternativeRoute && selectedEmergency.alternativeRouteAvailable) {
      const altLine = L.polyline(selectedEmergency.alternativeRoute.waypoints, {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 8',
      });

      altLine.bindPopup(`
        <div class="p-2.5 text-xs bg-slate-900 text-slate-100 rounded-lg">
          <div class="font-bold text-amber-400">Alternative Bypass: ${selectedEmergency.alternativeRoute.name}</div>
          <p class="text-slate-300 mt-1">${selectedEmergency.alternativeRoute.label}</p>
          <p class="text-slate-400 mt-0.5">ETA: ${selectedEmergency.alternativeRoute.durationMinutes} min • Distance: ${selectedEmergency.alternativeRoute.distanceKm} km</p>
        </div>
      `);

      routesLayerRef.current.addLayer(altLine);
    }
  }, [selectedEmergency, showRoutes]);

  // Auto center when an emergency is selected
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEmergency) return;
    mapInstanceRef.current.panTo([selectedEmergency.location.lat, selectedEmergency.location.lng], {
      animate: true,
      duration: 1.0,
    });
  }, [selectedEmergency]);

  const recenterMap = () => {
    if (mapInstanceRef.current) {
      const centerCoord: [number, number] = userLiveLocation
        ? [userLiveLocation.lat, userLiveLocation.lng]
        : [12.9716, 77.5946];
      mapInstanceRef.current.setView(centerCoord, 12);
    }
  };

  const handleFlyToUserLocation = async () => {
    setIsLocating(true);
    const res = await detectLiveLocation();
    setIsLocating(false);
    if (res.success && res.lat && res.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 14, { animate: true, duration: 1.5 });
    }
  };

  return (
    <div className="space-y-3">
      {/* GIS Engine Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Active GIS Geospatial Engine:
          </span>
          <span className="text-xs font-bold text-white font-mono bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                mapProvider === 'google' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
              }`}
            />
            <span>{mapProvider === 'google' ? 'Google Maps Platform (Vector)' : 'OpenStreetMap (Leaflet)'}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto text-xs font-bold">
          <button
            onClick={() => setMapProvider('google')}
            className={`px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mapProvider === 'google'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🗺️ Google Maps</span>
          </button>

          <button
            onClick={() => setMapProvider('leaflet')}
            className={`px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mapProvider === 'leaflet'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/50'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🛰️ OpenStreetMap</span>
          </button>
        </div>
      </div>

      {mapProvider === 'google' ? (
        <GoogleEmergencyMap
          heightClass={heightClass}
          focusedEmergencyId={focusedEmergencyId}
          onSelectEmergency={onSelectEmergency}
          onSelectAmbulance={onSelectAmbulance}
          onSelectHospital={onSelectHospital}
        />
      ) : (
        <div className={`relative w-full ${heightClass} bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating GPS Locate Button */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleFlyToUserLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold shadow-xl backdrop-blur-md transition-all active:scale-95 disabled:opacity-60"
          title="Track my real-time GPS coordinates"
        >
          <Crosshair className={`w-4 h-4 text-cyan-400 ${isLocating ? 'animate-spin' : 'animate-pulse'}`} />
          <span>{isLocating ? 'Locating...' : 'Locate Me (Live GPS)'}</span>
        </button>
      </div>

      {/* Floating Left Control Panel */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-[280px]">
        {/* Layer Toggles Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Karnataka CAD Layers</span>
            </span>
            <button
              onClick={recenterMap}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Reset View to Karnataka Center"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showAmbulances}
                onChange={(e) => setShowAmbulances(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>🚑 Ambulances</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showHospitals}
                onChange={(e) => setShowHospitals(e.target.checked)}
                className="rounded accent-rose-500"
              />
              <span>🏥 Hospitals</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showEmergencies}
                onChange={(e) => setShowEmergencies(e.target.checked)}
                className="rounded accent-red-500"
              />
              <span>🚨 Incidents</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={showTraffic}
                onChange={(e) => setShowTraffic(e.target.checked)}
                className="rounded accent-amber-500"
              />
              <span>🚦 Traffic</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white col-span-2">
              <input
                type="checkbox"
                checked={showRoutes}
                onChange={(e) => setShowRoutes(e.target.checked)}
                className="rounded accent-cyan-500"
              />
              <span>🛣️ AI Routes</span>
            </label>
          </div>
        </div>

        {/* Severity Filter Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-2">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Emergency Filter</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => {
              const isActive = severityFilter === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                    isActive
                      ? sev === 'critical'
                        ? 'bg-red-600 text-white shadow'
                        : sev === 'high'
                        ? 'bg-orange-500 text-white shadow'
                        : sev === 'medium'
                        ? 'bg-yellow-500 text-slate-950 font-extrabold shadow'
                        : sev === 'low'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-blue-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Level Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl hidden md:flex items-center gap-3 text-[11px] text-slate-300">
        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Traffic Congestion:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
          <span>Severe</span>
        </div>
      </div>

      {/* Dynamic Traffic Alert & Alternative Route Banner */}
      {selectedEmergency &&
        selectedEmergency.alternativeRouteAvailable &&
        selectedEmergency.alternativeRoute && (
          <div className="absolute top-4 right-4 z-20 max-w-sm bg-gradient-to-br from-amber-950/95 via-slate-900/95 to-slate-900/95 backdrop-blur-md border border-amber-500/50 rounded-2xl p-4 shadow-2xl text-xs animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start justify-between gap-2 border-b border-amber-500/20 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-amber-300 text-xs tracking-tight">
                    Traffic Alert: Alternative Route
                  </h4>
                  <p className="text-[10px] text-slate-400">Congestion detected on current corridor</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Current Route</span>
                <span className="font-mono font-bold text-rose-400 text-sm">
                  {selectedEmergency.selectedRoute?.durationMinutes || 18} min
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Heavy Traffic</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 block font-semibold">Alternative Bypass</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {selectedEmergency.alternativeRoute.durationMinutes} min
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">
                  Save ~{selectedEmergency.timeDifferenceMinutes || 6} min
                </span>
              </div>
            </div>

            <button
              onClick={() => switchEmergencyRoute(selectedEmergency.id, selectedEmergency.alternativeRoute!)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg transition-all active:scale-95"
            >
              <span>Switch to {selectedEmergency.alternativeRoute.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
