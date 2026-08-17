import React, { useEffect, useRef, useState } from 'react';
import { useTransitStore } from '../store/useTransitStore';
import { apiService } from '../services/api';
import { Radio, MapPin, Gauge, Play, Square, Wifi, WifiOff } from 'lucide-react';

export const DriverTerminal: React.FC = () => {
  const { driverSession, routes, buses, setDriverBus, setDriverGPSState, startDriverTrip, endDriverTrip, updateFleetState } = useTransitStore();
  const [registration, setRegistration] = useState('');
  const [routeId, setRouteId] = useState('');
  const [vehicle, setVehicle] = useState<any>(null);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [message, setMessage] = useState('Register this vehicle before sending GPS.');
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!routeId && routes[0]) setRouteId(routes[0].id);
    return () => { if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current); };
  }, [routes]);

  const register = async () => {
    const reg = registration.trim().toUpperCase();
    if (!reg) return setMessage('Enter the real vehicle registration number, e.g. UP78GC9845.');
    const found = await apiService.registerVehicle(reg, routeId || routes[0]?.id);
    if (!found) return setMessage('Could not register vehicle. Check that the backend is running.');
    setVehicle(found);
    updateFleetState([found]);
    setDriverBus(found.id);
    setMessage(`${found.regNumber} registered. No GPS is being claimed until your phone sends a position.`);
  };

  const startGPS = () => {
    if (!vehicle) return setMessage('Register the vehicle first.');
    if (!navigator.geolocation) return setMessage('This browser does not provide GPS.');
    startDriverTrip();
    const id = navigator.geolocation.watchPosition(async (pos) => {
      const c = pos.coords;
      const speed = c.speed == null ? 0 : Math.max(0, c.speed * 3.6);
      const heading = c.heading == null ? 0 : c.heading;
      setDriverGPSState(c.latitude, c.longitude, speed, heading);
      const ok = await apiService.sendGPSUpdate({
        busId: vehicle.id,
        latitude: c.latitude,
        longitude: c.longitude,
        speed: Number(speed.toFixed(1)),
        heading: Number(heading.toFixed(1)),
        accuracy: c.accuracy,
        source: 'SMARTPHONE_APP',
        timestamp: new Date(pos.timestamp).toISOString()
      });
      setGpsTracking(true);
      setMessage(ok ? 'REAL GPS LIVE — this vehicle is now visible to passengers.' : 'GPS received, but the server update failed.');
    }, (err) => { setGpsTracking(false); setMessage(`GPS error: ${err.message}`); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 });
    watchRef.current = id;
    setGpsTracking(true);
  };

  const stopGPS = () => {
    if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
    watchRef.current = null;
    setGpsTracking(false);
    endDriverTrip();
    setMessage('GPS stopped. Passenger lookup will stop receiving new live positions.');
  };

  const liveVehicle = buses.find(b => b.id === vehicle?.id) || vehicle;

  return <div className="min-h-screen bg-[#080c16] text-slate-100 p-4 sm:p-8">
    <div className="max-w-xl mx-auto bg-[#0d121f] border border-[#1e293e] rounded-3xl p-6 space-y-6 shadow-2xl">
      <div><h1 className="text-2xl font-black text-white">Driver / Real GPS Source</h1><p className="text-xs text-slate-400 mt-1">This phone is the vehicle's GPS source. No simulated location is used.</p></div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400">REAL VEHICLE REGISTRATION</label>
        <div className="flex gap-2"><input value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} placeholder="UP78GC9845" className="flex-1 bg-[#121828] border border-[#24314e] rounded-xl px-4 py-3 font-mono font-black text-white"/><button onClick={register} className="px-5 rounded-xl bg-cyan-500 text-slate-950 font-black">REGISTER</button></div>
        <select value={routeId} onChange={e=>setRouteId(e.target.value)} className="w-full bg-[#121828] border border-[#24314e] rounded-xl px-4 py-3 text-sm text-white"><option value="">Select route</option>{routes.map(r=><option key={r.id} value={r.id}>{r.routeNumber} — {r.name}</option>)}</select>
      </div>

      {vehicle && <div className="bg-[#121828] rounded-2xl p-4 border border-emerald-900/60"><div className="flex justify-between"><div><p className="text-[10px] text-slate-500">REGISTERED VEHICLE</p><p className="font-black font-mono text-xl text-white">{vehicle.regNumber}</p></div><span className={`h-fit px-2 py-1 rounded-full text-[10px] font-black ${gpsTracking?'bg-emerald-950 text-emerald-400':'bg-slate-800 text-slate-400'}`}>{gpsTracking?'GPS LIVE':'WAITING FOR GPS'}</span></div></div>}

      <div className="grid grid-cols-2 gap-3"><button onClick={startGPS} disabled={!vehicle || gpsTracking} className="py-3 rounded-xl bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 font-black flex items-center justify-center gap-2"><Play className="w-4 h-4"/> START REAL GPS</button><button onClick={stopGPS} disabled={!gpsTracking} className="py-3 rounded-xl bg-rose-700 disabled:bg-slate-800 disabled:text-slate-500 font-black flex items-center justify-center gap-2"><Square className="w-4 h-4"/> STOP GPS</button></div>

      <div className="grid grid-cols-3 gap-2"><div className="bg-[#080c16] p-3 rounded-xl text-center"><Gauge className="w-4 h-4 mx-auto text-cyan-400"/><p className="text-[10px] text-slate-500">Speed</p><b>{liveVehicle?.currentSpeed ?? driverSession.speed}</b><small> km/h</small></div><div className="bg-[#080c16] p-3 rounded-xl text-center"><MapPin className="w-4 h-4 mx-auto text-cyan-400"/><p className="text-[10px] text-slate-500">Latitude</p><b>{(liveVehicle?.latitude ?? driverSession.latitude).toFixed(5)}</b></div><div className="bg-[#080c16] p-3 rounded-xl text-center"><Radio className="w-4 h-4 mx-auto text-cyan-400"/><p className="text-[10px] text-slate-500">Longitude</p><b>{(liveVehicle?.longitude ?? driverSession.longitude).toFixed(5)}</b></div></div>

      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-900 text-xs text-cyan-200 flex gap-2">{gpsTracking?<Wifi className="w-4 h-4 text-emerald-400"/>:<WifiOff className="w-4 h-4"/>}{message}</div>
    </div>
  </div>;
};
