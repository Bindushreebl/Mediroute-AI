import L from 'leaflet';
import { Coordinates, TrafficLevel, RouteOption, AmbulanceStatus, EmergencySeverity } from '../types';

/**
 * Calculates Haversine distance in kilometers between two geo-coordinates
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Estimates basic travel time in minutes based on distance and traffic level
 */
export function estimateTravelTimeMinutes(distanceKm: number, traffic: TrafficLevel): number {
  let avgSpeedKmh = 45; // baseline urban speed for emergency vehicle with sirens
  switch (traffic) {
    case 'low':
      avgSpeedKmh = 55;
      break;
    case 'moderate':
      avgSpeedKmh = 38;
      break;
    case 'high':
      avgSpeedKmh = 24;
      break;
    case 'severe':
      avgSpeedKmh = 14;
      break;
  }
  const hours = distanceKm / avgSpeedKmh;
  const minutes = Math.ceil(hours * 60);
  return Math.max(minutes, 2);
}

/**
 * Generates realistic polyline waypoints connecting two coordinates with city road grid behavior
 */
export function generateRouteWaypoints(
  start: Coordinates,
  end: Coordinates,
  routeVariant: 'A' | 'B' | 'C' = 'A',
  steps = 8
): [number, number][] {
  const points: [number, number][] = [];
  points.push([start.lat, start.lng]);

  const latDelta = end.lat - start.lat;
  const lngDelta = end.lng - start.lng;

  // Variant offsets simulate different arterial corridors, highway bypasses or side avenues
  let latOffset = 0;
  let lngOffset = 0;

  if (routeVariant === 'B') {
    latOffset = 0.006;
    lngOffset = -0.005;
  } else if (routeVariant === 'C') {
    latOffset = -0.005;
    lngOffset = 0.007;
  }

  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    // Add realistic Manhattan-like city curve + slight offset
    const sineFactor = Math.sin(fraction * Math.PI);
    const midLat = start.lat + latDelta * fraction + latOffset * sineFactor;
    const midLng = start.lng + lngDelta * fraction + lngOffset * sineFactor;
    points.push([midLat, midLng]);
  }

  points.push([end.lat, end.lng]);
  return points;
}

/**
 * Generates 3 candidate routes (A, B, C) between two points
 */
export function generateCandidateRoutes(
  start: Coordinates,
  end: Coordinates,
  severity: EmergencySeverity = 'high'
): RouteOption[] {
  const baseDistance = calculateDistanceKm(start, end);

  // Route A: Direct Arterial Corridor
  const distA = Math.round((baseDistance * 1.15) * 10) / 10;
  const trafficA: TrafficLevel = severity === 'critical' ? 'moderate' : 'moderate';
  const timeA = estimateTravelTimeMinutes(distA, trafficA);
  const roadCondA = 8;
  const waypointsA = generateRouteWaypoints(start, end, 'A');

  // Route B: Highway Bypass (longer distance, lower traffic, faster speed)
  const distB = Math.round((baseDistance * 1.35) * 10) / 10;
  const trafficB: TrafficLevel = 'low';
  const timeB = Math.max(Math.ceil((distB / 58) * 60), 3);
  const roadCondB = 9;
  const waypointsB = generateRouteWaypoints(start, end, 'B');

  // Route C: Shortest Urban Cut (shortest distance, but dense signals & moderate-to-high traffic)
  const distC = Math.round((baseDistance * 1.05) * 10) / 10;
  const trafficC: TrafficLevel = 'high';
  const timeC = estimateTravelTimeMinutes(distC, trafficC);
  const roadCondC = 6;
  const waypointsC = generateRouteWaypoints(start, end, 'C');

  // Calculate penalties based on project formula
  // Route Score = Travel Time + Traffic Penalty + Distance Penalty + Road Risk Penalty
  const trafficPenalties: Record<TrafficLevel, number> = {
    low: 1.0,
    moderate: 3.5,
    high: 7.0,
    severe: 12.0,
  };

  const severityMultiplier = severity === 'critical' ? 1.5 : severity === 'high' ? 1.2 : 1.0;

  const scoreA = Math.round(
    (timeA * 1.2 + trafficPenalties[trafficA] * 2.0 + distA * 0.4 + (10 - roadCondA) * 1.5) *
      severityMultiplier *
      10
  ) / 10;

  const scoreB = Math.round(
    (timeB * 1.2 + trafficPenalties[trafficB] * 2.0 + distB * 0.4 + (10 - roadCondB) * 1.5) *
      severityMultiplier *
      10
  ) / 10;

  const scoreC = Math.round(
    (timeC * 1.2 + trafficPenalties[trafficC] * 2.0 + distC * 0.4 + (10 - roadCondC) * 1.5) *
      severityMultiplier *
      10
  ) / 10;

  // Determine which has lowest cost
  const minScore = Math.min(scoreA, scoreB, scoreC);

  const routes: RouteOption[] = [
    {
      id: 'route-opt-a',
      name: 'Route A',
      label: 'Main Arterial Corridor',
      distanceKm: distA,
      durationMinutes: timeA,
      trafficLevel: trafficA,
      roadConditionScore: roadCondA,
      signalDelays: 45,
      routeScore: scoreA,
      recommended: scoreA === minScore,
      waypoints: waypointsA,
      trafficPenalty: trafficPenalties[trafficA],
      distancePenalty: Math.round(distA * 0.4 * 10) / 10,
      roadRiskPenalty: (10 - roadCondA) * 1.5,
    },
    {
      id: 'route-opt-b',
      name: 'Route B',
      label: 'Express Highway Bypass',
      distanceKm: distB,
      durationMinutes: timeB,
      trafficLevel: trafficB,
      roadConditionScore: roadCondB,
      signalDelays: 15,
      routeScore: scoreB,
      recommended: scoreB === minScore,
      waypoints: waypointsB,
      trafficPenalty: trafficPenalties[trafficB],
      distancePenalty: Math.round(distB * 0.4 * 10) / 10,
      roadRiskPenalty: (10 - roadCondB) * 1.5,
    },
    {
      id: 'route-opt-c',
      name: 'Route C',
      label: 'Downtown Surface Cut',
      distanceKm: distC,
      durationMinutes: timeC,
      trafficLevel: trafficC,
      roadConditionScore: roadCondC,
      signalDelays: 90,
      routeScore: scoreC,
      recommended: scoreC === minScore,
      waypoints: waypointsC,
      trafficPenalty: trafficPenalties[trafficC],
      distancePenalty: Math.round(distC * 0.4 * 10) / 10,
      roadRiskPenalty: (10 - roadCondC) * 1.5,
    },
  ];

  return routes;
}

/**
 * Creates custom HTML Leaflet DivIcons for Ambulances, Hospitals, Emergencies, and Posts
 */
export function createAmbulanceIcon(status: AmbulanceStatus, isSelected = false): L.DivIcon {
  let bgColor = 'bg-emerald-500';
  let ringColor = 'ring-emerald-400';

  if (status === 'en_route' || status === 'transporting_patient') {
    bgColor = 'bg-blue-500';
    ringColor = 'ring-blue-400 animate-pulse';
  } else if (status === 'at_emergency') {
    bgColor = 'bg-amber-500';
    ringColor = 'ring-amber-400 animate-ping';
  } else if (status === 'busy' || status === 'offline') {
    bgColor = 'bg-slate-600';
    ringColor = 'ring-slate-500';
  }

  const selectedRing = isSelected ? 'scale-125 ring-4 ring-white shadow-2xl' : 'shadow-lg';

  const html = `
    <div class="relative flex items-center justify-center w-9 h-9 rounded-full ${bgColor} text-white ${ringColor} ${selectedRing} transition-all duration-300">
      <span class="text-base select-none">🚑</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker-ambulance',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export function createHospitalIcon(status: string, isSelected = false): L.DivIcon {
  let badgeColor = 'bg-rose-600';
  if (status === 'limited') badgeColor = 'bg-amber-600';
  if (status === 'full') badgeColor = 'bg-red-800';

  const selectedBorder = isSelected ? 'ring-4 ring-rose-400 scale-125' : 'ring-2 ring-white/60';

  const html = `
    <div class="flex items-center justify-center w-10 h-10 rounded-xl ${badgeColor} text-white shadow-xl ${selectedBorder} transition-transform">
      <span class="text-lg font-black tracking-tighter">🏥</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker-hospital',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

export function createEmergencyIcon(severity: EmergencySeverity, isSelected = false): L.DivIcon {
  let ringClasses = 'bg-red-600 ring-red-400 emergency-pulse-marker';
  if (severity === 'high') ringClasses = 'bg-orange-500 ring-orange-400 animate-pulse';
  if (severity === 'medium') ringClasses = 'bg-amber-500 ring-amber-400';
  if (severity === 'low') ringClasses = 'bg-emerald-600 ring-emerald-400';

  const selectedBorder = isSelected ? 'scale-130 ring-4 ring-white' : '';

  const html = `
    <div class="relative flex items-center justify-center w-10 h-10 rounded-full ${ringClasses} text-white shadow-2xl ${selectedBorder}">
      <span class="text-lg select-none">🚨</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker-emergency',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

export function createPostIcon(): L.DivIcon {
  const html = `
    <div class="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-700 text-white shadow-md border border-cyan-400">
      <span class="text-xs select-none">⛑️</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker-post',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

/**
 * Traffic zone styling helper for polygons
 */
export function getTrafficZoneColor(level: TrafficLevel): { stroke: string; fill: string } {
  switch (level) {
    case 'low':
      return { stroke: '#10b981', fill: '#10b981' };
    case 'moderate':
      return { stroke: '#eab308', fill: '#eab308' };
    case 'high':
      return { stroke: '#f97316', fill: '#f97316' };
    case 'severe':
      return { stroke: '#ef4444', fill: '#ef4444' };
  }
}
