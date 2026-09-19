import React from 'react';
import { Shield, Activity, Terminal, AlertTriangle, RefreshCw, Play, Sparkles } from 'lucide-react';
import { SystemMetrics, SystemMode } from '../types';

interface NavbarProps {
  activeTab: 'overview' | 'detections' | 'investigation' | 'response' | 'experiments';
  setActiveTab: (tab: 'overview' | 'detections' | 'investigation' | 'response' | 'experiments') => void;
  metrics: SystemMetrics | null;
  onRunSimulation: (scenario: string) => void;
  onResetDemo: () => void;
  onOpenDemoWalkthrough: () => void;
  simulating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onRunSimulation,
  onResetDemo,
  onOpenDemoWalkthrough,
  simulating
}) => {
  const getModeBadge = (mode?: SystemMode) => {
    switch (mode) {
      case 'LIGHT':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>MODE: LIGHT (LOW COST)</span>;
      case 'WATCH':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-950/80 text-blue-400 border border-blue-800/60 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>MODE: WATCH (ELEVATED)</span>;
      case 'INVESTIGATE':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>MODE: INVESTIGATE (HYBRID ML)</span>;
      case 'CONTAIN':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>MODE: CONTAIN (ACTIVE RESPONSE)</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-teal-950/80 text-teal-300 border border-teal-800/60 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>MODE: VERIFIED (SHA-256 OK)</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 text-slate-400">MODE: STANDBY</span>;
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Project Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-950/40 border border-cyan-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-wider text-slate-100 font-mono">CYRA</span>
                <span className="text-[11px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">RESEARCH v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Cybersecurity Yielding Resilient Adaptive Defense</p>
            </div>
          </div>

          {/* Operational Badges */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Source:</span>
              {metrics?.endpoint_status === 'DEFENDER_ACTIVE' ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  LIVE ENDPOINT TELEMETRY
                </span>
              ) : (
                <span className="text-amber-400 font-medium flex items-center gap-1" title="Controlled test harness active in CYRA_TEST_ENVIRONMENT">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  CONTROLLED SIMULATION
                </span>
              )}
            </div>

            {getModeBadge(metrics?.current_system_mode)}
          </div>

          {/* Demo Actions & Simulation Controls */}
          <div className="flex items-center gap-2">
            <button
              id="demo-walkthrough-button"
              onClick={onOpenDemoWalkthrough}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Walkthrough</span>
            </button>

            <button
              id="run-safe-simulation-button"
              disabled={simulating}
              onClick={() => onRunSimulation('COMBINED_RANSOMWARE_LIKE_ACTIVITY')}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-600/90 hover:bg-rose-500 text-white flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              title="Injects non-destructive behavioral pattern into CYRA_TEST_ENVIRONMENT"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{simulating ? 'Injecting...' : 'Run Safe Simulation'}</span>
            </button>

            <button
              id="reset-demo-button"
              onClick={onResetDemo}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md border border-slate-800 transition-colors"
              title="Reset test environment & telemetry baseline"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Tab Navigation Bar (Strictly 5 focused tabs per user prompt) */}
        <nav className="flex space-x-1 py-1.5 border-t border-slate-800/80 overflow-x-auto text-xs font-medium">
          <button
            id="nav-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Overview</span>
          </button>

          <button
            id="nav-tab-detections"
            onClick={() => setActiveTab('detections')}
            className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'detections'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Detections</span>
            {metrics?.active_incidents ? (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                {metrics.active_incidents}
              </span>
            ) : null}
          </button>

          <button
            id="nav-tab-investigation"
            onClick={() => setActiveTab('investigation')}
            className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'investigation'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>3. Investigation (XAI & Hybrid ML)</span>
          </button>

          <button
            id="nav-tab-response"
            onClick={() => setActiveTab('response')}
            className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'response'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>4. Response & Recovery</span>
            {metrics?.contained_incidents ? (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-950 text-amber-400 border border-amber-800">
                {metrics.contained_incidents}
              </span>
            ) : null}
          </button>

          <button
            id="nav-tab-experiments"
            onClick={() => setActiveTab('experiments')}
            className={`px-4 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'experiments'
                ? 'bg-slate-800 text-cyan-400 font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>5. Experiments & Metrics</span>
          </button>
        </nav>

      </div>
    </header>
  );
};
