import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTransitStore } from '../store/useTransitStore';
import { Bus, Route, Stop } from '../types';
import { Navigation, Clock, Gauge, AlertTriangle, Users, MapPin, Activity, ShieldCheck } from 'lucide-react';

const KANPUR_CENTER: [number, number] = [26.4650, 80.2850];

const MapRecenter: React.FC<{ targetLat?: number; targetLon?: number; zoom?: number }> = ({
  targetLat,
  targetLon,
  zoom
}) => {
  const map = useMap();
  useEffect(() => {
    if (targetLat && targetLon) {
      map.flyTo([targetLat, targetLon], zoom || map.getZoom(), { duration: 1.0 });
    }
  }, [targetLat, targetLon, map, zoom]);
  return null;
};

// Create custom SVG Bus Marker with dynamic heading rotation, status color and occupancy indicator
const createBusIcon = (bus: Bus, isSelected: boolean) => {
  let color = '#00f2fe'; // Default Neon Cyan (LIVE)
  let statusBadge = '🟢';

  if (bus.status === 'OUT_OF_ROUTE' || bus.isDeviated) {
    color = '#38bdf8'; // Blue
    statusBadge = '🔵';
  } else if (bus.gpsHealth === 'ANOMALY' || (bus.anomalyScore && bus.anomalyScore > 40)) {
    color = '#f43f5e'; // Red
    statusBadge = '⚡';
  } else if (bus.status === 'GPS_ISSUE' || bus.gpsHealth === 'UNAVAILABLE') {
    color = '#f97316'; // Orange
    statusBadge = '🟠';
  } else if (bus.status === 'DELAYED') {
    color = '#f59e0b'; // Amber
    statusBadge = '🟡';
  }

  const heading = bus.heading || 0;
  const size = isSelected ? 46 : 38;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isSelected
          ? `<div style="position: absolute; width: ${size + 16}px; height: ${size + 16}px; border-radius: 50%; background: ${color}22; border: 2px dashed ${color}; animation: spin 8s linear infinite;"></div>`
          : ''
      }
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #0d121f;
        border: 2px solid ${color};
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.8), 0 0 10px ${color}44;
        position: relative;
        transform: rotate(${heading}deg);
        transition: transform 0.6s ease;
      ">
        <!-- Direction pointer arrow -->
        <div style="
          position: absolute;
          top: -6px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 7px solid ${color};
        "></div>

        <svg style="width: ${size * 0.5}px; height: ${size * 0.5}px; color: #f8fafc; transform: rotate(-${heading}deg);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>

      <!-- Bus Number Badge -->
      <div style="
        position: absolute;
        bottom: -14px;
        background: #080c16;
        color: #f1f5f9;
        font-size: 9px;
        font-weight: 900;
        padding: 0.5px 5px;
        border-radius: 6px;
        border: 1px solid ${color};
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.8);
      ">
        Bus ${bus.busNumber}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-bus-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

// Create custom Stop Icon
const createStopIcon = (isPSIT: boolean = false) => {
  const size = isPSIT ? 24 : 16;
  const color = isPSIT ? '#00f2fe' : '#64748b';

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: #0b0f19;
      border: 2px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px ${isPSIT ? '#00f2fe' : 'rgba(0,0,0,0.5)'};
    ">
      <div style="width: ${size * 0.4}px; height: ${size * 0.4}px; border-radius: 50%; background: ${color};"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-stop-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

interface LiveMapProps {
  heightClass?: string;
  showAllRoutes?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  heightClass = 'h-[520px]',
  showAllRoutes = true
}) => {
  const {
    buses,
    routes,
    stops,
    selectedBusId,
    setSelectedBusId,
    selectedRouteId,
    setSelectedRouteId
  } = useTransitStore();

  const selectedBus = useMemo(
    () => buses.find((b) => b.id === selectedBusId || b.busNumber === selectedBusId),
    [buses, selectedBusId]
  );

  const activeRoute = useMemo(() => {
    if (selectedRouteId) return routes.find((r) => r.id === selectedRouteId);
    if (selectedBus) return routes.find((r) => r.id === selectedBus.routeId);
    return routes[0];
  }, [routes, selectedRouteId, selectedBus]);

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-[#1e293e] shadow-2xl bg-[#080c16]`}>
      <MapContainer
        center={KANPUR_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="dark-tiles w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectedBus && (
          <MapRecenter
            targetLat={selectedBus.latitude}
            targetLon={selectedBus.longitude}
          />
        )}

        {/* Render Route Polylines */}
        {routes.map((route) => {
          const isSelected = activeRoute?.id === route.id;
          return (
            <Polyline
              key={route.id}
              positions={route.waypoints}
              pathOptions={{
                color: route.color || '#00f2fe',
                weight: isSelected ? 5.5 : 2.5,
                opacity: isSelected ? 0.95 : 0.35,
                dashArray: isSelected ? undefined : '4, 6'
              }}
            />
          );
        })}

        {/* Geofence Corridor Buffer for Active Route */}
        {activeRoute && (
          <Polyline
            positions={activeRoute.waypoints}
            pathOptions={{
              color: '#00f2fe',
              weight: 22,
              opacity: 0.08
            }}
          />
        )}

        {/* Render Bus Stops */}
        {stops.map((stop) => {
          const isPSIT = stop.id === 'STP-PSIT';
          return (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={createStopIcon(isPSIT)}
            >
              <Popup>
                <div className="p-3.5 max-w-xs text-slate-100 bg-[#0d121f] rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isPSIT ? 'PSIT Main Campus' : 'Designated Stoppage'}</span>
                  </div>
                  <h4 className="font-black text-sm text-white">{stop.name}</h4>
                  <p className="text-xs text-cyan-300 font-medium">{stop.nameHindi}</p>
                  <p className="text-[11px] text-slate-400">{stop.landmark}</p>
                  <div className="pt-1 text-[10px] text-slate-500 font-mono">
                    Zone: {stop.zone}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Live Fleet Bus Markers */}
        {buses.map((bus) => {
          const isSelected = bus.id === selectedBusId || bus.busNumber === selectedBusId;
          const route = routes.find((r) => r.id === bus.routeId);

          return (
            <Marker
              key={bus.id}
              position={[bus.latitude, bus.longitude]}
              icon={createBusIcon(bus, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedBusId(bus.id);
                  if (bus.routeId) setSelectedRouteId(bus.routeId);
                }
              }}
            >
              <Popup>
                <div className="p-4 w-72 text-slate-100 bg-[#0d121f] rounded-2xl space-y-2.5">
                  
                  {/* Bus Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-black text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-md font-mono">
                        Bus {bus.busNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{bus.regNumber}</span>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      bus.status === 'LIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : bus.status === 'OUT_OF_ROUTE'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                        : bus.status === 'DELAYED'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {bus.status}
                    </span>
                  </div>

                  {/* Route & Destination */}
                  <div className="text-xs font-semibold text-slate-200">
                    {route?.name || bus.routeName}
                  </div>

                  {/* Telemetry Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{bus.currentSpeed} km/h</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ETA: {bus.etaMinutes} min</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span>{bus.passengersCarried}/{bus.capacity} seats</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      <span>GPS: {bus.gpsHealth}</span>
                    </div>
                  </div>

                  {/* Conductor Contact */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{bus.driverName}</span>
                    <span className="font-mono text-cyan-400">{bus.driverPhone}</span>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* PSIT Campus Pin */}
        <Circle
          center={[26.4499, 80.1927]}
          radius={300}
          pathOptions={{ color: '#00f2fe', fillColor: '#00f2fe', fillOpacity: 0.15 }}
        />
        <Marker
          position={[26.4499, 80.1927]}
          icon={L.divIcon({
            html: `<div style="width: 16px; height: 16px; background: #00f2fe; border: 3px solid #080c16; border-radius: 50%; box-shadow: 0 0 15px #00f2fe;"></div>`,
            className: 'psit-pin',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          })}
        >
          <Popup>
            <div className="p-2 text-xs font-black text-cyan-400 bg-[#0d121f] rounded">
              🎓 PSIT Campus, NH-19 Bhauti, Kanpur
            </div>
          </Popup>
        </Marker>

      </MapContainer>

      {/* Floating Corridor Badge */}
      <div className="absolute top-4 left-4 z-[400] bg-[#0d121f]/90 backdrop-blur-md border border-[#1e293e] rounded-2xl px-3.5 py-2 shadow-2xl flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-neon-pulse"></span>
          <span className="text-xs font-bold text-white">YatraSetu Fleet Radar</span>
        </div>
        <span className="text-xs text-slate-400 border-l border-slate-700 pl-3 font-mono hidden sm:inline">
          37 Active PSIT Routes
        </span>
      </div>

      {/* Floating Map Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-[#0d121f]/90 backdrop-blur-md border border-[#1e293e] rounded-2xl p-2.5 shadow-2xl text-[11px] hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-slate-300">Live</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span className="text-slate-300">Delayed</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span className="text-slate-300">Deviated</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
          <span className="text-slate-300">GPS Issue</span>
        </div>
      </div>

    </div>
  );
};
