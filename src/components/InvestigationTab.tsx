import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Shield, ShieldAlert, Cpu, BarChart3, 
  ArrowRight, CheckCircle, Terminal, Layers, FileCode, Clock, Lock
} from 'lucide-react';
import { DetectionEvent, InvestigationResult } from '../types';

interface InvestigationTabProps {
  selectedEventId: string | null;
  events: DetectionEvent[];
  onSelectEvent: (id: string) => void;
  onContainIncident?: (incidentId: string) => void;
  onNavigateToResponse: () => void;
}

export const InvestigationTab: React.FC<InvestigationTabProps> = ({
  selectedEventId,
  events,
  onSelectEvent,
  onNavigateToResponse
}) => {
  const [investigation, setInvestigation] = useState<InvestigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch investigation data whenever selectedEventId changes
  useEffect(() => {
    const targetId = selectedEventId || (events.length > 0 ? events[0].event_id : null);
    if (!targetId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/investigate/${targetId}`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch investigation');
        return res.json();
      })
      .then(data => {
        setInvestigation(data.investigation);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedEventId, events]);

  if (!investigation && loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-mono text-xs">Invoking selective XAI & Hybrid ML pipeline...</p>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="p-8 text-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
        <p className="text-sm">No detection selected for deep investigation.</p>
        <p className="text-xs text-slate-500 mt-1">Select an event from the Detections table to inspect.</p>
      </div>
    );
  }

  const { event, xai, model_scores, fusion, recommended_response } = investigation;

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-rose-400 border-rose-800 bg-rose-950/40';
    if (score >= 60) return 'text-amber-400 border-amber-800 bg-amber-950/40';
    if (score >= 30) return 'text-yellow-400 border-yellow-800 bg-yellow-950/40';
    return 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
  };

  return (
    <div className="space-y-6">
      
      {/* Investigation Selector Bar */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current Investigation Target:</span>
          <select
            value={event.event_id}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            {events.map(ev => (
              <option key={ev.event_id} value={ev.event_id}>
                {ev.event_id} - {ev.detection_name} ({ev.severity})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Source:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${
            event.source === 'LIVE ENDPOINT TELEMETRY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
          }`}>
            {event.source}
          </span>
          <span className="text-slate-600">|</span>
          <span>Timestamp: {new Date(event.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 1. DETECTION HEADER CARD */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-950 border border-rose-800/80 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100 font-mono">{event.detection_name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  event.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  event.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  SEVERITY: {event.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Primary Target: <code className="text-cyan-400">{event.affected_file || 'CYRA_TEST_ENVIRONMENT'}</code></p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div>Process: <strong className="text-slate-200">{event.process_name}</strong> (PID: {event.process_id || 'N/A'})</div>
            <div>Parent: <span className="text-amber-300">{event.parent_process || 'None'}</span></div>
          </div>
        </div>

        {/* 2. METADATA EXTRACTION GRID */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Extracted Behavioral Telemetry Metadata</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">Write Burst Rate</span>
              <span className="text-sm font-bold text-slate-200">{event.write_rate} /10s</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">Extension Mutations</span>
              <span className={`text-sm font-bold ${event.extension_mutations > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {event.extension_mutations}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">Entropy Delta</span>
              <span className={`text-sm font-bold ${event.entropy_change > 0.2 ? 'text-rose-400' : 'text-slate-200'}`}>
                +{event.entropy_change.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">Directory Spread</span>
              <span className="text-sm font-bold text-slate-200">{event.directory_spread} folders</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">Rename Rate</span>
              <span className="text-sm font-bold text-slate-200">{event.rename_rate} /10s</span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">Honeyfile Canary</span>
              <span className={`text-sm font-bold ${event.decoy_triggered ? 'text-rose-400' : 'text-emerald-400'}`}>
                {event.decoy_triggered ? 'TRIGGERED' : 'UNTOUCHED'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60">
              <span className="text-[10px] text-slate-500 block">AV Confidence</span>
              <span className="text-sm font-bold text-cyan-400">{Math.round(event.antivirus_confidence * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. WHY FLAGGED? (EXPLAINABLE AI SECTION) */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Explainable AI (XAI) Attribution: "WHY WAS THIS FLAGGED?"
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Local Feature Contribution Analysis</span>
        </div>

        {/* Critical Canary Alert Box if breached */}
        {xai.why_flagged.critical_signal && (
          <div className="p-3.5 rounded-lg border border-rose-700 bg-rose-950/40 text-xs flex items-start gap-2.5 text-rose-200">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-mono text-rose-300 uppercase tracking-wider block mb-0.5">CRITICAL SIGNAL TRIGGERED</strong>
              {xai.why_flagged.critical_signal}
            </div>
          </div>
        )}

        {/* Feature Contribution Horizontal Bar Visualizer */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Behavioral Feature Contributions (Scaled Relative Contribution)
          </div>

          <div className="space-y-2 font-mono text-xs">
            {xai.feature_contributions.map((fc, idx) => {
              const absScore = Math.min(100, Math.abs(fc.contribution) * 2.8);
              const isPositive = fc.contribution >= 0;

              return (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="w-full sm:w-64">
                    <span className="font-semibold text-slate-200">{fc.feature}</span>
                    <div className="text-[10px] text-slate-400 font-sans">Observed: {fc.observed_value}</div>
                  </div>

                  {/* Horizontal Bar Graphic */}
                  <div className="flex-1 px-2 flex items-center gap-3">
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          fc.severity === 'CRITICAL' ? 'bg-gradient-to-r from-rose-600 to-red-500' :
                          fc.severity === 'HIGH' ? 'bg-gradient-to-r from-amber-600 to-rose-500' :
                          fc.severity === 'MEDIUM' ? 'bg-gradient-to-r from-yellow-600 to-amber-500' :
                          'bg-gradient-to-r from-emerald-600 to-teal-500'
                        }`}
                        style={{ width: `${Math.max(6, absScore)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-12 text-right ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isPositive ? `+${fc.contribution}` : fc.contribution}
                    </span>
                  </div>

                  <div className="w-20 text-right">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      fc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      fc.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      fc.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {fc.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Synthesized Natural-Language Rationale */}
        <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70">
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
            Grounded Rationale Summary (Synthesized Directly From Facts):
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            "{xai.natural_language_summary}"
          </p>
        </div>
      </div>

      {/* 4. HYBRID MODEL EVIDENCE ENSEMBLE */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Selective Hybrid Machine Learning Verification
            </h3>
          </div>
          <span className="text-[11px] text-indigo-400 font-mono">Multi-Model Verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          
          {/* Random Forest */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Supervised Model 1</span>
            <span className="text-xs font-bold text-slate-300 mt-1 block">Random Forest</span>
            <div className="mt-2 text-2xl font-bold text-indigo-400">{model_scores.rf_score}%</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Orthogonal trees calibrated</span>
          </div>

          {/* XGBoost */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Supervised Model 2</span>
            <span className="text-xs font-bold text-slate-300 mt-1 block">XGBoost Classifier</span>
            <div className="mt-2 text-2xl font-bold text-cyan-400">{model_scores.xgboost_score}%</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Gradient boosted interactions</span>
          </div>

          {/* Isolation Forest */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Anomaly Model</span>
            <span className="text-xs font-bold text-slate-300 mt-1 block">Isolation Forest</span>
            <div className="mt-2 text-2xl font-bold text-amber-400">{model_scores.anomaly_score}%</div>
            <span className="text-[10px] text-slate-500 mt-1 block">Deviation path length</span>
          </div>

          {/* Temporal Model */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Sequence Model</span>
            <span className="text-xs font-bold text-slate-300 mt-1 block">Temporal Dynamics</span>
            <div className="mt-2 text-2xl font-bold text-purple-400">
              {model_scores.temporal_score !== null ? `${model_scores.temporal_score}%` : 'DORMANT'}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block line-clamp-1">{model_scores.temporal_status_note}</span>
          </div>

        </div>
      </div>

      {/* 5. FINAL CYRA RISK SCORE & EVIDENCE FUSION */}
      <div className={`p-5 rounded-xl border ${getRiskColor(fusion.fused_risk_score)} transition-all space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">CYRA Evidence Fusion Risk Engine</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-black font-mono">{fusion.fused_risk_score}</span>
              <span className="text-sm font-mono text-slate-400">/ 100</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded font-mono uppercase border border-current">
                BAND: {fusion.risk_band}
              </span>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <div>Supervised Weight: {fusion.weights_used.supervised * 100}%</div>
            <div>Anomaly Weight: {fusion.weights_used.anomaly * 100}%</div>
            <div>Contextual Weight: {fusion.weights_used.context * 100}%</div>
            <div>Temporal Weight: {fusion.weights_used.temporal * 100}%</div>
          </div>
        </div>

        {/* Itemized Reasons */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider block mb-2 font-mono">Itemized Correlated Threat Indicators:</span>
          <ul className="space-y-1.5 text-xs">
            {fusion.decision_reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">•</span>
                <span className="text-slate-200">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. RECOMMENDED RESPONSE BAR */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-400">Recommended Response Action: </span>
            <strong className="font-mono text-slate-100 uppercase underline">
              {recommended_response.replace(/_/g, ' ')}
            </strong>
          </div>

          <button
            onClick={onNavigateToResponse}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Execute Response & Rollback Recovery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
