export type EmergencySeverity = 'critical' | 'high' | 'medium' | 'low';

export type EmergencyStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'HOSPITAL_RECOMMENDED'
  | 'HOSPITAL_SELECTED'
  | 'AMBULANCE_ASSIGNED'
  | 'EN_ROUTE_TO_PATIENT'
  | 'REACHED_PATIENT'
  | 'PATIENT_PICKED_UP'
  | 'EN_ROUTE_TO_HOSPITAL'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  // Legacy aliases for full backward compatibility
  | 'created'
  | 'ambulance_assigned'
  | 'dispatched'
  | 'reached_patient'
  | 'patient_picked_up'
  | 'hospital_selected'
  | 'patient_transporting'
  | 'arrived_hospital'
  | 'completed';

export type EmergencyType =
  | 'Accident / Trauma'
  | 'Cardiac Emergency'
  | 'Stroke Symptoms'
  | 'Breathing Difficulty'
  | 'Severe Bleeding'
  | 'Burn'
  | 'Poisoning'
  | 'Pregnancy Emergency'
  | 'Pediatric Emergency'
  | 'Eye Emergency'
  | 'General Emergency'
  | 'Other'
  // Legacy aliases for backward compatibility
  | 'Accident'
  | 'Cardiac emergency'
  | 'Stroke'
  | 'Trauma'
  | 'Fire injury'
  | 'Pregnancy emergency'
  | 'Respiratory emergency';

export type AmbulanceStatus =
  | 'available'
  | 'en_route'
  | 'at_emergency'
  | 'transporting_patient'
  | 'at_hospital'
  | 'busy'
  | 'offline';

export type AmbulanceType = 'ALS' | 'BLS' | 'Neonatal' | 'Patient Transport';

export type HospitalStatus = 'available' | 'limited' | 'full';

export type AppTheme = 'high-contrast' | 'minimalist';

export type TrafficLevel = 'low' | 'moderate' | 'high' | 'severe';

export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'hospital' | 'patient' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  phone?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  type: AmbulanceType;
  status: AmbulanceStatus;
  location: Coordinates;
  sector: string;
  fuelPercent: number;
  equipmentScore: number;
  currentEmergencyId?: string;
  currentDestination?: string;
  etaMinutes?: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  location: Coordinates;
  sector: string;
  phone: string;
  status: HospitalStatus;
  emergencyAvailable: boolean;
  icuCapacity: number;
  availableIcu: number;
  generalBedsCapacity: number;
  availableGeneralBeds: number;
  traumaCenter: boolean;
  cardiology: boolean;
  neurology: boolean;
  pediatrics: boolean;
  burnUnit: boolean;
  ophthalmology?: boolean;
  generalMedicine?: boolean;
  ambulanceSupport: boolean;
  waitTimeMinutes: number;
  rating?: number;
  lastUpdated?: string;
  specialties?: string[];
  acceptedEmergencyIds?: string[];
  rejectedEmergencyIds?: string[];
}

export interface RouteOption {
  id: string;
  name: string;
  label: string; // e.g., 'Route A - Express Highway', 'Route B - Arterial Bypass'
  distanceKm: number;
  durationMinutes: number;
  trafficLevel: TrafficLevel;
  roadConditionScore: number; // 1-10 (10 best)
  signalDelays: number; // expected seconds of signal delays
  routeScore: number; // lowest is best
  recommended: boolean;
  waypoints: [number, number][];
  trafficPenalty: number;
  distancePenalty: number;
  roadRiskPenalty: number;
}

export interface EmergencyTimelineEvent {
  status: EmergencyStatus;
  timestamp: string;
  description: string;
  actor: string;
}

export interface Emergency {
  id: string;
  patientName: string;
  contactPhone: string;
  emergencyType: EmergencyType;
  customType?: string;
  severity: EmergencySeverity;
  requiredDepartment: string;
  patientCount: number;
  location: Coordinates;
  locationAddress: string;
  status: EmergencyStatus;
  ambulanceId?: string;
  hospitalId?: string;
  routeId?: string;
  selectedRoute?: RouteOption;
  alternativeRouteAvailable?: boolean;
  alternativeRoute?: RouteOption;
  timeDifferenceMinutes?: number;
  notes?: string;
  createdAt: string;
  dispatchedAt?: string;
  completedAt?: string;
  timeline: EmergencyTimelineEvent[];
}

export interface TrafficZone {
  id: string;
  name: string;
  polygon: [number, number][];
  level: TrafficLevel;
  averageSpeedKmh: number;
  vehicleCount: number;
  lastUpdated: string;
}

export interface HospitalMatchAnalysis {
  hospital: Hospital;
  distanceKm: number;
  etaMinutes: number;
  matchScore: number; // 0-100%
  facilityMatch: boolean;
  icuAvailable: boolean;
  recommendationReasons: string[];
  caveats: string[];
  aiRecommendationSummary?: string;
}

export interface EmergencyAlert {
  id: string;
  type: 'critical' | 'traffic' | 'hospital' | 'route' | 'ambulance';
  title: string;
  message: string;
  timestamp: string;
  emergencyId?: string;
  read: boolean;
}
