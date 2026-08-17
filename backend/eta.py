"""
ETA Calculation Module for SmartTransit Kanpur
Calculates remaining travel time, distance, and confidence rating
along route polylines and stop sequences.
"""

import math
from typing import List, Tuple, Dict, Any, Optional

EARTH_RADIUS_KM = 6371.0


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in kilometers."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return EARTH_RADIUS_KM * c


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters."""
    return haversine_distance_km(lat1, lon1, lat2, lon2) * 1000.0


def calculate_remaining_route_distance_km(
    current_lat: float,
    current_lon: float,
    waypoints: List[List[float]],
    current_waypoint_idx: int = 0
) -> float:
    """
    Calculate the remaining path distance along polyline waypoints.
    """
    if not waypoints or len(waypoints) < 2:
        return 0.0

    # Ensure index within bounds
    idx = max(0, min(current_waypoint_idx, len(waypoints) - 1))
    
    # Distance from current position to next waypoint
    if idx < len(waypoints):
        next_wp = waypoints[idx]
        total_km = haversine_distance_km(current_lat, current_lon, next_wp[0], next_wp[1])
    else:
        total_km = 0.0

    # Plus distance along subsequent waypoints
    for i in range(idx, len(waypoints) - 1):
        wp1 = waypoints[i]
        wp2 = waypoints[i + 1]
        total_km += haversine_distance_km(wp1[0], wp1[1], wp2[0], wp2[1])

    return total_km


def calculate_stop_etas(
    current_lat: float,
    current_lon: float,
    current_speed_kmh: float,
    stops: List[Dict[str, Any]],
    current_stop_idx: int,
    is_gps_valid: bool = True,
    is_deviated: bool = False
) -> Tuple[int, str, List[Dict[str, Any]]]:
    """
    Calculate ETA to next stop and all remaining downstream stops.
    Returns: (next_stop_eta_minutes, confidence_level, list_of_stop_etas)
    """
    # Use baseline average urban speed (28 km/h for Kanpur) if bus is temporarily stopped at traffic light
    effective_speed = max(18.0, current_speed_kmh if current_speed_kmh > 5.0 else 24.0)

    # Determine confidence level
    if not is_gps_valid:
        confidence = "LOW"
    elif is_deviated:
        confidence = "LOW"
    elif current_speed_kmh >= 15.0:
        confidence = "HIGH"
    else:
        confidence = "MEDIUM"

    stop_etas = []
    accumulated_distance_km = 0.0
    prev_lat = current_lat
    prev_lon = current_lon

    next_stop_eta_mins = 5

    for i, stop in enumerate(stops):
        if i < current_stop_idx:
            # Already passed stop
            stop_etas.append({
                "stopId": stop.get("id"),
                "stopName": stop.get("name"),
                "passed": True,
                "distanceKm": 0.0,
                "etaMinutes": 0,
                "etaFormatted": "Departed"
            })
            continue

        stop_lat = stop.get("latitude", 0.0)
        stop_lon = stop.get("longitude", 0.0)

        dist_segment = haversine_distance_km(prev_lat, prev_lon, stop_lat, stop_lon)
        accumulated_distance_km += dist_segment
        prev_lat = stop_lat
        prev_lon = stop_lon

        # ETA in hours -> minutes + 30s per intermediate stop dwell time
        dwell_time_mins = 0.5 * (i - current_stop_idx)
        eta_mins = max(1, round((accumulated_distance_km / effective_speed) * 60.0 + dwell_time_mins))

        if i == current_stop_idx:
            next_stop_eta_mins = eta_mins

        stop_etas.append({
            "stopId": stop.get("id"),
            "stopName": stop.get("name"),
            "passed": False,
            "distanceKm": round(accumulated_distance_km, 2),
            "etaMinutes": eta_mins,
            "etaFormatted": f"{eta_mins} min" if eta_mins > 0 else "< 1 min"
        })

    return next_stop_eta_mins, confidence, stop_etas
