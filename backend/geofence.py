"""
Route Geofencing & Corridor Monitoring Module
Calculates cross-track distance from bus GPS position to designated route corridors.
Detects route deviations with debounce logic to prevent false alarms.
"""

import math
from typing import List, Tuple, Dict, Any


def point_to_segment_distance_meters(
    px: float, py: float,
    ax: float, ay: float,
    bx: float, by: float
) -> float:
    """
    Calculate minimum distance in meters from point P(px, py) to line segment AB[(ax, ay), (bx, by)].
    Coordinates are in degrees (lat/lng converted with local approximation).
    """
    # 1 deg lat approx 111,139 meters; 1 deg lon approx 111,139 * cos(lat)
    lat_mid_rad = math.radians((ax + bx + px) / 3.0)
    meters_per_deg_lat = 111139.0
    meters_per_deg_lon = 111139.0 * math.cos(lat_mid_rad)

    # Convert coordinates to local Cartesian plane in meters relative to A
    p_x = (py - ay) * meters_per_deg_lon
    p_y = (px - ax) * meters_per_deg_lat

    b_x = (by - ay) * meters_per_deg_lon
    b_y = (bx - ax) * meters_per_deg_lat

    seg_len_sq = b_x * b_x + b_y * b_y

    if seg_len_sq == 0.0:
        # A and B are the exact same point
        return math.sqrt(p_x * p_x + p_y * p_y)

    # Project point P onto line segment AB, computing parameterized t
    t = max(0.0, min(1.0, (p_x * b_x + p_y * b_y) / seg_len_sq))

    # Nearest point on segment
    proj_x = t * b_x
    proj_y = t * b_y

    dx = p_x - proj_x
    dy = p_y - proj_y

    return math.sqrt(dx * dx + dy * dy)


def calculate_min_distance_to_route(
    lat: float,
    lon: float,
    waypoints: List[List[float]]
) -> float:
    """
    Calculate the minimum cross-track distance in meters from a GPS coordinate to the route polyline.
    """
    if not waypoints or len(waypoints) < 2:
        return 0.0

    min_dist = float("inf")

    for i in range(len(waypoints) - 1):
        ax, ay = waypoints[i][0], waypoints[i][1]
        bx, by = waypoints[i + 1][0], waypoints[i + 1][1]

        dist = point_to_segment_distance_meters(lat, lon, ax, ay, bx, by)
        if dist < min_dist:
            min_dist = dist

    return min_dist if min_dist != float("inf") else 0.0


class GeofenceEvaluator:
    """
    Maintains deviation states and debounces GPS jitter to avoid false positives.
    """
    def __init__(self, default_corridor_meters: float = 180.0, consecutive_pings_threshold: int = 2):
        self.default_corridor_meters = default_corridor_meters
        self.consecutive_pings_threshold = consecutive_pings_threshold
        # Tracks {bus_id: consecutive_out_of_route_count}
        self.deviation_counters: Dict[str, int] = {}

    def evaluate(
        self,
        bus_id: str,
        lat: float,
        lon: float,
        waypoints: List[List[float]],
        corridor_radius_meters: float = None
    ) -> Tuple[bool, float, Dict[str, Any]]:
        """
        Evaluate if a bus is deviated outside its permitted corridor.
        Returns: (is_deviated, min_distance_meters, details_dict)
        """
        threshold = corridor_radius_meters or self.default_corridor_meters
        dist_meters = calculate_min_distance_to_route(lat, lon, waypoints)

        count = self.deviation_counters.get(bus_id, 0)

        if dist_meters > threshold:
            count += 1
            self.deviation_counters[bus_id] = count
        else:
            # Recovered inside corridor
            self.deviation_counters[bus_id] = 0
            count = 0

        is_deviated = count >= self.consecutive_pings_threshold

        details = {
            "busId": bus_id,
            "distanceFromRouteMeters": round(dist_meters, 1),
            "thresholdMeters": threshold,
            "consecutiveDeviations": count,
            "status": "OUT_OF_ROUTE" if is_deviated else "ON_ROUTE"
        }

        return is_deviated, dist_meters, details
