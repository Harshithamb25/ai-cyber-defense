import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Lock, RotateCcw, CheckCircle2, 
  AlertOctagon, FileCheck, Terminal, RefreshCw, Hash, Eye
} from 'lucide-react';
import { IncidentRecord, ResponseAction, TestEnvironmentFile } from '../types';

interface ResponseTabProps {
  incidents: IncidentRecord[];
  onContainIncident: (id: string) => void;
  onRecoverIncident: (id: string) => void;
  onRefresh: () => void;
}

export const ResponseTab: React.FC<ResponseTabProps> = ({
  incidents,
  onContainIncident,
  onRecoverIncident,
  onRefresh
}) => {
  const [testFiles, setTestFiles] = useState<TestEnvironmentFile[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchTestEnvironment = () => {
    setLoadingFiles(true);
    fetch('/api/test-environment')
      .then(res => res.json())
      .then(data => {
        setTestFiles(data.files || []);
        setLoadingFiles(false);
      })
      .catch(() => setLoadingFiles(false));
  };

  useEffect(() => {
    fetchTestEnvironment();
  }, [incidents]);

  const activeIncident = incidents.find(i => i.incident_id === selectedIncidentId) || (incidents.length > 0 ? incidents[0] : null);

  const getLifecycleStepClass = (step: 'DETECTED' | 'VERIFIED' | 'CONTAINED' | 'RECOVERED', currentStatus?: string) => {
    const order = ['DETECTED', 'VERIFIED', 'CONTAINED', 'RECOVERED'];
    const currentIndex = order.indexOf(currentStatus || 'DETECTED');
    const stepIndex = order.indexOf(step);

    if (stepIndex <= currentIndex) {
      return 'border-cyan-500 bg-cyan-950 text-cyan-300 font-bold';
    }
    return 'border-slate-800 bg-slate-950 text-slate-500';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Context */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automated Incident Containment & SHA-256 Cryptographic Recovery</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Operating strictly inside isolated <code className="text-cyan-300 font-mono">CYRA_TEST_ENVIRONMENT/</code> sandbox.
          </p>
        </div>

        <button
          onClick={() => { fetchTestEnvironment(); onRefresh(); }}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh File Audits</span>
        </button>
      </div>

      {/* Incident Lifecycle Visualizer */}
      {activeIncident ? (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">INCIDENT:</span>
                <span className="text-sm font-bold text-slate-100 font-mono">{activeIncident.incident_id}</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  RISK: {activeIncident.risk_score}/100 ({activeIncident.risk_band})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{activeIncident.detection_name}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {activeIncident.status === 'DETECTED' && (
                <button
                  onClick={() => onContainIncident(activeIncident.incident_id)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Execute Containment</span>
                </button>
              )}

              {(activeIncident.status === 'CONTAINED' || activeIncident.status === 'DETECTED') && (
                <button
                  onClick={() => onRecoverIncident(activeIncident.incident_id)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-teal-950/40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Initiate Controlled Recovery</span>
                </button>
              )}

              {activeIncident.status === 'RECOVERED' && (
                <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Integrity Verified & Resolved</span>
                </span>
              )}
            </div>
          </div>

          {/* 5-Step Progress Bar */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Incident Lifecycle State Progression:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono text-center">
              <div className={`p-2.5 rounded-lg border ${getLifecycleStepClass('DETECTED', activeIncident.status)}`}>
                <div>1. DETECTED</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Telemetry Ingestion</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${getLifecycleStepClass('VERIFIED', activeIncident.status)}`}>
                <div>2. VERIFIED</div>
                <div className="text-[10px] text-slate-400 mt-0.5">XAI & Hybrid ML</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${getLifecycleStepClass('CONTAINED', activeIncident.status)}`}>
                <div>3. CONTAINED</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Halt & Isolate</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${getLifecycleStepClass('RECOVERED', activeIncident.status)}`}>
                <div>4. RECOVERED</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Baseline Restore</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${activeIncident.status === 'RECOVERED' ? 'border-teal-500 bg-teal-950 text-teal-300 font-bold' : 'border-slate-800 bg-slate-950 text-slate-500'}`}>
                <div>5. AUDIT OK</div>
                <div className="text-[10px] text-slate-400 mt-0.5">SHA-256 Verified</div>
              </div>
            </div>
          </div>

          {/* Action Audit Trail */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Executed Response Actions Log:
            </div>
            <div className="space-y-2">
              {activeIncident.actions_taken.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  No automated actions executed yet. Click "Execute Containment" to isolate suspicious processes.
                </p>
              ) : (
                activeIncident.actions_taken.map((act) => (
                  <div key={act.action_id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400">{act.action}</span>
                      <span className="text-slate-500">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 font-sans">{act.reason}</p>
                    
                    {/* Cryptographic SHA-256 Hash Comparison */}
                    {act.integrity_verified && act.pre_incident_hash && (
                      <div className="mt-2 p-2.5 rounded bg-slate-900 border border-teal-800/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-teal-400 font-bold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>CRYPTOGRAPHIC INTEGRITY: VERIFIED</span>
                          </span>
                          <span className="text-[10px] bg-teal-950 px-2 py-0.5 rounded border border-teal-700">MATCH 100%</span>
                        </div>
                        <div className="text-slate-400 truncate">
                          Pre-Incident Baseline Hash: <span className="text-slate-200">{act.pre_incident_hash}</span>
                        </div>
                        <div className="text-slate-400 truncate">
                          Post-Recovery Target Hash: <span className="text-slate-200">{act.post_recovery_hash}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-500">
          <p>No active incidents registered in CYRA database.</p>
          <p className="text-xs mt-1">Run a safe ransomware simulation from the top navigation to test the full response lifecycle.</p>
        </div>
      )}

      {/* Test Environment Sandbox File Inspector */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Live Test Environment Sandbox Files (CYRA_TEST_ENVIRONMENT/)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{testFiles.length} files monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">SHA-256 Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {testFiles.map((file) => (
                <tr key={file.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {file.name}
                  </td>
                  <td className="py-2.5 px-3">
                    {file.is_honey_file ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                        DECOY HONEYFILE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                        Standard Asset
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{file.size_bytes} B</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      file.status === 'CLEAN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      file.status === 'RESTORED' ? 'bg-teal-950 text-teal-300 border border-teal-800' :
                      file.status === 'ENCRYPTED_SIMULATION' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs" title={file.sha256}>
                    {file.sha256}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
