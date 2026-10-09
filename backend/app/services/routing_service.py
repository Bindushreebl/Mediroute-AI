import math
from typing import List, Dict
from backend.app.ai.route_optimizer import AiRouteOptimizer

def calculate_haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

class RoutingService:
    def __init__(self):
        self.optimizer = AiRouteOptimizer()

    def generate_candidate_routes(self, start_lat: float, start_lng: float, end_lat: float, end_lng: float, severity: str = "high") -> List[Dict]:
        base_dist = calculate_haversine_distance_km(start_lat, start_lng, end_lat, end_lng)

        # Route A: Arterial Corridor
        dist_a = round(base_dist * 1.15, 2)
        time_a = max(round(dist_a / 38.0 * 60.0), 3)

        # Route B: Highway Bypass
        dist_b = round(base_dist * 1.35, 2)
        time_b = max(round(dist_b / 56.0 * 60.0), 3)

        # Route C: Urban Cut
        dist_c = round(base_dist * 1.05, 2)
        time_c = max(round(dist_c / 22.0 * 60.0), 3)

        routes = [
            {
                "id": "route-a",
                "name": "Route A (Arterial)",
                "distance_km": dist_a,
                "duration_minutes": time_a,
                "traffic_level": "moderate",
                "road_condition_score": 8.0,
            },
            {
                "id": "route-b",
                "name": "Route B (Express Highway)",
                "distance_km": dist_b,
                "duration_minutes": time_b,
                "traffic_level": "low",
                "road_condition_score": 9.2,
            },
            {
                "id": "route-c",
                "name": "Route C (Surface Cut)",
                "distance_km": dist_c,
                "duration_minutes": time_c,
                "traffic_level": "high",
                "road_condition_score": 6.5,
            }
        ]

        self.optimizer.select_optimal_route(routes, severity)
        return routes
