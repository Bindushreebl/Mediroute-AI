# 🚑 MediRoute AI: Smart Ambulance Route & Emergency Response System

> **“The fastest route when every second matters.”**
>
> **Final-Year Engineering Decision Support System**
> Combining Artificial Intelligence, Multi-Criteria Route Cost Optimization, Geospatial GIS Mapping, Real-Time Fleet Telemetry, and Dynamic Hospital Capability Triage.

---

## 📌 Executive Summary & Safety Notice

**Important Safety Disclaimer**: MediRoute AI is an engineering software prototype and operational decision-support tool. Emergency routing estimates, traffic simulations, and clinical facility bed availability are generated for algorithmic evaluation. In a real-world emergency, users and first responders must always contact authorized emergency services (such as 911 or local emergency dispatch numbers).

---

## 1. 🚨 Problem Statement

During acute medical emergencies (cardiac arrests, hemorrhagic traumas, acute strokes), patient survivability drops exponentially with each elapsed minute. Traditional navigation and dispatch systems suffer from several critical bottlenecks:

1. **Traffic Congestion Blindness**: Standard navigation algorithms optimize for passenger comfort or nominal shortest paths rather than emergency vehicle priority lanes with dynamic congestion penalties.
2. **Clinical Facility Mismatch**: Patients are frequently transported to the closest facility, only to find the emergency room on diversion, the ICU at 100% capacity, or lack of critical clinical units (such as a cardiac cath lab or Level 1 trauma surgery).
3. **Delayed Dispatch & Multi-Stage Blindspots**: Lack of a centralized Computer-Aided Dispatch (CAD) dashboard results in poor communication between call takers, paramedics, and receiving emergency departments.
4. **Static Route Failures**: Unforeseen road incidents during transit cause delays without proactive alternative corridor rerouting.

---

## 2. 💡 Proposed Solution

MediRoute AI introduces an integrated **Computer-Aided Dispatch (CAD) & Route Decision-Support System** that unifies:
* **Automated Emergency Intake**: Structured triage data collection with severity classification (Critical, High, Medium, Low).
* **AI Proximity Dispatch**: Automatic assignment of the nearest capable ambulance (ALS, BLS, Neonatal).
* **Smart Hospital Capability Matcher**: Multi-variable ranking balancing spatial proximity, ED status, available ICU bed ratios, and clinical specialties.
* **Intelligent Route Cost Optimization**: Multi-path candidate evaluation (Route A, Route B, Route C) using a weighted penalty cost surface.
* **Proactive Alternative Rerouting**: Dynamic traffic alerts offering bypass routes when congestion spikes.
* **Comprehensive Incident Audits**: Automated generation of ISO-compliant incident audit reports with print-ready PDF export.

---

## 3. 🧠 Mathematical Formulation & AI Route Optimization

Rather than relying on basic Euclidean distance or simple shortest paths, MediRoute AI evaluates candidate corridors using a **multi-factor cost surface optimization**:

$$\text{Route Score} = w_t \cdot T_k + w_c \cdot P_{\text{traffic}}(k) + w_d \cdot D_k + w_r \cdot (10 - Q_{\text{road}}(k)) \times S_{\text{severity}}$$

Where:
* $T_k$: Estimated travel time (minutes), adjusted for siren priority speeds.
* $P_{\text{traffic}}(k)$: Non-linear congestion penalty based on real-time vehicle density:
  * Low $\rightarrow 1.0$
  * Moderate $\rightarrow 3.5$
  * High $\rightarrow 7.5$
  * Severe $\rightarrow 14.0$
* $D_k$: Total spatial path length (km) to balance fuel/battery efficiency and detour extremity.
* $Q_{\text{road}}(k)$: Road quality and surface rating index (1 to 10 scale).
* $S_{\text{severity}}$: Severity scaling multiplier:
  * Critical: $1.6 \times$ (forcefully penalizes delay and traffic choke points)
  * High: $1.3 \times$
  * Medium: $1.0 \times$
  * Low: $0.8 \times$

The candidate path minimizing the total cost score is flagged as the **AI Recommended Route**.

---

## 4. 🏥 Hospital Suitability Scoring Algorithm

The matching score (0% to 100%) between an incoming emergency and candidate hospitals considers:
1. **Clinical Specialization Matching**:
   * *Cardiac*: Requires active 24/7 Cardiology & Cath Lab.
   * *Stroke*: Requires Comprehensive Stroke & Neurology Unit.
   * *Trauma*: Requires Level 1 / Level 2 Trauma Surgical Suite.
   * *Burns*: Dedicated Burn Chamber capability.
   * *Pregnancy*: OB-GYN & Neonatal Intensive Care Unit (NICU).
2. **Proximity & Travel Time**: Decrements score for facilities exceeding 10 km.
3. **Emergency Department Load & Diversion**: Facilities at 100% capacity are penalized to prevent offload delays.
4. **ICU Bed Availability**: Facilities with $\ge 3$ available ICU beds receive priority rating.

---

## 5. 🏗️ System Architecture

```text
                               ┌──────────────────────────────────────────────┐
                               │             MediRoute AI Web UI              │
                               │  React 19 + TypeScript + Tailwind CSS        │
                               │  Leaflet GIS Map + Recharts CAD Analytics    │
                               └──────────────────────┬───────────────────────┘
                                                      │ REST APIs & Telemetry
                                                      ▼
                       ┌──────────────────────────────────────────────────────────────┐
                       │                   API & Optimization Layer                   │
                       │           Node / Express & Python FastAPI Gateway            │
                       └──────────────┬───────────────────────────────┬───────────────┘
                                      │                               │
                                      ▼                               ▼
       ┌──────────────────────────────────────────────┐ ┌─────────────────────────────┐
       │             AI Decision Engines              │ │     Data Persistence        │
       │  • Multi-Criteria Cost Surface Optimizer     │ │  • SQLite Database          │
       │  • Hospital Specialization Matcher           │ │  • SQLAlchemy ORM           │
       │  • Time-Series Demand & Hotspot Forecaster   │ │  • GeoJSON Traffic Bounds   │
       └──────────────────────────────────────────────┘ └─────────────────────────────┘
```

---

## 6. 🛠️ Tech Stack

### Frontend:
* **React 19** & **TypeScript**
* **Tailwind CSS v4** (Modern utility styling, dark tactical EOC theme)
* **Leaflet 1.9** & **OpenStreetMap** (No vendor API lock-in, customizable dark tiles, custom pulse markers)
* **Recharts** (Incident volume bars, SLA response line chart, donut distribution, peak hour area curves)
* **Lucide React** (Vector iconography)

### Backend:
* **Python 3.11+ / FastAPI**
* **SQLAlchemy ORM** & **SQLite**
* **Pydantic v2** validation schemas
* **NumPy** & **Pandas** for historical incident clustering

---

## 7. 🚀 Installation & Running

### Prerequisites
* **Node.js**: v18+ or v20+
* **Python**: v3.10+ (for FastAPI microservice)
* **npm** or **yarn**

### 1. Running the Web Application
```bash
# Clone the repository
git clone https://github.com/your-username/mediroute-ai.git
cd mediroute-ai

# Install frontend dependencies
npm install

# Start the development server (runs on port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Running the Python FastAPI Backend (Optional / Standalone)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Launch FastAPI with auto-reload
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 8. 🎮 Demo Mode & Demonstration Flow

MediRoute AI operates 100% standalone in **DEMO MODE** without requiring paid external API subscriptions:
1. **Explore the Landing Page**: Review project rationale, system KPIs, and mathematical models.
2. **Command Center Dashboard**: Observe live KPI counters (Active Emergencies, Fleet Units, Monitored Hospitals).
3. **Simulate Incident Creation**:
   * Click **Create Emergency**.
   * Choose severity (*Critical*), medical category (*Cardiac* or *Accident*), and an incident address.
   * Watch the AI assign the nearest available ALS unit, recommend the optimal hospital with match percentage, and calculate Routes A, B, and C.
4. **Interactive 9-Stage Timeline**:
   * Advance from *Created* $\rightarrow$ *Assigned* $\rightarrow$ *Dispatched* $\rightarrow$ *Reached Patient* $\rightarrow$ *Transporting* $\rightarrow$ *Completed*.
5. **Simulate Traffic Gridlock Spike**:
   * Click **Simulate Traffic Spike** in the header.
   * Observe the dynamic **Traffic Alert** banner appear: *“Alternative Route Available: Saves 6 min!”*
   * Click **Switch Route** to see real-time dynamic rerouting.
6. **Generate Incident Report**:
   * Click **Generate Audit Report** to view and print/export the CAD audit document.

---

## 9. 🔮 Future Enhancements

* **V2X Traffic Light Preemption**: Direct integration with urban traffic controller systems (NTCIP protocol) to automatically hold green lights for ambulances along the active corridor.
* **Drone First-Responder (DFR) Relay**: Automatic dispatch of automated external defibrillator (AED) delivery drones ahead of ground ambulances.
* **Hospital Telemedicine Video Stream**: Real-time ultrasound and 12-lead ECG video transmission directly into receiving trauma bays.

---

## 10. 📄 License

MediRoute AI is developed under the Apache 2.0 License as an open-source academic and engineering project.
