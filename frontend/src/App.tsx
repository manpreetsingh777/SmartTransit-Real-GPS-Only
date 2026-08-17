import React, { useEffect } from 'react';
import { useTransitStore } from './store/useTransitStore';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { NotificationDrawer } from './components/NotificationDrawer';
import { PassengerPortal } from './pages/PassengerPortal';
import { DriverTerminal } from './pages/DriverTerminal';
import { AdminDashboard } from './pages/AdminDashboard';

export const App: React.FC = () => {
  const { init, currentRole } = useTransitStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar />

      {/* Offline/Cached Mode Toast Banner */}
      <OfflineBanner />

      {/* Role-based Active Interface */}
      <div className="flex-1">
        {currentRole === 'passenger' && <PassengerPortal />}
        {currentRole === 'driver' && <DriverTerminal />}
        {currentRole === 'admin' && <AdminDashboard />}
      </div>

      {/* Side Notification Drawer */}
      <NotificationDrawer />

      {/* Bottom Footer */}
      <footer className="bg-[#0b0f19] border-t border-[#1c253b] py-6 text-center text-xs text-slate-500">
        <div className="max-w-[1720px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-white">YatraSetu</strong> • Connecting Passengers, Buses & Authorities (PSIT Kanpur SIH Prototype)
          </div>
          <div className="font-mono text-[11px] text-cyan-400/80">
            Official 37 PSIT Bus Corridors • Passenger Capacity: 30 to 44
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
