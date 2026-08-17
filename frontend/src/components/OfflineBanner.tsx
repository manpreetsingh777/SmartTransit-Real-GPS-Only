import React from 'react';
import { useTransitStore } from '../store/useTransitStore';
import { storageService } from '../services/storage';
import { Database, WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { connectionState, init } = useTransitStore();
  const lastSync = storageService.getLastSyncTimestamp();

  if (connectionState === 'LIVE') return null;

  return (
    <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-800/60 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-amber-300">
          {connectionState === 'CACHED' ? (
            <Database className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-400" />
          )}
          <span className="font-bold">
            {connectionState === 'CACHED' ? '🟠 CACHED MODE' : '🔴 OFFLINE MODE'}:
          </span>
          <span className="text-slate-300">
            {connectionState === 'CACHED'
              ? 'Displaying offline cached schedules & route corridors. GPS telemetry is simulated.'
              : 'Central server connection unavailable. Using local transport cache.'}
          </span>
          {lastSync && (
            <span className="text-[11px] text-amber-400/80 font-mono hidden md:inline">
              (Cached: {new Date(lastSync).toLocaleTimeString()})
            </span>
          )}
        </div>

        <button
          onClick={() => init()}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700 font-semibold text-[11px] transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Retry Live Link</span>
        </button>
      </div>
    </div>
  );
};
