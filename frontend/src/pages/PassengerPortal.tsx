import React, { useState } from 'react';
import { useTransitStore } from '../store/useTransitStore';
import { apiService } from '../services/api';
import { LiveMap } from '../components/LiveMap';
import { Search, MapPin, Gauge, Clock, Radio } from 'lucide-react';

export const PassengerPortal: React.FC = () => {
  const { buses, routes, stops, updateFleetState, selectedBusId, setSelectedBusId, setSelectedRouteId } = useTransitStore();
  const [registration, setRegistration] = useState('');
  const [message, setMessage] = useState('Enter a real vehicle registration number to see live data.');
  const selected = buses.find(b => b.id === selectedBusId) || null;

  const findVehicle = async () => {
    const reg = registration.trim().toUpperCase();
    if (!reg) return setMessage('Enter a registration number, e.g. UP78GC9845.');
    const found = await apiService.lookupVehicle(reg);
    if (!found) {
      setSelectedBusId('');
      setMessage(`No live GPS source is connected for ${reg}. Ask the driver to start REAL GPS.`);
      return;
    }
    updateFleetState([found]);
    setSelectedBusId(found.id);
    setSelectedRouteId(found.routeId);
    setMessage(`${found.regNumber} is LIVE from a real smartphone GPS source.`);
  };

  return <div className="min-h-screen bg-[#080c16] text-slate-100 pb-20">
    <section className="bg-gradient-to-b from-[#0e1424] to-[#080c16] border-b border-[#1c253b] py-10"><div className="max-w-4xl mx-auto px-4 text-center"><p className="inline-flex px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] font-black uppercase">REAL GPS TRACKING ONLY</p><h1 className="text-4xl font-black mt-4 text-white">Track your vehicle</h1><p className="text-sm text-slate-400 mt-2">No simulated buses. Data appears only after a real vehicle phone sends GPS.</p>
      <div className="relative max-w-xl mx-auto mt-7"><Search className="absolute left-4 top-4 w-4 h-4 text-slate-500"/><input value={registration} onChange={e=>setRegistration(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&findVehicle()} placeholder="Enter vehicle registration e.g. UP78GC9845" className="w-full pl-11 pr-28 py-4 rounded-2xl bg-[#121828] border border-[#24314e] text-white font-mono font-bold"/><button onClick={findVehicle} className="absolute right-1.5 top-1.5 bottom-1.5 px-5 rounded-xl bg-cyan-500 text-slate-950 font-black">FIND</button></div>
      <p className="text-xs text-cyan-300 mt-3">{message}</p></div></section>

    <main className="max-w-6xl mx-auto px-4 py-8">
      {!selected ? <div className="rounded-3xl border border-dashed border-[#334155] bg-[#0d121f] p-12 text-center"><Radio className="w-10 h-10 mx-auto text-slate-600"/><h2 className="text-xl font-black text-white mt-4">No vehicle selected</h2><p className="text-sm text-slate-500 mt-2">Enter the registration number above. A vehicle will appear only when its driver phone is sending real GPS data.</p></div> : <>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5"><div><p className="text-[10px] text-slate-500 uppercase font-black">LIVE VEHICLE</p><h2 className="text-2xl font-black font-mono text-white">{selected.regNumber}</h2><p className="text-xs text-slate-400">{selected.routeName}</p></div><span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-black">● {selected.status}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5"><Metric icon={<Gauge/>} label="REAL GPS SPEED" value={`${selected.currentSpeed} km/h`}/><Metric icon={<MapPin/>} label="LOCATION" value={`${selected.latitude.toFixed(5)}, ${selected.longitude.toFixed(5)}`}/><Metric icon={<Clock/>} label="NEXT STOP ETA" value={selected.etaMinutes == null ? 'Waiting for movement' : `${selected.etaMinutes} min`}/></div>
        <div className="bg-[#0d121f] rounded-3xl p-2 border border-[#1e293e]"><LiveMap heightClass="h-[520px]" showAllRoutes={false}/></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5"><div className="bg-[#0d121f] p-4 rounded-2xl border border-[#1e293e]"><p className="text-[10px] text-slate-500">NEXT STOP</p><p className="font-black text-white mt-1">{selected.nextStopName || 'Calculating...'}</p></div><div className="bg-[#0d121f] p-4 rounded-2xl border border-[#1e293e]"><p className="text-[10px] text-slate-500">GPS ACCURACY</p><p className="font-black text-white mt-1">{selected.gpsAccuracy ? `${selected.gpsAccuracy.toFixed(1)} m` : 'Unavailable'}</p></div><div className="bg-[#0d121f] p-4 rounded-2xl border border-[#1e293e]"><p className="text-[10px] text-slate-500">LAST UPDATE</p><p className="font-black text-white mt-1">{new Date(selected.lastUpdate).toLocaleTimeString()}</p></div></div>
      </>}
    </main>
  </div>;
};

const Metric = ({icon,label,value}:{icon:React.ReactNode;label:string;value:string}) => <div className="bg-[#0d121f] border border-[#1e293e] rounded-2xl p-4"><div className="flex items-center gap-2 text-cyan-400">{React.cloneElement(icon as React.ReactElement<any>,{className:'w-4 h-4'})}<span className="text-[10px] font-black text-slate-500">{label}</span></div><p className="text-lg font-black text-white mt-2 break-words">{value}</p></div>;
