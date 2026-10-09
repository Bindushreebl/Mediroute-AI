import numpy as np
import math

class AiRouteOptimizer:
    """
    Intelligent Route Cost Scoring Engine
    Cost = w_t * Travel_Time + w_c * Traffic_Penalty + w_d * Distance_Penalty + w_r * Road_Risk_Penalty
    """

    def __init__(self, time_weight=1.25, traffic_weight=2.2, distance_weight=0.45, risk_weight=1.6):
        self.w_t = time_weight
        self.w_c = traffic_weight
        self.w_d = distance_weight
        self.w_r = risk_weight

        self.traffic_penalties = {
            "low": 1.0,
            "moderate": 3.5,
            "high": 7.5,
            "severe": 14.0
        }

        self.severity_multipliers = {
            "critical": 1.6,
            "high": 1.3,
            "medium": 1.0,
            "low": 0.8
        }

    def compute_route_score(self, travel_time_min: float, distance_km: float, traffic_level: str, road_quality: float, severity: str = "high") -> float:
        traffic_pen = self.traffic_penalties.get(traffic_level.lower(), 3.5)
        severity_mult = self.severity_multipliers.get(severity.lower(), 1.0)
        road_risk_pen = max(0, 10.0 - road_quality)

        raw_score = (
            (self.w_t * travel_time_min) +
            (self.w_c * traffic_pen) +
            (self.w_d * distance_km) +
            (self.w_r * road_risk_pen)
        ) * severity_mult

        return round(float(raw_score), 2)

    def select_optimal_route(self, routes: list, severity: str = "high") -> dict:
        best_route = None
        min_score = float("inf")

        for r in routes:
            score = self.compute_route_score(
                travel_time_min=r["duration_minutes"],
                distance_km=r["distance_km"],
                traffic_level=r["traffic_level"],
                road_quality=r.get("road_condition_score", 8.0),
                severity=severity
            )
            r["route_score"] = score
            if score < min_score:
                min_score = score
                best_route = r

        for r in routes:
            r["recommended"] = (r == best_route)

        return best_route
