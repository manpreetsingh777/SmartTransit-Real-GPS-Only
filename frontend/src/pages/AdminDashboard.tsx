import React, { useState, useMemo } from 'react';
import { useTransitStore } from '../store/useTransitStore';
import { LiveMap } from '../components/LiveMap';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import {
  LayoutDashboard,
  Map as MapIcon,
  Activity,
  AlertTriangle,
  Bus,
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  Radio,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Smartphone,
  Server,
  DollarSign,
  Zap,
  ArrowUpRight,
  History,
  Phone,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    buses,
    routes,
    stops,
    history,
    alerts,
    resolveAlert,
    setDemoModalOpen,
    triggerScenario,
    setSelectedBusId
  } = useTransitStore();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'live-fleet' | 'history' | 'gps-health' | 'alerts' | 'fleet-mgmt' | 'iot-config'
  >('dashboard');

  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '1Y'>('1M');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'UNRESOLVED'>('UNRESOLVED');

  // KPI calculations
  const stats = useMemo(() => {
    const total = buses.length; // 37
    const active = buses.filter((b) => b.status === 'LIVE' || b.status === 'DELAYED').length;
    const delayed = buses.filter((b) => b.status === 'DELAYED').length;
    const gpsIssues = buses.filter((b) => b.gpsHealth === 'UNAVAILABLE' || b.status === 'GPS_ISSUE').length;
    const outOfRoute = buses.filter((b) => b.isDeviated || b.status === 'OUT_OF_ROUTE').length;
    const anomalies = buses.filter((b) => (b.anomalyScore && b.anomalyScore > 30) || b.gpsHealth === 'ANOMALY').length;
    return { total, active, delayed, gpsIssues, outOfRoute, anomalies };
  }, [buses]);

  // Donut chart data for Occupancy Breakdown
  const occupancyBreakdown = useMemo(() => {
    const high = buses.filter((b) => b.occupancy === 'HIGH').length;
    const med = buses.filter((b) => b.occupancy === 'MEDIUM').length;
    const low = buses.filter((b) => b.occupancy === 'LOW').length;
    return [
      { name: 'High (38-44)', value: high, color: '#38bdf8' },
      { name: 'Med (34-37)', value: med, color: '#818cf8' },
      { name: 'Low (30-33)', value: low, color: '#fbbf24' }
    ];
  }, [buses]);

  // Fleet performance trend data (matching the spline chart in reference image)
  const performanceTrend = [
    { period: 'Nov 1', fleetSpeed: 30, onTimeRate: 88, activeCount: 35 },
    { period: 'Nov 5', fleetSpeed: 32, onTimeRate: 91, activeCount: 36 },
    { period: 'Nov 10', fleetSpeed: 28, onTimeRate: 85, activeCount: 34 },
    { period: 'Nov 15', fleetSpeed: 34, onTimeRate: 94, activeCount: 37 },
    { period: 'Nov 20', fleetSpeed: 35, onTimeRate: 96, activeCount: 37 },
    { period: 'Nov 25', fleetSpeed: 33, onTimeRate: 93, activeCount: 36 },
    { period: 'Nov 30', fleetSpeed: 36, onTimeRate: 95, activeCount: 37 }
  ];

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'UNRESOLVED') return alerts.filter((a) => !a.resolved);
    if (alertFilter === 'CRITICAL') return alerts.filter((a) => a.severity === 'CRITICAL');
    if (alertFilter === 'WARNING') return alerts.filter((a) => a.severity === 'WARNING');
    return alerts;
  }, [alerts, alertFilter]);

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col md:flex-row pb-20">
      
      {/* Futuristic Left Sidebar (Matching reference screenshot) */}
      <aside className="w-full md:w-64 bg-[#0d121f] border-r border-[#1e293e] p-4 sm:p-5 space-y-6 flex-shrink-0">
        
        {/* Brand / Role header */}
        <div className="px-2 pt-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block">
            Command Center
          </span>
          <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">PSIT Transit Admin</h2>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">37 Fleet Routes Active</p>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="space-y-1 text-xs font-bold">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('live-fleet')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${
              activeTab === 'live-fleet'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <MapIcon className="w-4 h-4 text-emerald-400" />
            <span>Live Fleet Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>Trip History Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('gps-health')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all relative ${
              activeTab === 'gps-health'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-400" />
            <span>GPS Health Center</span>
            {stats.gpsIssues + stats.anomalies > 0 && (
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse ml-auto"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all relative ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Incident Alert Center</span>
            {alerts.filter((a) => !a.resolved).length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black ml-auto">
                {alerts.filter((a) => !a.resolved).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fleet-mgmt')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${
              activeTab === 'fleet-mgmt'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <Bus className="w-4 h-4 text-pink-400" />
            <span>37 Buses & Conductors</span>
          </button>

          <button
            onClick={() => setActiveTab('iot-config')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl transition-all ${
              activeTab === 'iot-config'
                ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10 font-black'
                : 'text-slate-400 hover:text-white hover:bg-[#121828]'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
            <span>IoT Hardware Gateway</span>
          </button>

        </nav>

        {/* SIH Scenario Trigger CTA in Sidebar */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setDemoModalOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-950/70 to-teal-900/50 border border-cyan-500/30 text-left hover:border-cyan-400 transition shadow-xl"
          >
            <div className="flex items-center space-x-2 text-cyan-400 font-black text-xs mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SIH Demo Scenarios</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Trigger GPS dropouts, route deviations & velocity spikes with 1 click.
            </p>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1720px]">
        
        {/* Tab 1: Executive Dashboard (Matching Reference Screenshots) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header Greeting */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Welcome back! Real-time operational telemetry for PSIT Kanpur Bus Network.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerScenario('NORMAL')}
                  className="px-4 py-2 bg-[#121828] hover:bg-[#182238] text-cyan-400 text-xs font-black rounded-xl border border-[#24314e] transition flex items-center space-x-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Refresh Fleet Data</span>
                </button>
              </div>
            </div>

            {/* Top 4 KPI Cards (Matching Lindgo Fintech screenshot) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Fleet */}
              <div className="bg-[#121828] border border-[#24314e] p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black">
                    <Bus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
                    37 Routes
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Total Fleet Capacity
                  </span>
                  <div className="text-2xl font-black text-white mt-1">1,628 Seats</div>
                  <span className="text-[11px] text-cyan-400/90 font-medium">30 to 44 per bus</span>
                </div>
              </div>

              {/* Card 2: Active on Route */}
              <div className="bg-[#121828] border border-[#24314e] p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                    +20.1% Peak
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Active Live Buses
                  </span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">{stats.active} Operating</div>
                  <span className="text-[11px] text-emerald-400/90 font-medium">On-corridor tracking</span>
                </div>
              </div>

              {/* Card 3: Delayed / Bottlenecks */}
              <div className="bg-[#121828] border border-[#24314e] p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800">
                    94.6% Rate
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Schedule Adherence
                  </span>
                  <div className="text-2xl font-black text-white mt-1">{37 - stats.delayed} On-Time</div>
                  <span className="text-[11px] text-amber-400 font-medium">{stats.delayed} delayed at bottleneck</span>
                </div>
              </div>

              {/* Card 4: AI Risk / Alerts */}
              <div className="bg-[#121828] border border-[#24314e] p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800">
                    {stats.gpsIssues + stats.outOfRoute} Incident
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Telemetry Alerts
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {alerts.filter((a) => !a.resolved).length} Unresolved
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">GPS / Corridor breaches</span>
                </div>
              </div>

            </div>

            {/* Middle Grid: Performance Chart + Donut Chart + Right AI Insights Column */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left & Center Main Analytics (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Fleet Performance Spline Chart */}
                <div className="bg-[#121828] border border-[#24314e] p-5 sm:p-6 rounded-3xl shadow-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-black text-sm text-white uppercase tracking-wider">
                        Fleet Speed & On-Time Performance Trend
                      </h3>
                      <p className="text-xs text-slate-400">Average velocity (km/h) across PSIT corridors</p>
                    </div>

                    {/* Time toggles (7D / 1M / 1Y) */}
                    <div className="flex items-center space-x-1 bg-[#0d121f] p-1 rounded-xl border border-[#1e293e] text-xs font-bold">
                      {(['7D', '1M', '1Y'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => setTimeRange(r)}
                          className={`px-3 py-1 rounded-lg transition ${
                            timeRange === r
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceTrend}>
                        <defs>
                          <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293e" vertical={false} />
                        <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} domain={[20, 45]} />
                        <Tooltip
                          contentStyle={{ background: '#0d121f', borderColor: '#24314e', borderRadius: '12px', fontSize: '12px' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="fleetSpeed"
                          stroke="#00f2fe"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#cyanGradient)"
                          name="Avg Speed (km/h)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Split: Donut Chart & Live Fleet Radar Preview */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Occupancy Donut Chart (5 cols) */}
                  <div className="md:col-span-5 bg-[#121828] border border-[#24314e] p-5 rounded-3xl shadow-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-black text-xs text-white uppercase tracking-wider">
                        Passenger Occupancy
                      </h4>
                      <p className="text-[11px] text-slate-400">Distribution across 30 to 44 seats</p>
                    </div>

                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={occupancyBreakdown}
                            innerRadius={45}
                            outerRadius={68}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {occupancyBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#0d121f', borderColor: '#24314e', borderRadius: '12px', fontSize: '11px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {occupancyBreakdown.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }}></span>
                            <span className="text-slate-300">{item.name}:</span>
                          </div>
                          <strong className="text-white">{item.value} buses</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live Fleet Radar Snippet (7 cols) */}
                  <div className="md:col-span-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs text-white uppercase tracking-wider">
                        Fleet Radar Map
                      </h4>
                      <button
                        onClick={() => setActiveTab('live-fleet')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                      >
                        Full Screen Map &rarr;
                      </button>
                    </div>
                    <LiveMap heightClass="h-[300px]" />
                  </div>

                </div>

                {/* Recent Trips Table (Matching reference image table style) */}
                <div className="bg-[#121828] border border-[#24314e] rounded-3xl shadow-2xl overflow-hidden space-y-3">
                  <div className="p-5 border-b border-[#1e293e] flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-sm text-white uppercase tracking-wider">
                        Recent Trips & Dispatches
                      </h3>
                      <p className="text-xs text-slate-400">Past operations and arrival status</p>
                    </div>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-xs font-bold text-cyan-400 hover:underline"
                    >
                      View All History &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#1e293e] text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-5">Trip Date</th>
                          <th className="py-3 px-5">Vehicle & Conductor</th>
                          <th className="py-3 px-5">Route Corridor</th>
                          <th className="py-3 px-5">Passengers</th>
                          <th className="py-3 px-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293e]/60 font-medium">
                        {history.slice(0, 6).map((item) => (
                          <tr key={item.tripId} className="hover:bg-[#161f33] transition">
                            <td className="py-3.5 px-5 font-bold text-white whitespace-nowrap">
                              {item.date}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800 mr-2">
                                Bus {item.busNumber}
                              </span>
                              <span className="text-slate-300 font-semibold">{item.conductor}</span>
                            </td>
                            <td className="py-3.5 px-5 text-slate-400 max-w-[200px] truncate">
                              {item.origin} ➔ PSIT
                            </td>
                            <td className="py-3.5 px-5 text-purple-400 font-bold">
                              {item.passengersCarried}/44
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                                item.status === 'Completed'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                  : item.status === 'Delayed'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                              }`}>
                                {item.status === 'Completed' ? 'Success' : item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: AI Insights Panel (4 cols) (Matching reference screenshot!) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0d121f] border border-[#1e293e] rounded-3xl p-5 sm:p-6 shadow-2xl">
                  <AIInsightsPanel />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Full Screen Live Fleet Map */}
        {activeTab === 'live-fleet' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Live Fleet Tracking Console</h2>
                <p className="text-xs text-slate-400">All 37 PSIT operating vehicles, route lines, and stop markers</p>
              </div>
            </div>
            <LiveMap heightClass="h-[700px]" />
          </div>
        )}

        {/* Tab 3: Trip History Logs Explorer */}
        {activeTab === 'history' && (
          <div className="bg-[#121828] border border-[#24314e] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e293e] pb-4">
              <div>
                <h2 className="text-xl font-black text-white">Verified Trip History Explorer</h2>
                <p className="text-xs text-slate-400">Generated logs of all trips completed across Kanpur corridors</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-black">{history.length} historical trips logged</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e293e] text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Trip ID</th>
                    <th className="py-3 px-4">Bus & Conductor</th>
                    <th className="py-3 px-4">Date & Slot</th>
                    <th className="py-3 px-4">Origin Hub</th>
                    <th className="py-3 px-4">Distance & Fuel</th>
                    <th className="py-3 px-4">Speed</th>
                    <th className="py-3 px-4">Occupancy</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293e]/60 font-medium">
                  {history.map((row) => (
                    <tr key={row.tripId} className="hover:bg-[#161f33] transition">
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">{row.tripId}</td>
                      <td className="py-3.5 px-4">
                        <strong className="text-white block">Bus {row.busNumber}</strong>
                        <span className="text-[11px] text-slate-400">{row.conductor}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-bold">{row.date} • {row.timeSlot}</td>
                      <td className="py-3.5 px-4 text-slate-300">{row.origin}</td>
                      <td className="py-3.5 px-4 text-slate-300">{row.distanceKm} km ({row.fuelEfficiency})</td>
                      <td className="py-3.5 px-4 text-slate-300">{row.avgSpeedKmH} km/h</td>
                      <td className="py-3.5 px-4 text-purple-400 font-bold">{row.passengersCarried}/44</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                          row.status === 'Completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {row.status === 'Completed' ? 'Success' : row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: GPS Health Center */}
        {activeTab === 'gps-health' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">GPS Health & Telemetry Diagnostics</h2>
              <p className="text-xs text-slate-400">Signal integrity, HDOP accuracy, jitter, and timestamp sync</p>
            </div>

            <div className="bg-[#121828] border border-[#24314e] rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-[#1e293e] flex items-center justify-between">
                <h3 className="font-black text-sm text-white">Fleet Telemetry Diagnostics</h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">37 Devices Monitored</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1e293e] text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Bus ID</th>
                      <th className="py-3 px-4">Conductor</th>
                      <th className="py-3 px-4">GPS Health</th>
                      <th className="py-3 px-4">HDOP Accuracy</th>
                      <th className="py-3 px-4">Signal Age</th>
                      <th className="py-3 px-4">Occupancy</th>
                      <th className="py-3 px-4">Anomaly Score</th>
                      <th className="py-3 px-4">Corridor Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293e]/60 font-medium">
                    {buses.map((bus) => (
                      <tr key={bus.id} className="hover:bg-[#161f33] transition">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <span className="bg-[#1c253b] px-2 py-0.5 rounded font-mono mr-1.5 text-cyan-300">
                            Bus {bus.busNumber}
                          </span>
                          <span className="text-slate-400">{bus.regNumber}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{bus.driverName}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            bus.gpsHealth === 'HEALTHY'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : bus.gpsHealth === 'WEAK'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {bus.gpsHealth}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {bus.gpsAccuracy || 6.5} m
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {bus.signalAgeSeconds || 0}s ago
                        </td>
                        <td className="py-3.5 px-4 text-purple-400 font-bold">
                          {bus.passengersCarried}/44 ({bus.occupancy})
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                          {bus.anomalyScore || 0}/100
                        </td>
                        <td className="py-3.5 px-4">
                          {bus.isDeviated ? (
                            <span className="text-cyan-400 font-bold">🔵 OUT OF ROUTE</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">🟢 ON ROUTE</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Incident Alert Center */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Incident Alert Center</h2>
                <p className="text-xs text-slate-400">
                  Real-time alerts for corridor deviations, GPS dropouts, SOS signals and delay reports.
                </p>
              </div>

              <div className="flex items-center space-x-1.5 bg-[#121828] p-1 rounded-2xl border border-[#1e293e] text-xs font-bold">
                {(['UNRESOLVED', 'ALL', 'CRITICAL', 'WARNING'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setAlertFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl transition ${
                      alertFilter === f
                        ? 'bg-cyan-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="p-12 text-center bg-[#121828] border border-[#1e293e] rounded-3xl space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="font-extrabold text-sm text-white">All Fleet Operations Normal</h4>
                  <p className="text-xs text-slate-400">No active unresolved alerts matching filter.</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-3xl border transition flex items-start justify-between ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950/30 border-rose-800/80'
                        : 'bg-[#121828] border-[#1e293e]'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-2xl mt-0.5 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-rose-900/60 text-rose-400'
                          : 'bg-amber-900/60 text-amber-400'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-sm text-white">{alert.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Triggered: {new Date(alert.timestamp).toLocaleTimeString()} • Bus: {alert.busId}
                        </p>
                      </div>
                    </div>

                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0d121f] hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 6: 37 Buses & Conductors Directory */}
        {activeTab === 'fleet-mgmt' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-white">All 37 PSIT Buses & Conductor Directory</h2>
              <p className="text-xs text-slate-400">Complete fleet roster, conductor contacts, and route mappings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {buses.map((bus) => {
                const r = routes.find((route) => route.id === bus.routeId);
                return (
                  <div key={bus.id} className="bg-[#121828] border border-[#24314e] p-5 rounded-3xl shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-950 bg-cyan-400 px-3 py-1 rounded-xl font-mono">
                        Bus {bus.busNumber}
                      </span>
                      <span className="text-xs font-mono text-cyan-300 font-bold">{bus.regNumber}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-white">{r?.name}</p>
                      <p className="text-slate-400">Capacity: 44 seats • <strong>{bus.passengersCarried} carried</strong></p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs flex justify-between items-center text-slate-300">
                      <span>Conductor: <strong className="text-white">{bus.driverName}</strong></span>
                      <a href={`tel:${bus.driverPhone}`} className="text-cyan-400 font-mono font-bold hover:underline">
                        {bus.driverPhone}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 7: IoT Hardware Hub */}
        {activeTab === 'iot-config' && (
          <div className="bg-[#121828] border border-[#24314e] rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Decoupled IoT Hardware Gateway</h3>
                <p className="text-xs text-slate-400">Standard AIS-140 GPS Device Ingestion Protocol</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              YatraSetu features an open, decoupled ingestion pipeline. Any physical GPS/OBD-II hardware device installed in buses can send telemetry to <code className="text-cyan-400 bg-[#0d121f] px-2 py-0.5 rounded border border-[#1e293e] font-mono">POST /gps/update</code>.
            </p>

            <div className="bg-[#0d121f] p-4 rounded-2xl border border-[#1e293e] text-xs font-mono text-cyan-400">
              <pre className="overflow-x-auto">
{`POST /gps/update
{
  "busId": "BUS-5081",
  "latitude": 26.4380,
  "longitude": 80.3950,
  "speed": 34.5,
  "heading": 75.0,
  "accuracy": 5.2,
  "source": "IOT_DEVICE",
  "timestamp": "2026-08-15T08:15:30Z"
}`}
              </pre>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
