import React from 'react';
import { Sparkles, AlertTriangle, TrendingUp, CheckCircle, Brain, Zap, Fuel, Activity } from 'lucide-react';
import { useTransitStore } from '../store/useTransitStore';

export const AIInsightsPanel: React.FC = () => {
  const { buses, alerts } = useTransitStore();

  const activeBuses = buses.filter((b) => b.status === 'LIVE').length;
  const delayedBuses = buses.filter((b) => b.status === 'DELAYED').length;
  const onTimePercentage = Math.round((activeBuses / (buses.length || 1)) * 100);

  return (
    <div className="space-y-4">
      
      {/* Header with AI Icon */}
      <div className="flex items-center space-x-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider">
        <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <Brain className="w-4 h-4 text-purple-400" />
        </div>
        <span className="text-white font-extrabold text-base">AI Fleet Insights</span>
      </div>

      {/* Insight Card 1: Warning / Telemetry Alert */}
      <div className="bg-[#121828] border border-[#24314e] hover:border-amber-500/50 p-4 rounded-2xl transition shadow-lg space-y-2">
        <div className="flex items-center space-x-2.5 text-amber-400">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-extrabold text-xs text-slate-100">Speed & Corridor Monitoring</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {delayedBuses > 0
            ? `${delayedBuses} buses delayed due to Rama Devi bottleneck. Real-time ETA calibrated automatically.`
            : 'All 37 PSIT bus corridors flowing smoothly. Average urban cruising speed: 34.2 km/h.'}
        </p>
        <span className="text-[10px] text-slate-500 font-mono block">Real-time model • 2 mins ago</span>
      </div>

      {/* Insight Card 2: Cost & Route Efficiency */}
      <div className="bg-[#121828] border border-[#24314e] hover:border-emerald-500/50 p-4 rounded-2xl transition shadow-lg space-y-2">
        <div className="flex items-center space-x-2.5 text-emerald-400">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-extrabold text-xs text-slate-100">Route & Fuel Optimization</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Dynamic corridor tracking reduced peak idle dwell times by 18% along Kanpur NH-19 corridor this week.
        </p>
        <span className="text-[10px] text-slate-500 font-mono block">Weekly analysis • 1 day ago</span>
      </div>

      {/* Insight Card 3: Schedule Adherence */}
      <div className="bg-[#121828] border border-[#24314e] hover:border-cyan-500/50 p-4 rounded-2xl transition shadow-lg space-y-2">
        <div className="flex items-center space-x-2.5 text-cyan-400">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-extrabold text-xs text-slate-100">Campus Arrival Accuracy</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {onTimePercentage}% of morning routes arrived at PSIT Campus prior to the 8:45 AM bell.
        </p>
        <span className="text-[10px] text-slate-500 font-mono block">Today 8:45 AM</span>
      </div>

      {/* Bottom 2 Mini Metric Widgets */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        
        {/* AI Predictions */}
        <div className="bg-[#121828] border border-[#24314e] p-3.5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">AI Accuracy</span>
            <div className="text-lg font-black text-white mt-0.5">96.4%</div>
            <span className="text-[9px] text-purple-400 font-medium">ETA Precision</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
        </div>

        {/* Saved Fuel / Metrics */}
        <div className="bg-[#121828] border border-[#24314e] p-3.5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Saved Fuel</span>
            <div className="text-lg font-black text-white mt-0.5">₹42,800</div>
            <span className="text-[9px] text-emerald-400 font-medium">Monthly Optimization</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

      </div>

    </div>
  );
};
