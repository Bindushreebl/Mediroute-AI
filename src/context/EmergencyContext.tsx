import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ambulance,
  Hospital,
  Emergency,
  TrafficZone,
  User,
  EmergencyAlert,
  EmergencyStatus,
  AmbulanceStatus,
  RouteOption,
  UserRole,
  Coordinates,
  AppTheme,
} from '../types';
import {
  INITIAL_AMBULANCES,
  INITIAL_HOSPITALS,
  INITIAL_EMERGENCIES,
  INITIAL_TRAFFIC_ZONES,
  INITIAL_USERS,
  INITIAL_ALERTS,
} from '../services/storageService';
import { rankHospitalsForEmergency } from '../services/aiScoringService';
import { calculateDistanceKm, generateCandidateRoutes } from '../services/mapService';
import {
  generateMockJwt,
  saveAuthSession,
  clearAuthSession,
  getStoredAuthSession,
  MOCK_CREDENTIALS,
} from '../services/authService';
import { requestUserLiveLocation, findNearestKarnatakaDistrict } from '../services/geolocationService';
import { KARNATAKA_DISTRICTS } from '../services/karnatakaData';

interface EmergencyContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  authToken: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string; role: UserRole }) => Promise<{ success: boolean; error?: string }>;
  loginWithRolePreset: (role: UserRole) => void;
  logout: () => void;
  userLiveLocation: Coordinates | null;
  userLocationAddress: string | null;
  selectedDistrict: string;
  selectedTaluk: string;
  detectLiveLocation: () => Promise<{ success: boolean; lat?: number; lng?: number; address?: string; district?: string; taluk?: string; error?: string }>;
  setKarnatakaDistrictAndTaluk: (districtName: string, talukName?: string) => void;
  emergencies: Emergency[];
  ambulances: Ambulance[];
  hospitals: Hospital[];
  trafficZones: TrafficZone[];
  alerts: EmergencyAlert[];
  selectedEmergency: Emergency | null;
  setSelectedEmergency: (e: Emergency | null) => void;
  selectedHospital: Hospital | null;
  setSelectedHospital: (h: Hospital | null) => void;
  selectedAmbulance: Ambulance | null;
  setSelectedAmbulance: (a: Ambulance | null) => void;
  createEmergency: (data: Partial<Emergency>) => Emergency;
  updateEmergencyStatus: (id: string, nextStatus: EmergencyStatus) => void;
  switchEmergencyRoute: (emergencyId: string, route: RouteOption) => void;
  registerAmbulance: (ambulanceData: Partial<Ambulance>) => Ambulance;
  updateAmbulanceStatus: (id: string, status: AmbulanceStatus) => void;
  updateHospitalStatus: (id: string, status: Hospital['status'], availableIcu: number) => void;
  updateHospitalBeds: (id: string, availableGeneralBeds: number, availableIcu: number) => void;
  acceptEmergencyByHospital: (hospitalId: string, emergencyId: string) => void;
  rejectEmergencyByHospital: (hospitalId: string, emergencyId: string, reason?: string) => void;
  cancelEmergency: (emergencyId: string) => void;
  reassignAmbulance: (emergencyId: string, ambulanceId: string) => void;
  addHospital: (hospitalData: Partial<Hospital>) => Hospital;
  deleteHospital: (hospitalId: string) => void;
  dismissAlert: (id: string) => void;
  addAlert: (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'read'>) => void;
  isSimulating: boolean;
  toggleSimulation: () => void;
  resetDemoData: () => void;
  triggerSimulatedTrafficIncident: () => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isVoiceAssistantOpen: boolean;
  setIsVoiceAssistantOpen: (open: boolean) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check stored auth session
  const stored = getStoredAuthSession();
  const [currentUser, setCurrentUserState] = useState<User | null>(stored ? stored.user : null);
  const [authToken, setAuthToken] = useState<string | null>(stored ? stored.token : null);

  // Live Location & Karnataka Region State
  const [userLiveLocation, setUserLiveLocation] = useState<Coordinates | null>(null);
  const [userLocationAddress, setUserLocationAddress] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Bengaluru Urban');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('Bengaluru North');

  const [emergencies, setEmergencies] = useState<Emergency[]>(INITIAL_EMERGENCIES);
  const [ambulances, setAmbulances] = useState<Ambulance[]>(INITIAL_AMBULANCES);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [trafficZones, setTrafficZones] = useState<TrafficZone[]>(INITIAL_TRAFFIC_ZONES);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_ALERTS);

  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(INITIAL_EMERGENCIES[0] || null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // UI Theme & Voice Assistant State (High Contrast vs Minimalist Daylight)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('mediroute_theme');
      if (saved === 'minimalist' || saved === 'high-contrast') return saved;
      if (saved === 'light') return 'minimalist';
      if (saved === 'dark') return 'high-contrast';
    } catch {
      // ignore
    }
    return 'high-contrast';
  });
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('mediroute_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'high-contrast' ? 'minimalist' : 'high-contrast');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'high-contrast') {
      root.classList.add('theme-high-contrast');
      root.classList.remove('theme-minimalist');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('theme-minimalist');
      root.classList.remove('theme-high-contrast');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    const token = generateMockJwt(user);
    setAuthToken(token);
    saveAuthSession(user, token);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Artificial small latency for realism
    await new Promise((res) => setTimeout(res, 300));

    const credentialEntry = MOCK_CREDENTIALS[email.toLowerCase().trim()];
    if (!credentialEntry) {
      // Allow dynamic login for newly created users or match by email
      const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (matched && password.length >= 6) {
        const token = generateMockJwt(matched);
        setCurrentUserState(matched);
        setAuthToken(token);
        saveAuthSession(matched, token);
        return { success: true };
      }
      return { success: false, error: 'User email not found. Please register or use a demo account.' };
    }

    if (credentialEntry.password !== password && password !== 'Password123!') {
      return { success: false, error: 'Invalid password. (Hint: Demo password is Password123!)' };
    }

    const token = generateMockJwt(credentialEntry.user);
    setCurrentUserState(credentialEntry.user);
    setAuthToken(token);
    saveAuthSession(credentialEntry.user, token);
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    await new Promise((res) => setTimeout(res, 300));

    if (!data.name || !data.email || !data.password) {
      return { success: false, error: 'All fields are required.' };
    }
    if (data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    // Save in credentials dictionary
    MOCK_CREDENTIALS[newUser.email] = {
      password: data.password,
      user: newUser,
    };

    const token = generateMockJwt(newUser);
    setCurrentUserState(newUser);
    setAuthToken(token);
    saveAuthSession(newUser, token);
    return { success: true };
  };

  const loginWithRolePreset = (role: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[1];
    const token = generateMockJwt(matched);
    setCurrentUserState(matched);
    setAuthToken(token);
    saveAuthSession(matched, token);
  };

  const logout = () => {
    setCurrentUserState(null);
    setAuthToken(null);
    clearAuthSession();
  };

  const detectLiveLocation = async (): Promise<{
    success: boolean;
    lat?: number;
    lng?: number;
    address?: string;
    district?: string;
    taluk?: string;
    error?: string;
  }> => {
    try {
      const geo = await requestUserLiveLocation();
      setUserLiveLocation(geo.coords);
      setUserLocationAddress(geo.address);
      if (geo.district) setSelectedDistrict(geo.district);
      if (geo.taluk) setSelectedTaluk(geo.taluk);

      // Dynamically station an available 108 Arogya Kavacha ambulance near user's live coordinates (~1.2 km)
      const nearestDist = findNearestKarnatakaDistrict(geo.coords);
      const nearbyAmbId = `amb-108-live-${Date.now().toString().slice(-4)}`;
      const nearbyAmb: Ambulance = {
        id: nearbyAmbId,
        vehicleNumber: `${nearestDist.code.split('/')[0]}-G-108 (108 Arogya Kavacha)`,
        driverName: 'Manjunatha Swamy (108 Lead Pilot)',
        driverPhone: '98451 10899',
        type: 'ALS',
        status: 'available',
        location: {
          lat: geo.coords.lat + 0.007,
          lng: geo.coords.lng + 0.007,
        },
        sector: `${geo.district || nearestDist.name} - ${geo.taluk || nearestDist.taluks[0]} Outpost`,
        fuelPercent: 96,
        equipmentScore: 99,
      };

      setAmbulances((prev) => [nearbyAmb, ...prev.filter((a) => a.id !== nearbyAmbId)]);

      addAlert({
        type: 'ambulance',
        title: '📍 Live GPS Location Synchronized',
        message: `Location: ${geo.address}. Closest 108 Arogya Kavacha units ready in ${geo.district || nearestDist.name}.`,
      });

      return {
        success: true,
        lat: geo.coords.lat,
        lng: geo.coords.lng,
        address: geo.address,
        district: geo.district,
        taluk: geo.taluk,
      };
    } catch (err: any) {
      const errMsg = err?.message || 'Could not fetch live GPS coordinates.';
      addAlert({
        type: 'critical',
        title: 'GPS Location Warning',
        message: `${errMsg} Switching to Karnataka District dispatch selector.`,
      });
      return { success: false, error: errMsg };
    }
  };

  const setKarnatakaDistrictAndTaluk = (districtName: string, talukName?: string) => {
    setSelectedDistrict(districtName);
    const dist = KARNATAKA_DISTRICTS.find((d) => d.name === districtName) || KARNATAKA_DISTRICTS[0];
    const chosenTaluk = talukName || dist.taluks[0];
    setSelectedTaluk(chosenTaluk);
    setUserLiveLocation(dist.center);
    setUserLocationAddress(`${chosenTaluk} Taluk, ${dist.name}, Karnataka`);

    // Ensure 108 unit at this taluk
    const talukAmbId = `amb-108-${dist.name.toLowerCase().replace(/\s+/g, '-')}`;
    const talukAmb: Ambulance = {
      id: talukAmbId,
      vehicleNumber: `${dist.code.split('/')[0]}-G-108 (108 Kavacha)`,
      driverName: 'Suresh Patil (108 Pilot)',
      driverPhone: '98451 10800',
      type: 'ALS',
      status: 'available',
      location: {
        lat: dist.center.lat + 0.006,
        lng: dist.center.lng + 0.006,
      },
      sector: `${dist.name} - ${chosenTaluk} Substation`,
      fuelPercent: 95,
      equipmentScore: 98,
    };
    setAmbulances((prev) => [talukAmb, ...prev.filter((a) => a.id !== talukAmbId)]);
  };

  // Auto-simulation timer: gently advances active ambulance positions along their routes
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setAmbulances((prevAmbs) =>
        prevAmbs.map((amb) => {
          if (amb.status === 'en_route' || amb.status === 'transporting_patient') {
            // Find active emergency for this ambulance
            const assignedEmg = emergencies.find((e) => e.ambulanceId === amb.id);
            if (assignedEmg && assignedEmg.selectedRoute && assignedEmg.selectedRoute.waypoints.length > 1) {
              const waypoints = assignedEmg.selectedRoute.waypoints;
              // Pick next waypoint or nudge toward hospital
              const target = waypoints[Math.min(waypoints.length - 1, 3)];
              const latNudge = (target[0] - amb.location.lat) * 0.08;
              const lngNudge = (target[1] - amb.location.lng) * 0.08;
              return {
                ...amb,
                location: {
                  lat: amb.location.lat + latNudge,
                  lng: amb.location.lng + lngNudge,
                },
                etaMinutes: Math.max(1, (amb.etaMinutes || 5) - (Math.random() > 0.6 ? 1 : 0)),
              };
            }
          }
          return amb;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating, emergencies]);

  const addAlert = (newAlert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'read'>) => {
    const alert: EmergencyAlert = {
      ...newAlert,
      id: `alt-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setAlerts((prev) => [alert, ...prev]);
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const createEmergency = (data: Partial<Emergency>): Emergency => {
    const id = `emg-${String(emergencies.length + 1).padStart(3, '0')}`;
    const location = data.location || { lat: 37.776, lng: -122.422 };

    // AI Step 1: Find nearest available ambulance
    const availableAmbs = ambulances.filter((a) => a.status === 'available');
    let chosenAmbulance: Ambulance | undefined;
    if (availableAmbs.length > 0) {
      chosenAmbulance = availableAmbs.reduce((closest, current) => {
        const d1 = calculateDistanceKm(location, closest.location);
        const d2 = calculateDistanceKm(location, current.location);
        return d2 < d1 ? current : closest;
      }, availableAmbs[0]);
    }

    // AI Step 2: Recommend suitable hospital
    const rankedHospitals = rankHospitalsForEmergency(hospitals, {
      location,
      emergencyType: data.emergencyType,
      requiredDepartment: data.requiredDepartment,
      severity: data.severity,
    });
    const chosenHospital = rankedHospitals[0]?.hospital || hospitals[0];

    // AI Step 3: Compute candidate routes
    const routes = generateCandidateRoutes(location, chosenHospital.location, data.severity || 'high');
    const primaryRoute = routes.find((r) => r.recommended) || routes[0];
    const alternativeRoute = routes.find((r) => r.id !== primaryRoute.id) || routes[1];

    const newEmergency: Emergency = {
      id,
      patientName: data.patientName || 'Emergency Patient',
      contactPhone: data.contactPhone || '(555) 000-0000',
      emergencyType: data.emergencyType || 'Accident',
      customType: data.customType,
      severity: data.severity || 'high',
      requiredDepartment: data.requiredDepartment || 'General Emergency',
      patientCount: data.patientCount || 1,
      location,
      locationAddress: data.locationAddress || 'Current Incident Site',
      status: chosenAmbulance ? 'ambulance_assigned' : 'created',
      ambulanceId: chosenAmbulance?.id,
      hospitalId: chosenHospital?.id,
      routeId: primaryRoute.id,
      selectedRoute: primaryRoute,
      alternativeRouteAvailable: true,
      alternativeRoute: alternativeRoute,
      timeDifferenceMinutes: Math.abs(primaryRoute.durationMinutes - alternativeRoute.durationMinutes),
      notes: data.notes || '',
      createdAt: 'Just now',
      timeline: [
        {
          status: 'created',
          timestamp: 'Just now',
          description: `Emergency registered. Severity: ${data.severity?.toUpperCase() || 'HIGH'}`,
          actor: currentUser?.name || 'Authorized Dispatcher',
        },
      ],
    };

    if (chosenAmbulance) {
      newEmergency.timeline.push({
        status: 'ambulance_assigned',
        timestamp: 'Just now',
        description: `Ambulance ${chosenAmbulance.vehicleNumber} (${chosenAmbulance.type}) assigned via AI proximity.`,
        actor: 'AI Dispatch Engine',
      });

      // Update ambulance status
      setAmbulances((prev) =>
        prev.map((a) =>
          a.id === chosenAmbulance!.id
            ? {
                ...a,
                status: 'en_route',
                currentEmergencyId: id,
                currentDestination: data.locationAddress || 'Emergency Scene',
                etaMinutes: Math.ceil(calculateDistanceKm(a.location, location) * 2.2),
              }
            : a
        )
      );
    }

    setEmergencies((prev) => [newEmergency, ...prev]);
    setSelectedEmergency(newEmergency);

    addAlert({
      type: newEmergency.severity === 'critical' ? 'critical' : 'ambulance',
      title: `Emergency ${newEmergency.id} Created`,
      message: `${newEmergency.emergencyType} reported. Assigned to ${chosenAmbulance ? chosenAmbulance.vehicleNumber : 'Pending Fleet'}.`,
      emergencyId: newEmergency.id,
    });

    return newEmergency;
  };

  const updateEmergencyStatus = (id: string, nextStatus: EmergencyStatus) => {
    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== id) return emg;

        const statusLabels: Partial<Record<EmergencyStatus, string>> = {
          REQUESTED: 'Emergency Assistance Requested',
          SEARCHING: 'Searching Nearest 108 Units',
          HOSPITAL_RECOMMENDED: 'Hospital Recommended by AI',
          HOSPITAL_SELECTED: 'Destination Hospital Pre-Notified',
          AMBULANCE_ASSIGNED: 'Ambulance Assigned via AI Proximity',
          EN_ROUTE_TO_PATIENT: 'Ambulance En Route to Patient',
          REACHED_PATIENT: 'Reached Patient & Commenced Triage',
          PATIENT_PICKED_UP: 'Patient Secured in Vehicle',
          EN_ROUTE_TO_HOSPITAL: 'Transporting Patient with Siren Active',
          ARRIVED: 'Arrived at Emergency Bay',
          COMPLETED: 'Handoff Complete & Emergency Resolved',
          CANCELLED: 'Emergency Cancelled',
          // Aliases
          created: 'Emergency Created',
          ambulance_assigned: 'Ambulance Assigned',
          dispatched: 'Ambulance Dispatched',
          reached_patient: 'Reached Patient & Commenced Triage',
          patient_picked_up: 'Patient Secured in Vehicle',
          hospital_selected: 'Destination Hospital Pre-Notified',
          patient_transporting: 'Transporting Patient with Siren Active',
          arrived_hospital: 'Arrived at Emergency Bay',
          completed: 'Handoff Complete & Emergency Resolved',
        };

        const newTimelineEvent = {
          status: nextStatus,
          timestamp: 'Just now',
          description: statusLabels[nextStatus] || nextStatus,
          actor: currentUser?.name || 'Dispatcher Team',
        };

        const updated: Emergency = {
          ...emg,
          status: nextStatus,
          timeline: [...emg.timeline, newTimelineEvent],
          completedAt: nextStatus === 'completed' ? 'Just now' : emg.completedAt,
        };

        // If completed or arrived, update assigned ambulance
        if (emg.ambulanceId) {
          if (nextStatus === 'completed') {
            setAmbulances((ambs) =>
              ambs.map((a) =>
                a.id === emg.ambulanceId
                  ? {
                      ...a,
                      status: 'available',
                      currentEmergencyId: undefined,
                      currentDestination: undefined,
                      etaMinutes: undefined,
                    }
                  : a
              )
            );
          } else if (nextStatus === 'patient_transporting') {
            setAmbulances((ambs) =>
              ambs.map((a) =>
                a.id === emg.ambulanceId
                  ? {
                      ...a,
                      status: 'transporting_patient',
                      currentDestination: 'Hospital Emergency Receiving Bay',
                      etaMinutes: emg.selectedRoute?.durationMinutes || 7,
                    }
                  : a
              )
            );
          } else if (nextStatus === 'reached_patient') {
            setAmbulances((ambs) =>
              ambs.map((a) => (a.id === emg.ambulanceId ? { ...a, status: 'at_emergency', etaMinutes: 0 } : a))
            );
          }
        }

        if (selectedEmergency?.id === id) {
          setSelectedEmergency(updated);
        }

        return updated;
      })
    );
  };

  const switchEmergencyRoute = (emergencyId: string, route: RouteOption) => {
    setEmergencies((prev) =>
      prev.map((emg) => {
        if (emg.id !== emergencyId) return emg;
        const updated = {
          ...emg,
          selectedRoute: route,
          routeId: route.id,
          alternativeRouteAvailable: false,
        };
        if (selectedEmergency?.id === emergencyId) {
          setSelectedEmergency(updated);
        }
        return updated;
      })
    );

    addAlert({
      type: 'route',
      title: 'Route Switched',
      message: `Emergency ${emergencyId} updated to ${route.name} (${route.label}). ETA: ${route.durationMinutes}m.`,
      emergencyId,
    });
  };

  const registerAmbulance = (ambulanceData: Partial<Ambulance>): Ambulance => {
    const id = `amb-${Math.floor(100 + Math.random() * 900)}`;
    const newAmb: Ambulance = {
      id,
      vehicleNumber: ambulanceData.vehicleNumber || `MED-${Math.floor(900 + Math.random() * 99)}`,
      driverName: ambulanceData.driverName || 'Reserve Driver',
      driverPhone: ambulanceData.driverPhone || '(555) 881-0000',
      type: ambulanceData.type || 'ALS',
      status: ambulanceData.status || 'available',
      location: ambulanceData.location || { lat: 37.775, lng: -122.42 },
      sector: ambulanceData.sector || 'Central Fleet Depot',
      fuelPercent: 100,
      equipmentScore: 98,
    };

    setAmbulances((prev) => [newAmb, ...prev]);
    addAlert({
      type: 'ambulance',
      title: 'New Ambulance Registered',
      message: `${newAmb.vehicleNumber} (${newAmb.type}) added to active fleet.`,
    });

    return newAmb;
  };

  const updateAmbulanceStatus = (id: string, status: AmbulanceStatus) => {
    setAmbulances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const updateHospitalStatus = (id: string, status: Hospital['status'], availableIcu: number) => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status, availableIcu } : h))
    );
  };

  const updateHospitalBeds = (id: string, availableGeneralBeds: number, availableIcu: number) => {
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              availableGeneralBeds: Math.max(0, Math.min(h.generalBedsCapacity, availableGeneralBeds)),
              availableIcu: Math.max(0, Math.min(h.icuCapacity, availableIcu)),
              status: availableIcu === 0 && availableGeneralBeds === 0 ? 'full' : availableIcu < 3 ? 'limited' : 'available',
            }
          : h
      )
    );
    addAlert({
      type: 'hospital',
      title: 'Hospital Capacity Updated',
      message: `Bed availability updated: ${availableGeneralBeds} General, ${availableIcu} ICU beds free.`,
    });
  };

  const acceptEmergencyByHospital = (hospitalId: string, emergencyId: string) => {
    const hosp = hospitals.find((h) => h.id === hospitalId);
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const accepted = h.acceptedEmergencyIds || [];
          const rejected = (h.rejectedEmergencyIds || []).filter((id) => id !== emergencyId);
          return {
            ...h,
            acceptedEmergencyIds: [...accepted.filter((id) => id !== emergencyId), emergencyId],
            rejectedEmergencyIds: rejected,
          };
        }
        return h;
      })
    );

    setEmergencies((prev) =>
      prev.map((e) => {
        if (e.id === emergencyId) {
          const nextTimeline = [
            ...e.timeline,
            {
              status: 'HOSPITAL_SELECTED' as EmergencyStatus,
              timestamp: 'Just now',
              description: `Emergency accepted by ${hosp?.name || 'receiving hospital'}. Trauma/ICU triage team on standby.`,
              actor: currentUser?.name || 'Hospital Emergency Bay',
            },
          ];
          const updated: Emergency = {
            ...e,
            status: 'HOSPITAL_SELECTED',
            hospitalId,
            timeline: nextTimeline,
          };
          if (selectedEmergency?.id === emergencyId) {
            setSelectedEmergency(updated);
          }
          return updated;
        }
        return e;
      })
    );

    addAlert({
      type: 'hospital',
      title: 'Emergency Intake Confirmed',
      message: `${hosp?.name || 'Hospital'} accepted Emergency ${emergencyId}. Emergency bay pre-notified.`,
      emergencyId,
    });
  };

  const rejectEmergencyByHospital = (hospitalId: string, emergencyId: string, reason?: string) => {
    const hosp = hospitals.find((h) => h.id === hospitalId);
    const targetEmg = emergencies.find((e) => e.id === emergencyId);

    // Record rejection
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const rejected = h.rejectedEmergencyIds || [];
          return {
            ...h,
            rejectedEmergencyIds: [...rejected.filter((id) => id !== emergencyId), emergencyId],
          };
        }
        return h;
      })
    );

    if (targetEmg) {
      // Find candidate hospitals excluding this rejected one
      const alternativeHospitals = hospitals.filter(
        (h) => h.id !== hospitalId && !(h.rejectedEmergencyIds || []).includes(emergencyId)
      );
      const rankedAlternatives = rankHospitalsForEmergency(
        alternativeHospitals,
        {
          location: targetEmg.location,
          emergencyType: targetEmg.emergencyType,
          requiredDepartment: targetEmg.requiredDepartment,
          severity: targetEmg.severity,
        },
        { sortBy: 'distance', limitToKarnatakaOnly: true }
      );

      const nextHospital = rankedAlternatives[0]?.hospital || hospitals.find((h) => h.id !== hospitalId) || hospitals[0];
      const newRoutes = generateCandidateRoutes(targetEmg.location, nextHospital.location, targetEmg.severity);
      const newPrimary = newRoutes.find((r) => r.recommended) || newRoutes[0];
      const newAlt = newRoutes.find((r) => r.id !== newPrimary.id) || newRoutes[1];

      setEmergencies((prev) =>
        prev.map((e) => {
          if (e.id === emergencyId) {
            const nextTimeline = [
              ...e.timeline,
              {
                status: 'HOSPITAL_RECOMMENDED' as EmergencyStatus,
                timestamp: 'Just now',
                description: `Emergency diverted by ${hosp?.name || 'hospital'} (${reason || 'High acute volume'}). AI auto-rerouted to ${nextHospital.name}.`,
                actor: 'AI Rerouting Engine',
              },
            ];
            const updated: Emergency = {
              ...e,
              status: 'HOSPITAL_RECOMMENDED',
              hospitalId: nextHospital.id,
              routeId: newPrimary.id,
              selectedRoute: newPrimary,
              alternativeRoute: newAlt,
              timeline: nextTimeline,
            };
            if (selectedEmergency?.id === emergencyId) {
              setSelectedEmergency(updated);
            }
            return updated;
          }
          return e;
        })
      );

      addAlert({
        type: 'critical',
        title: '⚠️ Emergency Diverted & Rerouted',
        message: `${hosp?.name || 'Hospital'} diverted emergency. Dispatched AI reroute to ${nextHospital.name}.`,
        emergencyId,
      });
    }
  };

  const cancelEmergency = (emergencyId: string) => {
    setEmergencies((prev) =>
      prev.map((e) => {
        if (e.id === emergencyId) {
          const updated: Emergency = {
            ...e,
            status: 'CANCELLED',
            completedAt: 'Cancelled just now',
            timeline: [
              ...e.timeline,
              {
                status: 'CANCELLED' as EmergencyStatus,
                timestamp: 'Just now',
                description: 'Emergency request cancelled by authorized personnel.',
                actor: currentUser?.name || 'System Operator',
              },
            ],
          };
          if (selectedEmergency?.id === emergencyId) {
            setSelectedEmergency(updated);
          }
          return updated;
        }
        return e;
      })
    );

    // Free assigned ambulance
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (emg?.ambulanceId) {
      setAmbulances((prev) =>
        prev.map((a) => (a.id === emg.ambulanceId ? { ...a, status: 'available', currentEmergencyId: undefined } : a))
      );
    }

    addAlert({
      type: 'ambulance',
      title: 'Emergency Cancelled',
      message: `Emergency ${emergencyId} stood down. Resources returned to standby.`,
      emergencyId,
    });
  };

  const reassignAmbulance = (emergencyId: string, ambulanceId: string) => {
    const targetAmb = ambulances.find((a) => a.id === ambulanceId);
    const emg = emergencies.find((e) => e.id === emergencyId);
    if (!targetAmb || !emg) return;

    // Free old ambulance
    if (emg.ambulanceId) {
      setAmbulances((prev) =>
        prev.map((a) => (a.id === emg.ambulanceId ? { ...a, status: 'available', currentEmergencyId: undefined } : a))
      );
    }

    // Assign new ambulance
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === ambulanceId
          ? {
              ...a,
              status: 'en_route',
              currentEmergencyId: emergencyId,
              currentDestination: emg.locationAddress,
              etaMinutes: Math.ceil(calculateDistanceKm(a.location, emg.location) * 2.2),
            }
          : a
      )
    );

    // Update emergency
    setEmergencies((prev) =>
      prev.map((e) => {
        if (e.id === emergencyId) {
          const updated: Emergency = {
            ...e,
            ambulanceId,
            status: 'AMBULANCE_ASSIGNED',
            timeline: [
              ...e.timeline,
              {
                status: 'AMBULANCE_ASSIGNED' as EmergencyStatus,
                timestamp: 'Just now',
                description: `Ambulance reassigned to ${targetAmb.vehicleNumber} (${targetAmb.driverName}).`,
                actor: currentUser?.name || 'CAD Coordinator',
              },
            ],
          };
          if (selectedEmergency?.id === emergencyId) {
            setSelectedEmergency(updated);
          }
          return updated;
        }
        return e;
      })
    );

    addAlert({
      type: 'ambulance',
      title: 'Ambulance Reassigned',
      message: `Emergency ${emergencyId} handed over to ${targetAmb.vehicleNumber}.`,
      emergencyId,
    });
  };

  const addHospital = (hospitalData: Partial<Hospital>): Hospital => {
    const id = `hosp-ka-custom-${Date.now().toString().slice(-4)}`;
    const newHospital: Hospital = {
      id,
      name: hospitalData.name || 'New Emergency Hospital',
      address: hospitalData.address || 'Karnataka, India',
      location: hospitalData.location || { lat: 12.9716, lng: 77.5946 },
      sector: hospitalData.sector || 'Bengaluru Urban',
      phone: hospitalData.phone || '080-22221111',
      status: hospitalData.status || 'available',
      emergencyAvailable: hospitalData.emergencyAvailable !== undefined ? hospitalData.emergencyAvailable : true,
      icuCapacity: hospitalData.icuCapacity || 20,
      availableIcu: hospitalData.availableIcu || 5,
      generalBedsCapacity: hospitalData.generalBedsCapacity || 250,
      availableGeneralBeds: hospitalData.availableGeneralBeds || 45,
      traumaCenter: !!hospitalData.traumaCenter,
      cardiology: !!hospitalData.cardiology,
      neurology: !!hospitalData.neurology,
      pediatrics: !!hospitalData.pediatrics,
      burnUnit: !!hospitalData.burnUnit,
      ambulanceSupport: hospitalData.ambulanceSupport !== undefined ? hospitalData.ambulanceSupport : true,
      waitTimeMinutes: hospitalData.waitTimeMinutes || 5,
      rating: hospitalData.rating || 4.7,
      lastUpdated: 'Just now',
    };

    setHospitals((prev) => [newHospital, ...prev]);
    addAlert({
      type: 'hospital',
      title: 'Hospital Added to Network',
      message: `${newHospital.name} registered in Karnataka state health CAD registry.`,
    });
    return newHospital;
  };

  const deleteHospital = (hospitalId: string) => {
    setHospitals((prev) => prev.filter((h) => h.id !== hospitalId));
  };

  const resetDemoData = () => {
    setEmergencies(INITIAL_EMERGENCIES);
    setAmbulances(INITIAL_AMBULANCES);
    setHospitals(INITIAL_HOSPITALS);
    setTrafficZones(INITIAL_TRAFFIC_ZONES);
    setAlerts(INITIAL_ALERTS);
    setSelectedEmergency(INITIAL_EMERGENCIES[0]);
    addAlert({
      type: 'ambulance',
      title: 'Demo Environment Reset',
      message: 'Initial fleet and simulated emergency telemetry reloaded.',
    });
  };

  const triggerSimulatedTrafficIncident = () => {
    // Elevate traffic in Zone C/D
    setTrafficZones((prev) =>
      prev.map((zone) =>
        zone.id === 'zone-c'
          ? { ...zone, level: 'severe', averageSpeedKmh: 11, vehicleCount: 1650, lastUpdated: 'Just now' }
          : zone
      )
    );

    // Pick first active emergency and trigger reroute alert
    const active = emergencies.find((e) => e.status !== 'completed');
    if (active && active.alternativeRoute) {
      addAlert({
        type: 'traffic',
        title: '⚠️ Heavy Traffic Incident Detected!',
        message: `Gridlock on primary corridor. Alternative route (${active.alternativeRoute.name}) saves 6 minutes.`,
        emergencyId: active.id,
      });

      setEmergencies((prev) =>
        prev.map((e) =>
          e.id === active.id
            ? {
                ...e,
                alternativeRouteAvailable: true,
                timeDifferenceMinutes: 6,
              }
            : e
        )
      );
    }
  };

  const toggleSimulation = () => setIsSimulating((prev) => !prev);

  return (
    <EmergencyContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: !!currentUser && !!authToken,
        authToken,
        login,
        signup,
        loginWithRolePreset,
        logout,
        userLiveLocation,
        userLocationAddress,
        selectedDistrict,
        selectedTaluk,
        detectLiveLocation,
        setKarnatakaDistrictAndTaluk,
        emergencies,
        ambulances,
        hospitals,
        trafficZones,
        alerts,
        selectedEmergency,
        setSelectedEmergency,
        selectedHospital,
        setSelectedHospital,
        selectedAmbulance,
        setSelectedAmbulance,
        createEmergency,
        updateEmergencyStatus,
        switchEmergencyRoute,
        registerAmbulance,
        updateAmbulanceStatus,
        updateHospitalStatus,
        updateHospitalBeds,
        acceptEmergencyByHospital,
        rejectEmergencyByHospital,
        cancelEmergency,
        reassignAmbulance,
        addHospital,
        deleteHospital,
        dismissAlert,
        addAlert,
        isSimulating,
        toggleSimulation,
        resetDemoData,
        triggerSimulatedTrafficIncident,
        theme,
        setTheme,
        toggleTheme,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
