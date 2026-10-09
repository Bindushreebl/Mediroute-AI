import { Hospital, Emergency, HospitalMatchAnalysis, TrafficLevel, EmergencySeverity } from '../types';
import { calculateDistanceKm, estimateTravelTimeMinutes } from './mapService';
import { isCoordinateInsideKarnataka } from './geolocationService';
import { KARNATAKA_CENTER } from './storageService';

/**
 * Computes Route Cost Score according to the project's AI formulation:
 * Route Score = Travel Time + Traffic Penalty + Distance Penalty + Road Risk Penalty (scaled by Severity)
 */
export function calculateAiRouteScore(params: {
  travelTimeMinutes: number;
  distanceKm: number;
  trafficLevel: TrafficLevel;
  roadConditionScore: number; // 1 to 10
  severity: EmergencySeverity;
}): {
  totalScore: number;
  travelTimeComponent: number;
  trafficPenalty: number;
  distancePenalty: number;
  roadRiskPenalty: number;
  severityMultiplier: number;
} {
  const trafficPenalties: Record<TrafficLevel, number> = {
    low: 1.0,
    moderate: 3.5,
    high: 7.5,
    severe: 14.0,
  };

  const severityMultipliers: Record<EmergencySeverity, number> = {
    critical: 1.6,
    high: 1.3,
    medium: 1.0,
    low: 0.8,
  };

  const travelTimeComponent = params.travelTimeMinutes * 1.25;
  const trafficPenalty = trafficPenalties[params.trafficLevel] * 2.2;
  const distancePenalty = params.distanceKm * 0.45;
  const roadRiskPenalty = (10 - params.roadConditionScore) * 1.6;
  const severityMultiplier = severityMultipliers[params.severity];

  const rawScore = (travelTimeComponent + trafficPenalty + distancePenalty + roadRiskPenalty) * severityMultiplier;
  const totalScore = Math.round(rawScore * 10) / 10;

  return {
    totalScore,
    travelTimeComponent: Math.round(travelTimeComponent * 10) / 10,
    trafficPenalty: Math.round(trafficPenalty * 10) / 10,
    distancePenalty: Math.round(distancePenalty * 10) / 10,
    roadRiskPenalty: Math.round(roadRiskPenalty * 10) / 10,
    severityMultiplier,
  };
}

/**
 * Analyzes and ranks hospitals specifically within the State of Karnataka.
 * Filters hospitals against their location coordinates, calculates distances,
 * and displays the nearest hospitals first by default.
 */
export function rankHospitalsForEmergency(
  hospitals: Hospital[],
  emergency: Partial<Emergency>,
  options: { sortBy?: 'distance' | 'suitability'; limitToKarnatakaOnly?: boolean } = { sortBy: 'distance', limitToKarnatakaOnly: true }
): HospitalMatchAnalysis[] {
  // Use emergency location or fallback to Karnataka Center (Vidhana Soudha, Bengaluru)
  const refLocation = emergency.location || KARNATAKA_CENTER;

  // Filter hospitals specifically within the state of Karnataka by coordinate boundary
  let targetHospitals = hospitals;
  if (options.limitToKarnatakaOnly !== false) {
    const karnatakaFiltered = hospitals.filter((h) => isCoordinateInsideKarnataka(h.location));
    // If filtered list is non-empty, use only Karnataka hospitals; otherwise fallback to input
    if (karnatakaFiltered.length > 0) {
      targetHospitals = karnatakaFiltered;
    }
  }

  const analyses: HospitalMatchAnalysis[] = targetHospitals.map((hospital) => {
    // Calculate Haversine distance in km within Karnataka
    const distanceKm = Math.round(calculateDistanceKm(refLocation, hospital.location) * 10) / 10;
    const traffic: TrafficLevel = distanceKm > 15 ? 'moderate' : 'high';
    const etaMinutes = estimateTravelTimeMinutes(distanceKm, traffic);

    let matchScore = 85;
    const recommendationReasons: string[] = [];
    const caveats: string[] = [];
    let facilityMatch = true;

    // 1. Proximity factor (within Karnataka)
    if (distanceKm <= 3.0) {
      matchScore += 12;
      recommendationReasons.push(`Immediate proximity (${distanceKm} km, ~${etaMinutes}m priority siren ETA)`);
    } else if (distanceKm <= 7.0) {
      matchScore += 6;
      recommendationReasons.push(`Close transit corridor (${distanceKm} km, ~${etaMinutes}m ETA)`);
    } else if (distanceKm <= 15.0) {
      matchScore -= 5;
      recommendationReasons.push(`Transit distance: ${distanceKm} km (~${etaMinutes}m ETA)`);
    } else {
      const penalty = Math.min(25, Math.round((distanceKm - 15) * 1.2));
      matchScore -= penalty;
      caveats.push(`Extended distance: ${distanceKm} km across district`);
    }

    // 2. Department Requirement Matching for all 12 Emergency Types
    const rawType = (emergency.emergencyType || '').toLowerCase();
    const reqDept = (emergency.requiredDepartment || rawType).toLowerCase();

    if (rawType.includes('cardiac') || reqDept.includes('cardio')) {
      if (hospital.cardiology) {
        matchScore += 15;
        recommendationReasons.push('Accredited Cardiology & Cath Lab Active 24/7');
      } else {
        matchScore -= 35;
        facilityMatch = false;
        caveats.push('Lacks specialized interventional cardiac cath lab');
      }
    } else if (rawType.includes('stroke') || reqDept.includes('neuro')) {
      if (hospital.neurology) {
        matchScore += 15;
        recommendationReasons.push('Comprehensive Stroke & Acute Neurology Unit');
      } else {
        matchScore -= 35;
        facilityMatch = false;
        caveats.push('No acute neuro-trauma team on immediate standby');
      }
    } else if (rawType.includes('accident') || rawType.includes('trauma') || reqDept.includes('trauma')) {
      if (hospital.traumaCenter) {
        matchScore += 15;
        recommendationReasons.push('Level 1 Trauma Surgical Center with 24/7 OT');
      } else {
        matchScore -= 25;
        facilityMatch = false;
        caveats.push('Secondary general care (no dedicated Level 1 trauma surgery)');
      }
    } else if (rawType.includes('bleeding')) {
      if (hospital.traumaCenter) {
        matchScore += 15;
        recommendationReasons.push('Emergency surgical hemodynamic stabilization & blood bank');
      } else {
        matchScore -= 15;
      }
    } else if (rawType.includes('burn') || reqDept.includes('burn')) {
      if (hospital.burnUnit) {
        matchScore += 20;
        recommendationReasons.push('Equipped with Specialized Burn Care Chamber');
      } else {
        matchScore -= 30;
        caveats.push('General ICU only (lacks dedicated sterile burn care)');
      }
    } else if (rawType.includes('pregnancy') || reqDept.includes('ob-gyn') || reqDept.includes('maternal')) {
      if (hospital.pediatrics) {
        matchScore += 15;
        recommendationReasons.push('OB-GYN and Neonatal Intensive Care Unit (NICU) readiness');
      }
    } else if (rawType.includes('pediatric') || rawType.includes('child')) {
      if (hospital.pediatrics) {
        matchScore += 15;
        recommendationReasons.push('Pediatric emergency department and PICU readiness');
      } else {
        matchScore -= 20;
        caveats.push('Adult facility; limited pediatric critical care');
      }
    } else if (rawType.includes('eye') || reqDept.includes('ophthalmology')) {
      if (hospital.ophthalmology) {
        matchScore += 15;
        recommendationReasons.push('Ophthalmic emergency & microsurgical trauma care');
      } else {
        recommendationReasons.push('General emergency stabilization provided');
      }
    } else if (rawType.includes('breathing') || rawType.includes('respiratory')) {
      matchScore += 10;
      recommendationReasons.push('Pulmonary oxygenation & critical respiratory triage');
    } else if (rawType.includes('poison')) {
      matchScore += 10;
      recommendationReasons.push('Emergency toxicology and intensive gastric decontamination');
    } else {
      recommendationReasons.push('General Emergency Triage and Observation');
    }

    // 3. Emergency Department Availability
    if (!hospital.emergencyAvailable || hospital.status === 'full') {
      matchScore -= 45;
      caveats.push('Emergency room currently under diversion or at full capacity');
    } else if (hospital.status === 'limited') {
      matchScore -= 15;
      caveats.push('Limited triage bed capacity');
    } else {
      recommendationReasons.push('Emergency reception open with immediate bed availability');
    }

    // 4. ICU Availability
    const icuAvailable = hospital.availableIcu > 0;
    if (emergency.severity === 'critical' || emergency.severity === 'high') {
      if (hospital.availableIcu > 4) {
        matchScore += 10;
        recommendationReasons.push(`High ICU availability (${hospital.availableIcu} of ${hospital.icuCapacity} beds free)`);
      } else if (hospital.availableIcu > 0) {
        recommendationReasons.push(`ICU beds available: ${hospital.availableIcu}`);
      } else {
        matchScore -= 30;
        caveats.push('Zero available ICU beds - critical patient transfer risk');
      }
    }

    // Normalize matchScore to 15 - 99%
    const normalizedScore = Math.min(99, Math.max(15, Math.round(matchScore)));

    // Generate concise AI Recommendation Summary
    const deptHighlight = hospital.cardiology
      ? 'Cardiology & Cath Lab'
      : hospital.traumaCenter
      ? 'Trauma Surgical Center'
      : hospital.neurology
      ? 'Neurology & Stroke Unit'
      : 'Emergency Department';

    const aiRecommendationSummary = `Recommended because it is ${distanceKm} km away in Karnataka (~${etaMinutes} min ETA), features ${deptHighlight}, and reports ${hospital.availableIcu} ICU beds free with ${hospital.status === 'available' ? 'open' : hospital.status} emergency triage.`;

    return {
      hospital,
      distanceKm,
      etaMinutes,
      matchScore: normalizedScore,
      facilityMatch,
      icuAvailable,
      recommendationReasons,
      caveats,
      aiRecommendationSummary,
    };
  });

  // Display the nearest ones first as required (sorted by distanceKm ascending)
  if (options.sortBy === 'suitability') {
    return analyses.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Default: sort by distanceKm ascending (nearest first!)
  return analyses.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    return b.matchScore - a.matchScore;
  });
}

/**
 * AI Demand & Peak Hour Predictive Models (Prototype Decision Support)
 */
export interface PredictiveSectorDemand {
  sector: string;
  currentRiskScore: number; // 0-100
  historicalIncidentCount: number;
  recommendedStandbyAmbulances: number;
  riskFactor: 'Elevated' | 'Moderate' | 'Normal';
  predictedPeakWindow: string;
}

export function getPredictiveAnalyticsModel() {
  const sectors: PredictiveSectorDemand[] = [
    {
      sector: 'Sector 4 - Downtown Corridor',
      currentRiskScore: 88,
      historicalIncidentCount: 312,
      recommendedStandbyAmbulances: 4,
      riskFactor: 'Elevated',
      predictedPeakWindow: '17:30 - 20:00 (Rush Hour Confluence)',
    },
    {
      sector: 'Sector 1 - Industrial Park & Transit Hub',
      currentRiskScore: 74,
      historicalIncidentCount: 228,
      recommendedStandbyAmbulances: 3,
      riskFactor: 'Elevated',
      predictedPeakWindow: '07:30 - 09:30 & 16:00 - 18:30',
    },
    {
      sector: 'Sector 7 - West Highway Junction',
      currentRiskScore: 68,
      historicalIncidentCount: 194,
      recommendedStandbyAmbulances: 3,
      riskFactor: 'Moderate',
      predictedPeakWindow: '21:00 - 01:00 (High-Speed Collision Risk)',
    },
    {
      sector: 'Sector 2 - Medical & Tech District',
      currentRiskScore: 42,
      historicalIncidentCount: 140,
      recommendedStandbyAmbulances: 2,
      riskFactor: 'Normal',
      predictedPeakWindow: '12:00 - 14:00',
    },
    {
      sector: 'Sector 5 - Residential North',
      currentRiskScore: 35,
      historicalIncidentCount: 95,
      recommendedStandbyAmbulances: 2,
      riskFactor: 'Normal',
      predictedPeakWindow: '06:00 - 08:30',
    },
  ];

  const hourlyForecast = [
    { hour: '00:00', incidents: 3, predictedRisk: 25 },
    { hour: '02:00', incidents: 2, predictedRisk: 18 },
    { hour: '04:00', incidents: 1, predictedRisk: 12 },
    { hour: '06:00', incidents: 4, predictedRisk: 38 },
    { hour: '08:00', incidents: 9, predictedRisk: 72 },
    { hour: '10:00', incidents: 7, predictedRisk: 58 },
    { hour: '12:00', incidents: 8, predictedRisk: 64 },
    { hour: '14:00', incidents: 6, predictedRisk: 50 },
    { hour: '16:00', incidents: 11, predictedRisk: 86 },
    { hour: '18:00', incidents: 14, predictedRisk: 95 },
    { hour: '20:00', incidents: 10, predictedRisk: 79 },
    { hour: '22:00', incidents: 6, predictedRisk: 48 },
  ];

  return {
    sectors,
    hourlyForecast,
    disclaimer: 'AI estimates are generated using simulated historical emergency distributions and time-series clustering for prototyping purposes.',
  };
}
