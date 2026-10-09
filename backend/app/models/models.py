from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="dispatcher") # admin, dispatcher, driver, viewer
    created_at = Column(DateTime, default=datetime.utcnow)

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(String, primary_key=True, index=True)
    vehicle_number = Column(String, unique=True, index=True, nullable=False)
    driver_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    type = Column(String, default="ALS") # ALS, BLS, Neonatal, Patient Transport
    status = Column(String, default="available") # available, en_route, at_emergency, transporting_patient, at_hospital, offline
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sector = Column(String, default="Downtown Central")
    fuel_percent = Column(Integer, default=100)
    current_emergency_id = Column(String, nullable=True)

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    emergency_available = Column(Boolean, default=True)
    icu_capacity = Column(Integer, default=20)
    available_icu = Column(Integer, default=5)
    trauma_center = Column(Boolean, default=False)
    cardiology = Column(Boolean, default=False)
    neurology = Column(Boolean, default=False)
    status = Column(String, default="available") # available, limited, full
    wait_time_minutes = Column(Integer, default=5)

class Emergency(Base):
    __tablename__ = "emergencies"

    id = Column(String, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    contact_phone = Column(String, nullable=True)
    emergency_type = Column(String, nullable=False)
    severity = Column(String, default="high") # critical, high, medium, low
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_address = Column(String, nullable=False)
    status = Column(String, default="created")
    ambulance_id = Column(String, ForeignKey("ambulances.id"), nullable=True)
    hospital_id = Column(String, ForeignKey("hospitals.id"), nullable=True)
    required_department = Column(String, default="General Emergency")
    patient_count = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class Route(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, index=True)
    emergency_id = Column(String, ForeignKey("emergencies.id"), nullable=False)
    name = Column(String, nullable=False)
    distance = Column(Float, nullable=False) # km
    estimated_time = Column(Float, nullable=False) # minutes
    traffic_level = Column(String, default="low") # low, moderate, high, severe
    route_score = Column(Float, nullable=False)
    waypoints_json = Column(Text, nullable=True)

class TrafficRecord(Base):
    __tablename__ = "traffic_records"

    id = Column(String, primary_key=True, index=True)
    location = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    traffic_level = Column(String, default="low")
    vehicle_count = Column(Integer, default=200)
    average_speed = Column(Float, default=45.0) # km/h
