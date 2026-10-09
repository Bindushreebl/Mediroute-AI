from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class AmbulanceBase(BaseModel):
    vehicle_number: str
    driver_name: str
    phone: str
    type: str = "ALS"
    status: str = "available"
    latitude: float
    longitude: float
    sector: Optional[str] = "Central Sector"

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceResponse(AmbulanceBase):
    id: str
    fuel_percent: int
    current_emergency_id: Optional[str] = None
    class Config:
        from_attributes = True

class HospitalBase(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    emergency_available: bool = True
    icu_capacity: int = 20
    available_icu: int = 5
    trauma_center: bool = False
    cardiology: bool = False
    neurology: bool = False
    status: str = "available"

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    id: str
    wait_time_minutes: int
    class Config:
        from_attributes = True

class EmergencyBase(BaseModel):
    patient_name: str
    contact_phone: Optional[str] = None
    emergency_type: str
    severity: str = "high"
    latitude: float
    longitude: float
    location_address: str
    required_department: Optional[str] = "General Emergency"
    patient_count: int = 1
    notes: Optional[str] = None

class EmergencyCreate(EmergencyBase):
    pass

class EmergencyResponse(EmergencyBase):
    id: str
    status: str
    ambulance_id: Optional[str] = None
    hospital_id: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class RouteCalculationRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    severity: str = "high"

class RouteOptionResponse(BaseModel):
    id: str
    name: str
    distance_km: float
    duration_minutes: float
    traffic_level: str
    route_score: float
    recommended: bool

class AiHospitalRecommendationRequest(BaseModel):
    emergency_type: str
    patient_lat: float
    patient_lng: float
    severity: str = "high"

class AiHospitalRecommendationResponse(BaseModel):
    hospital_id: str
    hospital_name: str
    distance_km: float
    eta_minutes: float
    match_score_percent: int
    recommended: bool
    reasons: List[str]
