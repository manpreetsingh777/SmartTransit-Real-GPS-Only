import asyncio
import json
import math
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BACKEND_DIR = Path(__file__).resolve().parent
BASE_DIR = BACKEND_DIR.parent
DATA_DIR = BASE_DIR / "data"


def load_json(name: str):
    path = DATA_DIR / name
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


routes_data = load_json("routes.json")
stops_data = load_json("stops.json")
timetables_data = load_json("timetables.json")
history_data = load_json("history.json")
routes_map = {r["id"]: r for r in routes_data}
stops_map = {s["id"]: s for s in stops_data}

# IMPORTANT: this dictionary starts EMPTY. There is no simulator and no fake live fleet.
active_vehicles: Dict[str, Dict[str, Any]] = {}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_reg(value: str) -> str:
    return "".join(value.upper().split())


def haversine_km(a_lat, a_lon, b_lat, b_lon):
    r = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp = math.radians(b_lat - a_lat)
    dl = math.radians(b_lon - a_lon)
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(x), math.sqrt(1 - x))


def calculate_eta(vehicle: Dict[str, Any]):
    route = routes_map.get(vehicle["routeId"])
    if not route:
        return None, None, None

    candidates = []
    for stop_id in route.get("stops", []):
        stop = stops_map.get(stop_id)
        if not stop:
            continue
        d = haversine_km(vehicle["latitude"], vehicle["longitude"], stop["latitude"], stop["longitude"])
        candidates.append((d, stop))

    if not candidates:
        return None, None, None

    distance, stop = min(candidates, key=lambda x: x[0])
    speed = float(vehicle.get("currentSpeed") or 0)
    if speed < 3:
        eta = None
    else:
        eta = max(1, round((distance / speed) * 60))
    return stop, distance, eta


def enrich_vehicle(vehicle: Dict[str, Any]) -> Dict[str, Any]:
    stop, distance, eta = calculate_eta(vehicle)
    if stop:
        vehicle["nextStopId"] = stop["id"]
        vehicle["nextStopName"] = stop["name"]
        vehicle["distanceToNextStopKm"] = round(distance, 3)
        vehicle["etaMinutes"] = eta
        vehicle["etaFormatted"] = "Waiting for movement" if eta is None else f"{eta} min"
    vehicle["signalAgeSeconds"] = max(0, int((datetime.now(timezone.utc) - datetime.fromisoformat(vehicle["lastUpdate"].replace("Z", "+00:00"))).total_seconds()))
    vehicle["status"] = "LIVE" if vehicle.get("hasRealGPS") and vehicle["signalAgeSeconds"] <= 15 else "OFFLINE"
    vehicle["gpsHealth"] = "HEALTHY" if vehicle.get("hasRealGPS") and vehicle["signalAgeSeconds"] <= 15 else "UNAVAILABLE"
    return vehicle


class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, payload: dict):
        dead = []
        for ws in self.connections:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


app = FastAPI(
    title="YatraSetu Real GPS API",
    description="Real smartphone GPS tracking only — no simulated live vehicles.",
    version="3.0.0",
    lifespan=None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterVehicleRequest(BaseModel):
    regNumber: str
    routeId: Optional[str] = None


class GPSUpdateRequest(BaseModel):
    busId: str
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    accuracy: Optional[float] = 0.0
    source: Optional[str] = "SMARTPHONE_APP"
    timestamp: Optional[str] = None


class DelayReportRequest(BaseModel):
    busId: str
    estimatedDelayMins: int
    reason: str
    conductorName: str


@app.post("/vehicles/register")
async def register_vehicle(req: RegisterVehicleRequest):
    reg = normalize_reg(req.regNumber)
    if len(reg) < 5:
        raise HTTPException(status_code=400, detail="Enter a valid vehicle registration number")

    route_id = req.routeId or (routes_data[0]["id"] if routes_data else None)
    if route_id not in routes_map:
        raise HTTPException(status_code=400, detail="Invalid route")

    # Reuse an existing live registration, otherwise create a new real-GPS session.
    existing = next((v for v in active_vehicles.values() if v["regNumberNormalized"] == reg), None)
    if existing:
        existing["routeId"] = route_id
        existing["routeName"] = routes_map[route_id]["name"]
        return enrich_vehicle(existing)

    vehicle_id = str(uuid.uuid4())
    vehicle = {
        "id": vehicle_id,
        "busNumber": reg,
        "regNumber": reg,
        "regNumberNormalized": reg,
        "model": "Real GPS Vehicle",
        "capacity": 0,
        "passengersCarried": 0,
        "occupancy": "LOW",
        "routeId": route_id,
        "routeName": routes_map[route_id]["name"],
        "driverId": "PHONE-GPS",
        "driverName": "Live GPS Driver",
        "driverPhone": "",
        "status": "OFFLINE",
        "gpsHealth": "UNAVAILABLE",
        "gpsSource": "SMARTPHONE_APP",
        "currentSpeed": 0.0,
        "latitude": 0.0,
        "longitude": 0.0,
        "heading": 0.0,
        "lastUpdate": now_iso(),
        "nextStopId": None,
        "nextStopName": None,
        "etaMinutes": None,
        "etaFormatted": "Waiting for GPS",
        "etaConfidence": "LOW",
        "isDeviated": False,
        "anomalyScore": 0,
        "gpsAccuracy": None,
        "signalAgeSeconds": 999999,
        "hasRealGPS": False,
    }
    active_vehicles[vehicle_id] = vehicle
    return enrich_vehicle(vehicle)


@app.get("/vehicles/lookup")
async def lookup_vehicle(reg_number: str = Query(..., min_length=3)):
    reg = normalize_reg(reg_number)
    vehicle = next((v for v in active_vehicles.values() if v["regNumberNormalized"] == reg and v.get("hasRealGPS")), None)
    if not vehicle:
        raise HTTPException(status_code=404, detail="No live GPS source is currently connected for this vehicle")
    return enrich_vehicle(vehicle)


@app.get("/buses")
async def get_buses():
    # Only vehicles that have actually sent a real GPS position are public.
    return [enrich_vehicle(v) for v in active_vehicles.values() if v.get("hasRealGPS")]


@app.get("/routes")
async def get_routes():
    return routes_data


@app.get("/routes/{route_id}")
async def get_route(route_id: str):
    route = routes_map.get(route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@app.get("/stops")
async def get_stops():
    return stops_data


@app.get("/timetables")
async def get_timetables():
    return timetables_data


@app.get("/history")
async def get_history(busId: Optional[str] = None, routeId: Optional[str] = None, limit: int = 50):
    # Historical demo records are not live vehicle telemetry.
    return []


@app.get("/alerts")
async def get_alerts():
    return []


@app.get("/gps/health")
async def gps_health():
    live = [enrich_vehicle(v) for v in active_vehicles.values() if v.get("hasRealGPS")]
    return {
        "summary": {
            "healthy": sum(v["gpsHealth"] == "HEALTHY" for v in live),
            "weak": 0,
            "anomalies": 0,
            "unavailable": 0,
            "total": len(live),
        },
        "telemetry": [
            {"busId": v["id"], "busNumber": v["busNumber"], "driverName": v["driverName"],
             "health": v["gpsHealth"], "accuracyMeters": v.get("gpsAccuracy"),
             "signalAgeSec": v["signalAgeSeconds"], "lastUpdate": v["lastUpdate"],
             "anomalyScore": 0, "gpsSource": "SMARTPHONE_APP"}
            for v in live
        ]
    }


@app.post("/gps/update")
async def update_gps(req: GPSUpdateRequest):
    vehicle = active_vehicles.get(req.busId)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle GPS session not registered")

    vehicle["latitude"] = req.latitude
    vehicle["longitude"] = req.longitude
    vehicle["currentSpeed"] = round(max(0.0, req.speed or 0.0), 1)
    vehicle["heading"] = round(req.heading or 0.0, 1)
    vehicle["gpsAccuracy"] = round(req.accuracy, 1) if req.accuracy is not None else None
    vehicle["lastUpdate"] = req.timestamp or now_iso()
    vehicle["gpsSource"] = "SMARTPHONE_APP"
    vehicle["hasRealGPS"] = True
    enrich_vehicle(vehicle)

    await manager.broadcast({
        "type": "VEHICLE_UPDATE",
        "timestamp": now_iso(),
        "bus": dict(vehicle)
    })
    return {"success": True, "vehicle": vehicle}


@app.post("/driver/delay-report")
async def delay_report(req: DelayReportRequest):
    vehicle = active_vehicles.get(req.busId)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not registered")
    vehicle["delayMinutes"] = req.estimatedDelayMins
    return {"success": True, "vehicle": vehicle}


@app.post("/alerts/sos")
async def sos(payload: Dict[str, Any]):
    return {"status": "SUCCESS", "message": "SOS received", "data": payload}


@app.post("/gps/batch-sync")
async def batch_sync(payload: Dict[str, Any]):
    records = payload.get("records", [])
    synced = 0
    for r in records:
        try:
            await update_gps(GPSUpdateRequest(**r))
            synced += 1
        except Exception:
            pass
    return {"success": True, "recordsSynced": synced}


@app.websocket("/ws/live")
async def websocket_live(ws: WebSocket):
    await manager.connect(ws)
    try:
        # Deliberately send no fake fleet snapshot. Only real vehicle updates are broadcast.
        await ws.send_json({"type": "READY", "vehicles": []})
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield



@app.get("/")
async def root():
    return {
        "project": "YatraSetu",
        "mode": "REAL_GPS_ONLY",
        "status": "OPERATIONAL",
        "activeRealVehicles": sum(v.get("hasRealGPS", False) for v in active_vehicles.values()),
        "docs": "/docs",
        "websocket": "/ws/live",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
