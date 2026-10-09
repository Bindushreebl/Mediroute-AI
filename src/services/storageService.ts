import {
  Ambulance,
  Hospital,
  Emergency,
  TrafficZone,
  User,
  EmergencyAlert,
  EmergencySeverity,
  EmergencyStatus,
  RouteOption,
} from '../types';
import { generateCandidateRoutes } from './mapService';
import { KARNATAKA_REAL_HOSPITALS, KARNATAKA_108_AMBULANCES } from './karnatakaData';

// Center reference coordinate: Karnataka State Emergency Operations Centre (Vidhana Soudha, Bengaluru)
export const METRO_CENTER = { lat: 12.9716, lng: 77.5946 };
export const KARNATAKA_CENTER = { lat: 12.9716, lng: 77.5946 };

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Capt. Sarah Jenkins',
    email: 'sarah.jenkins@mediroute.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '98450 11001',
  },
  {
    id: 'usr-2',
    name: 'Marcus Vance (Karnataka Dispatch Lead)',
    email: 'marcus.dispatch@mediroute.org',
    role: 'dispatcher',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '98450 11002',
  },
  {
    id: 'usr-3',
    name: 'Manjunath Gowda (108 Lead Pilot)',
    email: 'david.r@mediroute.org',
    role: 'driver',
    assignedAmbulanceId: 'amb-ka-101',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '98451 10899',
  },
  {
    id: 'usr-4',
    name: 'Dr. B.R. Patil (Emergency Chief, Victoria Hospital)',
    email: 'hospital@mediroute.org',
    role: 'hospital',
    assignedHospitalId: 'hosp-ka-blr-01',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    phone: '080-26701150',
  },
  {
    id: 'usr-5',
    name: 'Pooja Sharma (Citizen / Emergency Requester)',
    email: 'patient@mediroute.org',
    role: 'patient',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '98452 77890',
  },
  {
    id: 'usr-6',
    name: 'Dr. Elena Rostova (State Health Dept)',
    email: 'elena.viewer@healthdept.gov',
    role: 'viewer',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    phone: '080-22250000',
  },
];

export const INITIAL_HOSPITALS: Hospital[] = KARNATAKA_REAL_HOSPITALS;

export const INITIAL_AMBULANCES: Ambulance[] = KARNATAKA_108_AMBULANCES;

export const INITIAL_TRAFFIC_ZONES: TrafficZone[] = [
  {
    id: 'zone-a',
    name: 'Zone A - Kempegowda Airport Expressway (NH-44)',
    level: 'low',
    averageSpeedKmh: 68,
    vehicleCount: 220,
    lastUpdated: '1 min ago',
    polygon: [
      [13.12, 77.62],
      [13.20, 77.68],
      [13.18, 77.72],
      [13.08, 77.65],
    ],
  },
  {
    id: 'zone-b',
    name: 'Zone B - Bannerghatta & Jayanagar Corridor',
    level: 'moderate',
    averageSpeedKmh: 36,
    vehicleCount: 540,
    lastUpdated: '2 min ago',
    polygon: [
      [12.94, 77.58],
      [12.95, 77.61],
      [12.90, 77.62],
      [12.89, 77.57],
    ],
  },
  {
    id: 'zone-c',
    name: 'Zone C - Central Silk Board & Hosur Road (High)',
    level: 'high',
    averageSpeedKmh: 19,
    vehicleCount: 980,
    lastUpdated: 'Just now',
    polygon: [
      [12.93, 77.61],
      [12.92, 77.64],
      [12.90, 77.63],
      [12.91, 77.60],
    ],
  },
  {
    id: 'zone-d',
    name: 'Zone D - Tin Factory & K.R. Puram Chokepoint (Severe)',
    level: 'severe',
    averageSpeedKmh: 11,
    vehicleCount: 1650,
    lastUpdated: 'Just now',
    polygon: [
      [13.01, 77.66],
      [13.02, 77.70],
      [12.98, 77.71],
      [12.98, 77.67],
    ],
  },
];

export const INITIAL_EMERGENCIES: Emergency[] = [
  {
    id: 'emg-001',
    patientName: 'Ramesh Kulkarni (Age 56)',
    contactPhone: '98450 22319',
    emergencyType: 'Cardiac emergency',
    severity: 'critical',
    requiredDepartment: 'Cardiology & Cath Lab',
    patientCount: 1,
    location: { lat: 12.9738, lng: 77.6080 },
    locationAddress: 'MG Road Metro Station, Bengaluru, Karnataka',
    status: 'patient_transporting',
    ambulanceId: 'amb-ka-101',
    hospitalId: 'hosp-ka-blr-03', // Jayadeva
    createdAt: '12 min ago',
    notes: 'Severe crushing chest pain, STEMI observed on field 12-lead ECG. Transmitting directly to Jayadeva Cath Lab.',
    timeline: [
      { status: 'created', timestamp: '12m ago', description: 'Emergency call received via 108 dispatch system', actor: 'Marcus Vance' },
      { status: 'ambulance_assigned', timestamp: '11m ago', description: 'KA-01-G-1081 (ALS) auto-assigned via AI proximity', actor: 'AI Engine' },
      { status: 'dispatched', timestamp: '10m ago', description: 'Sirens activated, unit rolling to MG Road corridor', actor: 'Manjunath Gowda' },
      { status: 'reached_patient', timestamp: '6m ago', description: 'Paramedics stabilized patient, IV line and aspirin given', actor: 'Paramedic Team' },
      { status: 'patient_picked_up', timestamp: '4m ago', description: 'Patient secured in 108 ALS vehicle', actor: 'Manjunath Gowda' },
      { status: 'hospital_selected', timestamp: '4m ago', description: 'Sri Jayadeva Institute of Cardiovascular Sciences confirmed (98% Match Score)', actor: 'AI Engine' },
      { status: 'patient_transporting', timestamp: '3m ago', description: 'Transporting via Route B express bypass. ETA 6 min.', actor: 'Manjunath Gowda' },
    ],
  },
  {
    id: 'emg-002',
    patientName: 'Highway Collision Victims (2 Passengers)',
    contactPhone: '98452 77100',
    emergencyType: 'Accident',
    severity: 'critical',
    requiredDepartment: 'Trauma Center Level 1',
    patientCount: 2,
    location: { lat: 12.9510, lng: 77.5680 },
    locationAddress: 'Mysore Road Flyover, Bengaluru, Karnataka',
    status: 'dispatched',
    ambulanceId: 'amb-ka-102',
    hospitalId: 'hosp-ka-blr-01', // Victoria
    createdAt: '7 min ago',
    notes: 'High-speed two-wheeler and car collision. Driver with multiple fractures and blunt trauma.',
    timeline: [
      { status: 'created', timestamp: '7m ago', description: 'Traffic police relayed rollover accident', actor: 'Marcus Vance' },
      { status: 'ambulance_assigned', timestamp: '6m ago', description: 'Assigned KA-05-G-1082 (ALS)', actor: 'AI Engine' },
      { status: 'dispatched', timestamp: '5m ago', description: 'Ambulance en route with siren on priority lane', actor: 'Suresh Kumar' },
    ],
  },
  {
    id: 'emg-003',
    patientName: 'Anasuya Hegde (Age 64)',
    contactPhone: '98454 88123',
    emergencyType: 'Stroke',
    severity: 'high',
    requiredDepartment: 'Comprehensive Stroke & Neurology',
    patientCount: 1,
    location: { lat: 12.2982, lng: 76.6341 },
    locationAddress: 'Kuvempunagar 5th Cross, Mysuru, Karnataka',
    status: 'reached_patient',
    ambulanceId: 'amb-ka-105',
    hospitalId: 'hosp-ka-mys-01', // K.R. Hospital Mysuru
    createdAt: '16 min ago',
    notes: 'Sudden onset facial asymmetry, slurred speech. FAST score positive.',
    timeline: [
      { status: 'created', timestamp: '16m ago', description: 'Family called 108 emergency helpline', actor: 'Marcus Vance' },
      { status: 'ambulance_assigned', timestamp: '15m ago', description: 'Assigned Mysuru Substation Unit KA-09-G-1085', actor: 'AI Engine' },
      { status: 'dispatched', timestamp: '13m ago', description: 'Ambulance rolling through Kuvempunagar', actor: 'Raghavendra Rao' },
      { status: 'reached_patient', timestamp: '5m ago', description: 'Paramedic evaluating patient, pre-notifying stroke unit', actor: 'Raghavendra Rao' },
    ],
  },
  {
    id: 'emg-004',
    patientName: 'Sunil Shenoy',
    contactPhone: '98456 33901',
    emergencyType: 'Accident',
    severity: 'medium',
    requiredDepartment: 'Trauma Center Level 1',
    patientCount: 1,
    location: { lat: 12.8720, lng: 74.8450 },
    locationAddress: 'Hampankatta, Mangaluru, Dakshina Kannada, Karnataka',
    status: 'created',
    createdAt: '3 min ago',
    notes: 'Skid fall from scooter on rain-slicked road. Conscious, arm lacerations.',
    timeline: [
      { status: 'created', timestamp: '3m ago', description: 'Call logged from Mangaluru Central Station', actor: 'Marcus Vance' },
    ],
  },
];

// Pre-calculate routes for initial emergencies
INITIAL_EMERGENCIES.forEach((emg) => {
  if (emg.hospitalId) {
    const hosp = INITIAL_HOSPITALS.find((h) => h.id === emg.hospitalId);
    if (hosp) {
      const routes = generateCandidateRoutes(emg.location, hosp.location, emg.severity);
      emg.selectedRoute = routes[0];
      if (routes.length > 1) {
        emg.alternativeRoute = routes[1];
        emg.alternativeRouteAvailable = true;
        emg.timeDifferenceMinutes = Math.abs(routes[0].durationMinutes - routes[1].durationMinutes);
      }
    }
  }
});

export const INITIAL_ALERTS: EmergencyAlert[] = [
  {
    id: 'alt-1',
    type: 'critical',
    title: 'Karnataka 108 Unit Dispatched',
    message: 'KA-01-G-1081 dispatched to MG Road Cardiac Emergency (Direct route to Sri Jayadeva Institute).',
    timestamp: '5 min ago',
    emergencyId: 'emg-001',
    read: false,
  },
  {
    id: 'alt-2',
    type: 'traffic',
    title: '⚠️ Heavy Traffic on Silk Board Corridor',
    message: 'High congestion on Central Silk Board. AI suggests NICE Road / Express bypass saving 6 mins.',
    timestamp: '3 min ago',
    read: false,
  },
  {
    id: 'alt-3',
    type: 'hospital',
    title: 'Bengaluru Trauma Center Alert',
    message: 'Victoria Hospital Trauma Centre ready for incoming double trauma dispatch.',
    timestamp: '9 min ago',
    read: false,
  },
];

export const HISTORICAL_EMERGENCIES_DATA = [
  { date: 'Mon', count: 28, avgResponseMin: 10.2 },
  { date: 'Tue', count: 32, avgResponseMin: 11.4 },
  { date: 'Wed', count: 29, avgResponseMin: 9.8 },
  { date: 'Thu', count: 35, avgResponseMin: 12.1 },
  { date: 'Fri', count: 42, avgResponseMin: 13.0 },
  { date: 'Sat', count: 46, avgResponseMin: 11.5 },
  { date: 'Sun', count: 34, avgResponseMin: 10.4 },
];

export const EMERGENCY_TYPES_DISTRIBUTION = [
  { name: 'Road Accidents (NH-44/NH-48/NH-75)', value: 42, color: '#ef4444' },
  { name: 'Cardiac / Jayadeva Direct', value: 31, color: '#f97316' },
  { name: 'Stroke / NIMHANS Neuro', value: 18, color: '#eab308' },
  { name: 'Respiratory / Asthma', value: 12, color: '#06b6d4' },
  { name: 'Maternal / 108 Janani', value: 10, color: '#ec4899' },
  { name: 'Mahabodhi Burns', value: 7, color: '#8b5cf6' },
  { name: 'Other Medical Emergencies', value: 11, color: '#64748b' },
];

// Heatmap hotspot simulation clusters across Karnataka
export const HEATMAP_HOTSPOTS = [
  { lat: 12.9172, lng: 77.6228, intensity: 0.95, label: 'Central Silk Board Junction (Bengaluru)' },
  { lat: 12.9738, lng: 77.6080, intensity: 0.88, label: 'MG Road / Brigade Road Junction (Bengaluru)' },
  { lat: 13.0163, lng: 77.5558, intensity: 0.82, label: 'Yeshwantpur / Goraguntepalya NH-48 (Bengaluru)' },
  { lat: 12.3148, lng: 76.6492, intensity: 0.74, label: 'K.R. Circle & Sayyaji Rao Road (Mysuru)' },
  { lat: 12.8712, lng: 74.8491, intensity: 0.76, label: 'Hampankatta & State Bank Circle (Mangaluru)' },
  { lat: 15.3585, lng: 75.1325, intensity: 0.71, label: 'Vidyanagar & Chennamma Circle (Hubballi)' },
  { lat: 15.8572, lng: 74.5098, intensity: 0.65, label: 'Rani Chennamma Circle (Belagavi)' },
];
