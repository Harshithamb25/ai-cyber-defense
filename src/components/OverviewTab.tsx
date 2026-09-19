import React from 'react';
import { Shield, ShieldAlert, Cpu, AlertOctagon, Terminal, ArrowRight, CheckCircle2, PlayCircle, Eye } from 'lucide-react';
import { DetectionEvent, IncidentRecord, SystemMetrics } from '../types';

interface OverviewTabProps {
  metrics: SystemMetrics | null;
  events: DetectionEvent[];
  incidents: IncidentRecord[];
  onSelectEventForInvestigation: (eventId: string) => void;
  onRunSimulation: (scenario: string) => void;
  simulating: boolean;
  onNavigateToResponse: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  events,
  incidents,
  onSelectEventForInvestigation,
  onRunSimulation,
  simulating,
  onNavigateToResponse
}) => {
  const getStatusDisplay = () => {
    if (!metrics) return { text: 'INITIALIZING', color: 'text-slate-400', bg: 'bg-slate-900 border-slate-800' };
    if (metrics.active_incidents > 0) {
      return { text: 'ACTIVE INCIDENT', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/80', icon: ShieldAlert };
    }
    if (metrics.current_system_mode === 'INVESTIGATE') {
      return { text: 'INVESTIGATING', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/80', icon: AlertOctagon };
    }
    return { text: 'PROTECTED (LIGHT MODE)', color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/60', icon: Shield };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon || Shield;

  const simulationPresets = [
    { id: 'COMBINED_RANSOMWARE_LIKE_ACTIVITY', label: 'Multi-Vector Ransomware', desc: 'Burst write + mutation + decoy canary breach', badge: 'CRITICAL', color: 'border-rose-800 bg-rose-950/30 text-rose-300' },
    { id: 'DECOY_TRIGGER', label: 'Honeyfile Decoy Trigger', desc: 'Tripwire canary document accessed', badge: 'CRITICAL', color: 'border-amber-800 bg-amber-950/30 text-amber-300' },
    { id: 'EXTENSION_MUTATION', label: 'Extension Mutation', desc: 'Rapid rename to .locked extension', badge: 'HIGH', color: 'border-amber-800 bg-amber-950/30 text-amber-300' },
    { id: 'HIGH_ENTROPY_SIMULATION', label: 'High Entropy Spike', desc: 'Simulated high-entropy buffer write (+0.44)', badge: 'HIGH', color: 'border-amber-800 bg-amber-950/30 text-amber-300' },
    { id: 'SUSPICIOUS_BULK_MODIFICATION', label: 'Suspicious Bulk Writes', desc: '110 writes/10s from temp path', badge: 'HIGH', color: 'border-amber-800 bg-amber-950/30 text-amber-300' },
    { id: 'BACKUP_OPERATION', label: 'Backup / Compression', desc: 'Benign 7-Zip archiver (False Positive Test)', badge: 'BENIGN', color: 'border-slate-700 bg-slate-900 text-slate-300' },
    { id: 'IDE_BUILD', label: 'IDE / Build Artifacts', desc: 'tsc compiler bulk output (False Positive Test)', badge: 'BENIGN', color: 'border-slate-700 bg-slate-900 text-slate-300' },
    { id: 'NORMAL_ACTIVITY', label: 'Standard Office Editing', desc: 'Single file text edit (False Positive Test)', badge: 'BENIGN', color: 'border-slate-700 bg-slate-900 text-slate-300' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 5 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. CYRA Status */}
        <div className={`p-4 rounded-xl border ${status.bg} transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CYRA Status</span>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
          </div>
          <p className={`mt-2 text-lg font-bold font-mono ${status.color}`}>{status.text}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Continuous baseline protection</span>
        </div>

        {/* 2. Endpoint Status */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Endpoint Status</span>
            <Terminal className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-lg font-bold font-mono text-slate-100">
            {metrics?.endpoint_status === 'DEFENDER_ACTIVE' ? 'DEFENDER ACTIVE' : 'SIMULATION MODE'}
          </p>
          <span className="text-[11px] text-amber-400 mt-1 block">Host: HP Win11 Laptop Adapter</span>
        </div>

        {/* 3. Current Risk */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Risk</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${
              (metrics?.current_risk || 0) >= 80 ? 'text-rose-400' :
              (metrics?.current_risk || 0) >= 60 ? 'text-amber-400' :
              (metrics?.current_risk || 0) >= 30 ? 'text-yellow-400' : 'text-emerald-400'
            }`}>
              {metrics?.current_risk || 0}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dynamic weighted evidence</span>
        </div>

        {/* 4. Active Incidents */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-100">{metrics?.active_incidents || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Contained: {metrics?.contained_incidents || 0} | Recovered: {metrics?.recovered_incidents || 0}</span>
        </div>

        {/* 5. ML Invocation Rate (DAIR) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider" title="Deep Analysis Invocation Rate">ML Invocation (DAIR)</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-indigo-300">{metrics?.dair || 0}%</span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Low CPU: {metrics?.measured_cpu_overhead_percent || 2.1}%</span>
        </div>

      </div>

      {/* Adaptive Architecture Lifecycle Workflow Visual */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>CYRA Adaptive Operating Architecture</span>
              <span className="text-[10px] text-cyan-400 font-mono font-normal">"Low-Cost Protection, Selective Expensive Intelligence"</span>
            </h3>
          </div>
          <div className="text-xs text-slate-400">
            Active Mode: <strong className="text-cyan-400 font-mono">{metrics?.current_system_mode || 'LIGHT'}</strong>
          </div>
        </div>

        {/* Pipeline Diagram with active highlighting */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 text-xs font-mono">
          <div className={`p-3 rounded-lg border text-center transition-all ${
            metrics?.current_system_mode === 'LIGHT' ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 ring-1 ring-emerald-500' : 'border-slate-800 bg-slate-950/50 text-slate-400'
          }`}>
            <div className="font-bold text-emerald-400">1. LIGHT</div>
            <div className="text-[11px] mt-1 text-slate-400">Continuous low-cost endpoint monitoring</div>
            <div className="text-[10px] text-emerald-500 mt-1">CPU: ~2.1%</div>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            metrics?.current_system_mode === 'WATCH' ? 'border-blue-500 bg-blue-950/60 text-blue-200 ring-1 ring-blue-500' : 'border-slate-800 bg-slate-950/50 text-slate-400'
          }`}>
            <div className="font-bold text-blue-400">2. WATCH</div>
            <div className="text-[11px] mt-1 text-slate-400">Elevated telemetry & honey canary check</div>
            <div className="text-[10px] text-blue-400 mt-1">Metadata collection</div>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            metrics?.current_system_mode === 'INVESTIGATE' ? 'border-amber-500 bg-amber-950/60 text-amber-200 ring-1 ring-amber-500' : 'border-slate-800 bg-slate-950/50 text-slate-400'
          }`}>
            <div className="font-bold text-amber-400">3. INVESTIGATE</div>
            <div className="text-[11px] mt-1 text-slate-400">Hybrid ML (RF + XGB + Iso) & XAI contributions</div>
            <div className="text-[10px] text-amber-400 mt-1">Selective execution</div>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            metrics?.current_system_mode === 'CONTAIN' ? 'border-rose-500 bg-rose-950/60 text-rose-200 ring-1 ring-rose-500' : 'border-slate-800 bg-slate-950/50 text-slate-400'
          }`}>
            <div className="font-bold text-rose-400">4. CONTAIN</div>
            <div className="text-[11px] mt-1 text-slate-400">Halt sandbox process & isolate test directory</div>
            <div className="text-[10px] text-rose-400 mt-1">Safe containment</div>
          </div>

          <div className={`p-3 rounded-lg border text-center transition-all ${
            metrics?.current_system_mode === 'VERIFIED' ? 'border-teal-500 bg-teal-950/60 text-teal-200 ring-1 ring-teal-500' : 'border-slate-800 bg-slate-950/50 text-slate-400'
          }`}>
            <div className="font-bold text-teal-400">5. RECOVER</div>
            <div className="text-[11px] mt-1 text-slate-400">SHA-256 verified cryptographic restoration</div>
            <div className="text-[10px] text-teal-400 mt-1">Audit & return to Light</div>
          </div>
        </div>
      </div>

      {/* Simulation Scenario Launcher */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-cyan-400" />
              <span>Safe Behavioral Test Scenarios</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Controlled behavioral injection strictly inside <code className="text-cyan-300">CYRA_TEST_ENVIRONMENT/</code>. Zero arbitrary file encryption.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {simulationPresets.map(preset => (
            <button
              key={preset.id}
              disabled={simulating}
              onClick={() => onRunSimulation(preset.id)}
              className={`p-3 rounded-lg border text-left transition-all hover:border-cyan-500/60 hover:bg-slate-800/80 cursor-pointer disabled:opacity-50 ${preset.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono">{preset.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-950/60">{preset.badge}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Detections + Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Detections Table (2 columns) */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span>Recent Endpoint Detections</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Total: {events.length}</span>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-2 px-2">Time</th>
                  <th className="py-2 px-2">Detection</th>
                  <th className="py-2 px-2">Source</th>
                  <th className="py-2 px-2">Process</th>
                  <th className="py-2 px-2">Sev</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {events.slice(0, 6).map((ev) => (
                  <tr key={ev.event_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 text-slate-400 text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-2">
                      <span className="font-semibold text-slate-200 line-clamp-1">{ev.detection_name}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        ev.source === 'LIVE ENDPOINT TELEMETRY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {ev.source === 'LIVE ENDPOINT TELEMETRY' ? 'LIVE' : 'SIM'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-300">{ev.process_name}</td>
                    <td className="py-2 px-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        ev.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400' :
                        ev.severity === 'HIGH' ? 'bg-amber-950 text-amber-400' :
                        ev.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        onClick={() => onSelectEventForInvestigation(ev.event_id)}
                        className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 text-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Incidents & Containment Quick Status (1 column) */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Incident Response Queue</span>
              </h3>
              <span className="text-xs text-rose-400 font-mono font-bold">{incidents.length} Records</span>
            </div>

            <div className="mt-3 space-y-2.5">
              {incidents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                  <p>No active incidents.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Run a safe simulation to test containment & recovery.</p>
                </div>
              ) : (
                incidents.slice(0, 3).map((inc) => (
                  <div key={inc.incident_id} className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">{inc.incident_id}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        inc.status === 'RECOVERED' ? 'bg-teal-950 text-teal-400 border border-teal-800' :
                        inc.status === 'CONTAINED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{inc.detection_name}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-500 border-t border-slate-900">
                      <span>Risk: <strong className="text-rose-400">{inc.risk_score}/100</strong></span>
                      <span>Files: {inc.affected_file_count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={onNavigateToResponse}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Open Response & Recovery View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
