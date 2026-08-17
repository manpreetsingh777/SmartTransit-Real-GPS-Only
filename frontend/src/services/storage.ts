import { Bus, Route, Stop, Timetable, TripHistory, OfflineGPSRecord } from '../types';

const STORAGE_KEYS = {
  BUSES: 'yatrasetu_buses_cache',
  ROUTES: 'yatrasetu_routes_cache',
  STOPS: 'yatrasetu_stops_cache',
  TIMETABLES: 'yatrasetu_timetables_cache',
  HISTORY: 'yatrasetu_history_cache',
  FAVORITES: 'yatrasetu_favorite_buses',
  OFFLINE_QUEUE: 'yatrasetu_driver_offline_gps_queue',
  LAST_SYNC: 'yatrasetu_last_sync_timestamp'
};

export const storageService = {
  cacheStaticData: (routes: Route[], stops: Stop[], timetables: Timetable[], history: TripHistory[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
      localStorage.setItem(STORAGE_KEYS.STOPS, JSON.stringify(stops));
      localStorage.setItem(STORAGE_KEYS.TIMETABLES, JSON.stringify(timetables));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Could not cache static data', e);
    }
  },

  cacheBuses: (buses: Bus[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(buses));
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('Could not cache buses', e);
    }
  },

  getCachedBuses: (): Bus[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUSES);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getCachedRoutes: (): Route[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTES);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getCachedStops: (): Stop[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STOPS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getCachedTimetables: (): Timetable[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMETABLES);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getCachedHistory: (): TripHistory[] | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // ---------------------------------------------------------
  // Bookmarked / Favorite Buses
  // ---------------------------------------------------------
  getFavorites: (): string[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : ['5081', '4218', '6077'];
    } catch {
      return ['5081', '4218', '6077'];
    }
  },

  toggleFavorite: (busNumber: string): string[] => {
    try {
      const favs = storageService.getFavorites();
      const updated = favs.includes(busNumber)
        ? favs.filter((b) => b !== busNumber)
        : [...favs, busNumber];
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  getLastSyncTimestamp: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  },

  // ---------------------------------------------------------
  // Driver Offline Queue Management
  // ---------------------------------------------------------
  enqueueGPSRecord: (record: OfflineGPSRecord) => {
    try {
      const queue = storageService.getOfflineQueue();
      queue.push(record);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      return queue.length;
    } catch (e) {
      console.error('Error queuing offline GPS record', e);
      return 0;
    }
  },

  getOfflineQueue: (): OfflineGPSRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearOfflineQueue: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (e) {
      console.error('Error clearing offline queue', e);
    }
  },

  getOfflineQueueCount: (): number => {
    return storageService.getOfflineQueue().length;
  }
};
