import { create } from 'zustand';
import { Bus, Route, Stop, Timetable, TripHistory, Alert, UserRole, ConnectionState, OfflineGPSRecord } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';

interface DriverSession {
  driverId: string;
  driverName: string;
  conductorPhone: string;
  busId: string;
  busNumber: string;
  isTripActive: boolean;
  speed: number;
  latitude: number;
  longitude: number;
  heading: number;
  isSimulatedOffline: boolean;
  pendingRecordsCount: number;
}

interface TransitStore {
  // Core datasets
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  timetables: Timetable[];
  history: TripHistory[];
  alerts: Alert[];
  favorites: string[];

  // Selection & UI State
  selectedBusId: string | null;
  selectedRouteId: string | null;
  selectedStopId: string | null;
  currentRole: UserRole;
  connectionState: ConnectionState;
  searchQuery: string;
  notificationDrawerOpen: boolean;
  historyModalOpen: boolean;
  demoModalOpen: boolean;

  // Driver App State
  driverSession: DriverSession;

  // Demo / Simulation State
  activeScenario: string;
  speedMultiplier: number;
  isPaused: boolean;

  // Actions
  init: () => Promise<void>;
  setCurrentRole: (role: UserRole) => void;
  setSelectedBusId: (id: string | null) => void;
  setSelectedRouteId: (id: string | null) => void;
  setSelectedStopId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setHistoryModalOpen: (open: boolean) => void;
  setDemoModalOpen: (open: boolean) => void;

  // Favorites
  toggleFavorite: (busNumber: string) => void;

  // Scenario Triggers & Actions
  triggerScenario: (scenario: string, busId?: string) => Promise<void>;
  setSpeedMultiplier: (mult: number) => void;
  togglePause: () => void;
  resolveAlert: (alertId: string) => Promise<void>;

  // Driver Actions
  setDriverBus: (busId: string) => void;
  setDriverGPSState: (latitude: number, longitude: number, speed: number, heading: number) => void;
  startDriverTrip: () => void;
  endDriverTrip: () => void;
  triggerDriverSOS: (reason?: string) => Promise<boolean>;
  reportDriverDelay: (mins: number, reason: string) => Promise<boolean>;
  toggleDriverOfflineSimulation: () => void;
  syncDriverQueue: () => Promise<{ success: boolean; synced: number }>;
  simulateDriverGPSStep: () => void;

  // Live state updater
  updateFleetState: (buses: Bus[], alerts?: Alert[]) => void;
}

export const useTransitStore = create<TransitStore>((set, get) => ({
  buses: [],
  routes: [],
  stops: [],
  timetables: [],
  history: [],
  alerts: [],
  favorites: storageService.getFavorites(),

  selectedBusId: null,
  selectedRouteId: null,
  selectedStopId: null,
  currentRole: 'passenger',
  connectionState: 'LIVE',
  searchQuery: '',
  notificationDrawerOpen: false,
  historyModalOpen: false,
  demoModalOpen: false,

  driverSession: {
    driverId: 'CND-5081',
    driverName: 'Conductor Shivam',
    conductorPhone: '+91 84234 21914',
    busId: '',
    busNumber: '',
    isTripActive: false,
    speed: 0,
    latitude: 0,
    longitude: 0,
    heading: 0,
    isSimulatedOffline: false,
    pendingRecordsCount: storageService.getOfflineQueueCount()
  },

  activeScenario: 'NORMAL',
  speedMultiplier: 1.0,
  isPaused: false,

  init: async () => {
    const [routes, stops, timetables, history, buses] = await Promise.all([
      apiService.fetchRoutes(),
      apiService.fetchStops(),
      apiService.fetchTimetables(),
      apiService.fetchHistory(),
      apiService.fetchBuses()
    ]);

    set({
      routes,
      stops,
      timetables,
      history,
      buses,
      selectedBusId: null,
      selectedRouteId: null,
      driverSession: {
        ...get().driverSession,
        pendingRecordsCount: storageService.getOfflineQueueCount()
      }
    });

    // Start WebSocket Live Feed
    apiService.createWebSocket(
      (data) => {
        if (data.type === 'VEHICLE_UPDATE' && data.bus) {
          const incoming = data.bus as Bus;
          const current = get().buses;
          const exists = current.some((b) => b.id === incoming.id);
          set({ buses: exists ? current.map((b) => b.id === incoming.id ? incoming : b) : [...current, incoming] });
          if (get().selectedBusId === incoming.id) {
            set({ driverSession: { ...get().driverSession, latitude: incoming.latitude, longitude: incoming.longitude, speed: incoming.currentSpeed, heading: incoming.heading } });
          }
        }
      },
      (connStatus) => {
        set({ connectionState: connStatus });
      }
    );

    // Fallback timer if backend offline
    setInterval(() => {
      if (get().connectionState !== 'LIVE') {
        get().simulateDriverGPSStep();
      }
    }, 2000);
  },

  setCurrentRole: (role: UserRole) => set({ currentRole: role }),
  setSelectedBusId: (id: string | null) => set({ selectedBusId: id }),
  setSelectedRouteId: (id: string | null) => set({ selectedRouteId: id }),
  setSelectedStopId: (id: string | null) => set({ selectedStopId: id }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setNotificationDrawerOpen: (open: boolean) => set({ notificationDrawerOpen: open }),
  setHistoryModalOpen: (open: boolean) => set({ historyModalOpen: open }),
  setDemoModalOpen: (open: boolean) => set({ demoModalOpen: open }),

  toggleFavorite: (busNumber: string) => {
    const updated = storageService.toggleFavorite(busNumber);
    set({ favorites: updated });
  },

  triggerScenario: async (scenario: string, busId: string = 'BUS-5081') => {
    set({ activeScenario: scenario });
    await apiService.triggerScenario(scenario, busId, get().speedMultiplier);

    const { buses, alerts } = get();
    const updated = buses.map((b) => {
      if (b.id === busId || b.busNumber === busId) {
        if (scenario === 'GPS_FAILURE') {
          return {
            ...b,
            gpsHealth: 'UNAVAILABLE' as const,
            status: 'GPS_ISSUE' as const,
            signalAgeSeconds: 24,
            gpsAccuracy: 99.0
          };
        }
        if (scenario === 'ROUTE_DEVIATION') {
          return {
            ...b,
            isDeviated: true,
            status: 'OUT_OF_ROUTE' as const,
            latitude: b.latitude + 0.0045,
            longitude: b.longitude + 0.0045
          };
        }
        if (scenario === 'GPS_ANOMALY') {
          return {
            ...b,
            currentSpeed: 385.0,
            gpsHealth: 'ANOMALY' as const,
            anomalyScore: 88,
            gpsAccuracy: 65.0
          };
        }
        if (scenario === 'NORMAL' || scenario === 'RESET_BUS') {
          return {
            ...b,
            gpsHealth: 'HEALTHY' as const,
            status: 'LIVE' as const,
            isDeviated: false,
            anomalyScore: 2,
            currentSpeed: 34.0
          };
        }
      }
      return b;
    });

    let newAlerts = [...alerts];
    if (scenario === 'GPS_FAILURE') {
      newAlerts.unshift({
        id: `ALT-LOC-${Date.now()}`,
        busId,
        type: 'GPS_UNAVAILABLE',
        severity: 'WARNING',
        title: `GPS Signal Cutoff: ${busId}`,
        message: 'GPS signal unavailable. Tracking precision degraded.',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    } else if (scenario === 'ROUTE_DEVIATION') {
      newAlerts.unshift({
        id: `ALT-LOC-${Date.now()}`,
        busId,
        type: 'ROUTE_DEVIATION',
        severity: 'CRITICAL',
        title: `Route Corridor Deviation: ${busId}`,
        message: 'Bus is 380m outside permitted corridor on Kanpur GT Road.',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    } else if (scenario === 'GPS_ANOMALY') {
      newAlerts.unshift({
        id: `ALT-LOC-${Date.now()}`,
        busId,
        type: 'GPS_ANOMALY',
        severity: 'CRITICAL',
        title: `Impossible Velocity Spike: ${busId}`,
        message: 'Telemetry spike: 385.0 km/h. Anomaly Score: 88/100.',
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    set({ buses: updated, alerts: newAlerts });
  },

  setSpeedMultiplier: (mult: number) => {
    set({ speedMultiplier: mult });
    apiService.triggerScenario(get().activeScenario, 'BUS-5081', mult);
  },

  togglePause: () => {
    set({ isPaused: !get().isPaused });
  },

  resolveAlert: async (alertId: string) => {
    await apiService.resolveAlert(alertId);
    set({
      alerts: get().alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    });
  },

  setDriverBus: (busId: string) => {
    const bus = get().buses.find((b) => b.id === busId || b.busNumber === busId);
    if (bus) {
      set({
        driverSession: {
          ...get().driverSession,
          busId: bus.id,
          busNumber: bus.busNumber,
          driverId: bus.driverId,
          driverName: bus.driverName,
          conductorPhone: bus.driverPhone,
          latitude: bus.latitude,
          longitude: bus.longitude,
          heading: bus.heading
        }
      });
    }
  },

  setDriverGPSState: (latitude: number, longitude: number, speed: number, heading: number) => {
    set({
      driverSession: {
        ...get().driverSession,
        latitude,
        longitude,
        speed,
        heading
      }
    });
  },

  startDriverTrip: () => {
    set({
      driverSession: {
        ...get().driverSession,
        isTripActive: true,
        speed: 32.0
      }
    });
  },

  endDriverTrip: () => {
    set({
      driverSession: {
        ...get().driverSession,
        isTripActive: false,
        speed: 0.0
      }
    });
  },

  triggerDriverSOS: async (reason: string = 'Emergency SOS Triggered by Conductor') => {
    const { driverSession, alerts } = get();
    const res = await apiService.triggerSOS(
      driverSession.busId,
      driverSession.driverName,
      driverSession.latitude,
      driverSession.longitude,
      reason
    );

    const sosAlert: Alert = {
      id: `ALT-SOS-${Date.now()}`,
      busId: driverSession.busId,
      type: 'EMERGENCY_SOS',
      severity: 'CRITICAL',
      title: `🚨 EMERGENCY SOS: Bus ${driverSession.busNumber}`,
      message: `${driverSession.driverName} triggered Emergency SOS alert! Location: ${driverSession.latitude.toFixed(4)}, ${driverSession.longitude.toFixed(4)}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    set({ alerts: [sosAlert, ...alerts], notificationDrawerOpen: true });
    return res;
  },

  reportDriverDelay: async (mins: number, reason: string) => {
    const { driverSession, buses, alerts } = get();
    const res = await apiService.submitDelayReport(
      driverSession.busId,
      mins,
      reason,
      driverSession.driverName
    );

    const updatedBuses = buses.map((b) =>
      b.id === driverSession.busId ? { ...b, status: 'DELAYED' as const, delayMinutes: mins } : b
    );

    const delayAlert: Alert = {
      id: `ALT-DELAY-${Date.now()}`,
      busId: driverSession.busId,
      type: 'DELAY_REPORTED',
      severity: 'WARNING',
      title: `⚠️ Delay Reported: Bus ${driverSession.busNumber} (+${mins}m)`,
      message: `${driverSession.driverName} reported a ${mins}-minute delay due to: ${reason}.`,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    set({ buses: updatedBuses, alerts: [delayAlert, ...alerts] });
    return res;
  },

  toggleDriverOfflineSimulation: () => {
    set({
      driverSession: {
        ...get().driverSession,
        isSimulatedOffline: !get().driverSession.isSimulatedOffline
      }
    });
  },

  syncDriverQueue: async () => {
    const queue = storageService.getOfflineQueue();
    if (queue.length === 0) return { success: true, synced: 0 };

    const res = await apiService.batchSyncGPS(queue);
    if (res.success) {
      storageService.clearOfflineQueue();
      set({
        driverSession: {
          ...get().driverSession,
          pendingRecordsCount: 0,
          isSimulatedOffline: false
        }
      });
    }
    return res;
  },

  simulateDriverGPSStep: () => {
    const { driverSession } = get();
    if (!driverSession.isTripActive) return;

    const newLat = driverSession.latitude + 0.0003;
    const newLon = driverSession.longitude + 0.0003;
    const newSpeed = 28.0 + Math.random() * 8.0;

    const record: OfflineGPSRecord = {
      id: `REC-${Date.now()}`,
      busId: driverSession.busId,
      latitude: newLat,
      longitude: newLon,
      speed: newSpeed,
      heading: 75,
      accuracy: 6.5,
      timestamp: new Date().toISOString(),
      source: 'SMARTPHONE_APP'
    };

    if (driverSession.isSimulatedOffline) {
      const count = storageService.enqueueGPSRecord(record);
      set({
        driverSession: {
          ...driverSession,
          latitude: newLat,
          longitude: newLon,
          speed: newSpeed,
          pendingRecordsCount: count
        }
      });
    } else {
      apiService.sendGPSUpdate(record);
      set({
        driverSession: {
          ...driverSession,
          latitude: newLat,
          longitude: newLon,
          speed: newSpeed
        }
      });
    }
  },

  updateFleetState: (buses: Bus[], alerts?: Alert[]) => {
    set({
      buses,
      alerts: alerts && alerts.length > 0 ? alerts : get().alerts
    });
  }
}));
