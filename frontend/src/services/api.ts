import { Bus, Route, Stop, Timetable, TripHistory, Alert, GPSHealthSummary, OfflineGPSRecord } from '../types';
import { storageService } from './storage';

const API_HOST = window.location.hostname || 'localhost';
const API_BASE = `http://${API_HOST}:8000`;
const WS_BASE = `ws://${API_HOST}:8000/ws/live`;

export const apiService = {
  getApiBase: () => API_BASE,

  async registerVehicle(regNumber: string, routeId?: string): Promise<Bus | null> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNumber, routeId })
      });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  },

  async lookupVehicle(regNumber: string): Promise<Bus | null> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/lookup?reg_number=${encodeURIComponent(regNumber)}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      return await res.json();
    } catch { return null; }
  },

  async fetchBuses(): Promise<Bus[]> {
    try {
      const res = await fetch(`${API_BASE}/buses`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      storageService.cacheBuses(data);
      return data; // empty until a real phone sends GPS
    } catch { return []; }
  },

  async fetchRoutes(): Promise<Route[]> {
    try {
      const res = await fetch(`${API_BASE}/routes`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  },

  async fetchStops(): Promise<Stop[]> {
    try {
      const res = await fetch(`${API_BASE}/stops`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  },

  async fetchTimetables(): Promise<Timetable[]> {
    try {
      const res = await fetch(`${API_BASE}/timetables`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  },

  async fetchHistory(busId?: string): Promise<TripHistory[]> {
    try {
      const url = busId ? `${API_BASE}/history?busId=${busId}` : `${API_BASE}/history`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data;
    } catch {
      return [];
    }
  },

  async fetchGPSHealth(): Promise<GPSHealthSummary | null> {
    try {
      const res = await fetch(`${API_BASE}/gps/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return null;
    }
  },

  async fetchAlerts(): Promise<Alert[]> {
    try {
      const res = await fetch(`${API_BASE}/alerts`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return [];
    }
  },

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/alerts/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async triggerSOS(busId: string, driverName: string, latitude: number, longitude: number, reason?: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/alerts/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId, driverName, latitude, longitude, reason })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async submitDelayReport(busId: string, estimatedDelayMins: number, reason: string, conductorName: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/driver/delay-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId, estimatedDelayMins, reason, conductorName })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async sendGPSUpdate(telemetry: Partial<OfflineGPSRecord>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/gps/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async batchSyncGPS(records: OfflineGPSRecord[]): Promise<{ success: boolean; synced: number }> {
    try {
      const res = await fetch(`${API_BASE}/gps/batch-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      if (!res.ok) throw new Error('Batch sync failed');
      const data = await res.json();
      return { success: true, synced: data.recordsSynced || records.length };
    } catch {
      return { success: false, synced: 0 };
    }
  },

  async triggerScenario(scenario: string, busId: string = 'BUS-5081', speedMultiplier?: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/simulation/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario, busId, speedMultiplier })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  createWebSocket(onMessage: (data: any) => void, onStatusChange: (status: 'LIVE' | 'OFFLINE') => void): () => void {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let isClosedIntentionally = false;

    const connect = () => {
      try {
        ws = new WebSocket(WS_BASE);

        ws.onopen = () => {
          onStatusChange('LIVE');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (e) {
            console.error('Error parsing WS message', e);
          }
        };

        ws.onerror = () => {
          onStatusChange('OFFLINE');
        };

        ws.onclose = () => {
          onStatusChange('OFFLINE');
          if (!isClosedIntentionally) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };
      } catch (err) {
        onStatusChange('OFFLINE');
        if (!isClosedIntentionally) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isClosedIntentionally = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }
};
