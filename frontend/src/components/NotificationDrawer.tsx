import React from 'react';
import { useTransitStore } from '../store/useTransitStore';
import { X, AlertTriangle, Radio, Navigation, Zap, CheckCircle2, ShieldAlert, Clock, Bell } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { notificationDrawerOpen, setNotificationDrawerOpen, alerts, resolveAlert } = useTransitStore();

  if (!notificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0d121f] border-l border-[#1e293e] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1e293e] flex items-center justify-between bg-[#121828]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-wide">
                  Real-time Notifications
                </h3>
                <p className="text-xs text-slate-400">
                  Fleet alerts, SOS signals & delay announcements
                </p>
              </div>
            </div>

            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-3.5 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-75" />
                <h4 className="text-sm font-bold text-white">All Clear!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  No active incidents or service delays reported across the 37 PSIT bus routes.
                </p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isSOS = alert.type === 'EMERGENCY_SOS';
                const isCritical = alert.severity === 'CRITICAL';

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition relative space-y-2 ${
                      isSOS
                        ? 'bg-rose-950/40 border-rose-600/80 shadow-lg shadow-rose-950/30'
                        : isCritical
                        ? 'bg-[#181124] border-purple-500/40'
                        : 'bg-[#121828] border-[#1e293e]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {isSOS ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                        ) : (
                          <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-purple-400' : 'text-amber-400'}`} />
                        )}
                        <h4 className="font-extrabold text-xs text-white">{alert.title}</h4>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isSOS
                          ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                          : isCritical
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-mono border-t border-slate-800/60">
                      <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                      
                      {!alert.resolved ? (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-slate-500">Resolved ✓</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#121828] border-t border-[#1e293e] text-center text-xs text-slate-400">
            YatraSetu Incident Management System
          </div>

        </div>
      </div>
    </div>
  );
};
