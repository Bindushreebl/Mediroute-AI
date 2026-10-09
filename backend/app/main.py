from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uuid

from backend.app.database import engine, Base, get_db
from backend.app.schemas.schemas import (
    EmergencyCreate, EmergencyResponse,
    AmbulanceCreate, AmbulanceResponse,
    HospitalCreate, HospitalResponse,
    RouteCalculationRequest, RouteOptionResponse,
    AiHospitalRecommendationRequest, AiHospitalRecommendationResponse
)
from backend.app.services.routing_service import RoutingService, calculate_haversine_distance_km

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MediRoute AI - Emergency Response & Routing API",
    description="Intelligent route scoring, automated hospital discovery, and centralized ambulance telemetry backend microservice.",
    version="2.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

routing_service = RoutingService()

# In-Memory & DB state endpoints
@app.get("/")
def root():
    return {
        "system": "MediRoute AI",
        "tagline": "The fastest route when every second matters.",
        "status": "online",
        "mode": "DEMO MODE",
        "documentation": "/docs"
    }

# --- Emergency Endpoints ---
@app.get("/api/emergencies")
def get_emergencies():
    return {"message": "List of active emergencies", "count": 6}

@app.post("/api/emergencies")
def create_emergency(payload: EmergencyCreate):
    return {
        "id": f"emg-{uuid.uuid4().hex[:6]}",
        "status": "ambulance_assigned",
        "patient_name": payload.patient_name,
        "emergency_type": payload.emergency_type,
        "severity": payload.severity,
        "location": {"lat": payload.latitude, "lng": payload.longitude},
        "dispatched_ambulance": "MED-901"
    }

@app.get("/api/emergencies/{emergency_id}")
def get_emergency_by_id(emergency_id: str):
    return {"id": emergency_id, "status": "patient_transporting"}

@app.put("/api/emergencies/{emergency_id}/status")
def update_emergency_status(emergency_id: str, new_status: str):
    return {"id": emergency_id, "updated_status": new_status, "success": True}

# --- Ambulance Endpoints ---
@app.get("/api/ambulances")
def get_ambulances():
    return {"active_fleet_count": 10, "available_units": 6}

@app.post("/api/ambulances")
def register_ambulance(payload: AmbulanceCreate):
    return {"id": f"amb-{uuid.uuid4().hex[:4]}", "vehicle_number": payload.vehicle_number, "status": "available"}

# --- Hospital Endpoints ---
@app.get("/api/hospitals")
def get_hospitals():
    return {"monitored_hospitals_count": 6}

# --- Routes Calculation Endpoints ---
@app.post("/api/routes/calculate", response_model=List[RouteOptionResponse])
def calculate_routes(payload: RouteCalculationRequest):
    routes = routing_service.generate_candidate_routes(
        start_lat=payload.start_lat,
        start_lng=payload.start_lng,
        end_lat=payload.end_lat,
        end_lng=payload.end_lng,
        severity=payload.severity
    )
    return [
        RouteOptionResponse(
            id=r["id"],
            name=r["name"],
            distance_km=r["distance_km"],
            duration_minutes=r["duration_minutes"],
            traffic_level=r["traffic_level"],
            route_score=r["route_score"],
            recommended=r["recommended"]
        ) for r in routes
    ]

# --- Traffic Endpoints ---
@app.get("/api/traffic")
def get_traffic():
    return {
        "zones": [
            {"zone": "Zone A", "level": "low", "avg_speed_kmh": 58},
            {"zone": "Zone B", "level": "moderate", "avg_speed_kmh": 39},
            {"zone": "Zone C", "level": "high", "avg_speed_kmh": 22},
            {"zone": "Zone D", "level": "severe", "avg_speed_kmh": 12}
        ]
    }

# --- Analytics Endpoints ---
@app.get("/api/analytics/emergencies")
def get_analytics_emergencies():
    return {"weekly_volume": 187, "target_sla_minutes": 12.0, "current_avg_response_minutes": 11.2}

# --- AI Recommendation Endpoints ---
@app.post("/api/ai/recommend-hospital")
def recommend_hospital(payload: AiHospitalRecommendationRequest):
    return {
        "recommended_hospital": "St. Jude Trauma & Cardiac Institute",
        "match_score_percent": 96,
        "eta_minutes": 7.5,
        "criteria": ["Active Cardiac Cath Lab", "Available ICU Beds: 8", "Proximity 4.8 km"]
    }

@app.post("/api/ai/predict-demand")
def predict_ambulance_demand():
    return {
        "peak_window": "16:30 - 19:30",
        "high_risk_zone": "Sector 4 - Downtown Corridor",
        "suggested_standby_units": 4
    }
