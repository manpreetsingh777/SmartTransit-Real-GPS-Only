"""
GPS Anomaly Detection Module for SmartTransit Kanpur
Rule-based monitoring engine detecting impossible speed, teleportation jumps,
stale telemetry, timestamp desync, and degraded GPS accuracy.
Generates an Anomaly Score (0 - 100) and diagnostic explanations.
"""

import time
import math
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional, List
from eta import haversine_distance_km


class GPSAnomalyDetector:
    def __init__(self):
        # Store historical telemetry per bus for derivative checks: {bus_id: last_valid_record}
        self.history: Dict[str, Dict[str, Any]] = {}
        # Track stale count {bus_id: {"lat": float, "lon": float, "first_seen_ts": float}}
        self.stale_tracker: Dict[str, Dict[str, Any]] = {}

    def analyze_telemetry(
        self,
        bus_id: str,
        current_lat: float,
        current_lon: float,
        current_speed_kmh: float,
        reported_accuracy_m: float = 8.0,
        timestamp_str: Optional[str] = None
    ) -> Tuple[int, List[str], Dict[str, Any]]:
        """
        Analyze incoming GPS coordinate update against physical constraints.
        Returns: (anomaly_score, list_of_reasons, diagnostic_data)
        """
        now_ts = time.time()
        reasons = []
        score = 0

        # 1. Parse timestamp and check for clock drift / future timestamps
        ts_drift_sec = 0.0
        if timestamp_str:
            try:
                # Support ISO format
                cleaned_ts = timestamp_str.replace("Z", "+00:00")
                parsed_dt = datetime.fromisoformat(cleaned_ts)
                parsed_ts = parsed_dt.timestamp()
                ts_drift_sec = abs(now_ts - parsed_ts)

                if parsed_ts > now_ts + 120.0:
                    score += 35
                    reasons.append("Future timestamp detected (clock desync > 2 min)")
                elif ts_drift_sec > 3600.0:
                    score += 20
                    reasons.append("Significantly outdated telemetry timestamp")
            except Exception:
                pass

        # 2. Check reported speed threshold (Impossible Speed)
        if current_speed_kmh > 120.0:
            speed_penalty = min(60, int((current_speed_kmh - 80) * 0.4) + 30)
            score += speed_penalty
            reasons.append(f"Impossible city bus speed recorded: {current_speed_kmh:.1f} km/h")
        elif current_speed_kmh < 0.0:
            score += 25
            reasons.append("Negative velocity value received")

        # 3. Check GPS accuracy / HDOP degradation
        if reported_accuracy_m > 45.0:
            acc_penalty = min(30, int((reported_accuracy_m - 40) * 0.5) + 15)
            score += acc_penalty
            reasons.append(f"Severely degraded GPS accuracy ({reported_accuracy_m:.1f}m error circle)")

        # 4. Check historical jump / calculated velocity between consecutive pings
        prev_record = self.history.get(bus_id)
        if prev_record:
            time_delta_sec = max(0.5, now_ts - prev_record.get("ts", now_ts - 1.0))
            dist_km = haversine_distance_km(
                prev_record["lat"], prev_record["lon"],
                current_lat, current_lon
            )

            # Calculated speed across consecutive points
            calc_speed_kmh = (dist_km / (time_delta_sec / 3600.0))

            # Impossible jump (teleportation): > 1.5 km in < 10 seconds
            if dist_km > 1.2 and time_delta_sec < 15.0:
                score += 55
                reasons.append(f"Sudden coordinate teleportation jump ({dist_km * 1000:.0f}m in {time_delta_sec:.1f}s)")
            elif calc_speed_kmh > 130.0 and dist_km > 0.2:
                score += 45
                reasons.append(f"Trajectory displacement implies impossible speed: {calc_speed_kmh:.1f} km/h")

        # 5. Stale GPS Telemetry Check (Zero movement with engine on for long duration)
        stale_info = self.stale_tracker.get(bus_id)
        if stale_info:
            coords_match = (
                abs(stale_info["lat"] - current_lat) < 0.00001 and
                abs(stale_info["lon"] - current_lon) < 0.00001
            )
            if coords_match:
                duration = now_ts - stale_info["first_seen_ts"]
                if duration > 90.0:
                    score += 25
                    reasons.append(f"Stale GPS coordinates unchanged for {int(duration)}s")
            else:
                self.stale_tracker[bus_id] = {
                    "lat": current_lat,
                    "lon": current_lon,
                    "first_seen_ts": now_ts
                }
        else:
            self.stale_tracker[bus_id] = {
                "lat": current_lat,
                "lon": current_lon,
                "first_seen_ts": now_ts
            }

        # Cap score at 100
        final_score = min(100, score)

        # Update history
        self.history[bus_id] = {
            "lat": current_lat,
            "lon": current_lon,
            "speed": current_speed_kmh,
            "accuracy": reported_accuracy_m,
            "ts": now_ts
        }

        diagnostics = {
            "busId": bus_id,
            "anomalyScore": final_score,
            "severity": "CRITICAL" if final_score >= 60 else "WARNING" if final_score >= 25 else "NORMAL",
            "isAnomaly": final_score >= 25,
            "reasons": reasons,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        return final_score, reasons, diagnostics
