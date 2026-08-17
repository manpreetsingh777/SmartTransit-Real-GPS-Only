import React from 'react';
import { useTransitStore } from '../store/useTransitStore';
import { Bus, Navigation, ShieldCheck, Wifi, WifiOff, Database, Sparkles, Bell, Search, Settings, Sun, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    connectionState,
    setDemoModalOpen,
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    searchQuery,
    setSearchQuery,
    alerts
  } = useTransitStore();

  const unreadAlertsCount = alerts.filter((a) => !a.resolved).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/95 backdrop-blur-xl border-b border-[#1c253b] shadow-2xl">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bus className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">YatraSetu</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-800/80 font-bold tracking-wider uppercase hidden sm:inline">
                  PSIT Kanpur Fleet
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden lg:block">
                Connecting Passengers, Buses & Authorities
              </p>
            </div>
          </div>

          {/* Central Search Input Bar (Matching the reference screenshot style) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bus number (5081, 4218), route, or stop..."
                className="w-full pl-10 pr-4 py-2 bg-[#121828] border border-[#222f4c] rounded-full text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
              />
            </div>
          </div>

          {/* Role Navigation Switcher Pills */}
          <nav className="flex items-center bg-[#121828] p-1 rounded-2xl border border-[#1e293e]">
            <button
              onClick={() => setCurrentRole('passenger')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'passenger'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a233a]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Passenger</span>
              <span className="sm:hidden">User</span>
            </button>

            <button
              onClick={() => setCurrentRole('driver')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'driver'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a233a]'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Driver App</span>
            </button>

            <button
              onClick={() => setCurrentRole('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1a233a]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Fleet</span>
              {unreadAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          </nav>

          {/* Right Action Icons: Notification Bell, Live Status, SIH Demo Trigger */}
          <div className="flex items-center space-x-2.5">
            
            {/* Notification Bell with unread badge */}
            <button
              onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
              className="relative p-2 rounded-xl bg-[#121828] border border-[#222f4c] text-slate-300 hover:text-white hover:border-cyan-500/50 transition"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Live Connection Badge */}
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#121828] border border-[#222f4c] text-xs font-bold">
              {connectionState === 'LIVE' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-neon-pulse"></span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <Wifi className="w-3.5 h-3.5" /> LIVE
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                    <Database className="w-3.5 h-3.5" /> CACHED
                  </span>
                </>
              )}
            </div>

            {/* SIH Scenario Controller Trigger Button */}
            <button
              onClick={() => setDemoModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">SIH Triggers</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
