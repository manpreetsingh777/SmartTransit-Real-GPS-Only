export type BusStatus = 'LIVE' | 'DELAYED' | 'GPS_ISSUE' | 'OUT_OF_ROUTE' | 'OFFLINE';
export type GPSHealthStatus = 'HEALTHY' | 'WEAK' | 'ANOMALY' | 'UNAVAILABLE';
export type GPSSource = 'SIMULATOR' | 'SMARTPHONE_APP' | 'IOT_DEVICE';
export type ETAConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type OccupancyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface StopETA {
  stopId: string;
  stopName: string;
  passed: boolean;
  distanceKm: number;
  etaMinutes: number;
  etaFormatted: string;
}

export interface LastValidLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  regNumber: string;
  model: string;
  capacity: number;
  passengersCarried: number; // 30 to 44
  occupancy: OccupancyLevel;
  routeId: string;
  routeName?: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  status: BusStatus;
  gpsHealth: GPSHealthStatus;
  gpsSource: GPSSource;
  batteryLevel?: number;
  currentSpeed: number;
  latitude: number;
  longitude: number;
  heading: number;
  lastUpdate: string;
  currentStopIndex: number;
  nextStopId: string;
  etaMinutes: number;
  etaConfidence: ETAConfidence;
  isDeviated: boolean;
  anomalyScore: number;
  delayMinutes?: number;
  gpsAccuracy?: number;
  signalAgeSeconds?: number;
  lastValidLocation?: LastValidLocation;
  stopEtas?: StopETA[];
}

export interface Route {
  id: string;
  routeNumber: string;
  name: string;
  shortName: string;
  color: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  avgDurationMinutes: number;
  corridorRadiusMeters: number;
  stops: string[];
  waypoints: [number, number][];
}

export interface Stop {
  id: string;
  name: string;
  nameHindi: string;
  latitude: number;
  longitude: number;
  landmark: string;
  zone: string;
  shelterType?: string;
  routes?: string[];
}

export interface TimetableSchedule {
  tripId: string;
  departureTime: string;
  busId: string;
  type: string;
}

export interface Timetable {
  routeId: string;
  serviceName: string;
  operatingHours: string;
  morningPickup: string;
  collegeArrival: string;
  eveningDeparture: string;
  peakHeadwayMins: number;
  offPeakHeadwayMins: number;
  fare: {
    minFare: number;
    maxFare: number;
    currency: string;
  };
  schedule: TimetableSchedule[];
}

export interface TripHistory {
  tripId: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeName: string;
  date: string;
  timeSlot: string;
  origin: string;
  destination: string;
  distanceKm: number;
  avgSpeedKmH: number;
  passengersCarried: number;
  delayMinutes: number;
  status: 'Completed' | 'Delayed' | 'Deviation';
  routeCompliance: string;
  fuelEfficiency: string;
  conductor: string;
}

export interface Alert {
  id: string;
  busId: string;
  type: 'GPS_UNAVAILABLE' | 'ROUTE_DEVIATION' | 'GPS_ANOMALY' | 'DELAY' | 'DELAY_REPORTED' | 'EMERGENCY_SOS' | 'INFO';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  data?: Record<string, any>;
}

export interface GPSHealthSummary {
  summary: {
    healthy: number;
    weak: number;
    anomalies: number;
    unavailable: number;
    total: number;
  };
  telemetry: {
    busId: string;
    busNumber: string;
    driverName: string;
    health: GPSHealthStatus;
    accuracyMeters: number;
    signalAgeSec: number;
    lastUpdate: string;
    anomalyScore: number;
    gpsSource: GPSSource;
  }[];
}

export type UserRole = 'passenger' | 'driver' | 'admin';
export type ConnectionState = 'LIVE' | 'CACHED' | 'OFFLINE';

export interface OfflineGPSRecord {
  id: string;
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
  source: GPSSource;
}
