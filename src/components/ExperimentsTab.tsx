import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, LineChart, Line 
} from 'recharts';
import { Activity, Cpu, Layers, Zap, CheckCircle2, TrendingDown } from 'lucide-react';
import { ExperimentArchitectureMetric } from '../types';

export const ExperimentsTab: React.FC = () => {
  const [comparisons, setComparisons] = useState<ExperimentArchitectureMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/experiments')
      .then(res => res.json())
      .then(data => {
        setComparisons(data.comparisons || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 font-mono text-xs">
        Loading experimental benchmark data...
      </div>
    );
  }

  // Transform data for charts
  const performanceChartData = comparisons.map(c => ({
    name: c.architecture_id.replace('ARCH-', '').replace('-ADAPTIVE', ' (Proposed)'),
    Precision: Number((c.precision * 100).toFixed(1)),
    Recall: Number((c.recall * 100).toFixed(1)),
    F1: Number((c.f1_score * 100).toFixed(1))
  }));

  const efficiencyChartData = comparisons.map(c => ({
    name: c.architecture_id.replace('ARCH-', '').replace('-ADAPTIVE', ' (Proposed)'),
    CPU_Overhead: c.cpu_overhead_percent,
    ML_Invocation_Rate: c.ml_invocation_rate,
    Latency_ms: c.detection_latency_ms
  }));

  return (
    <div className="space-y-6">
      
      {/* Research Thesis Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Architecture Modeling: Detection Quality vs. Computational Cost</span>
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            Analytical Simulation Projections
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Evaluating trade-offs between continuous deep neural inference and selective hybrid invocation.
          Under modeled workloads, CYRA achieves projected parity in F1 detection (<strong className="text-emerald-400">97.1%</strong>) while reducing 
          the Deep Analysis Invocation Rate (<strong className="text-cyan-400">DAIR</strong>) from <strong className="text-rose-400">100%</strong> to <strong className="text-emerald-400">14.2%</strong> and continuous CPU overhead to <strong className="text-emerald-400">3.4%</strong>.
          <span className="block mt-1 text-[11px] text-slate-500 italic">
            *Notice: Metrics reflect architectural simulation baselines and analytical projections for evaluation, not claims of an offline-trained empirical production corpus.
          </span>
        </p>
      </div>

      {/* 1. ARCHITECTURAL COMPARISON TABLE */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Model & Architecture Comparison Table
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">6 Evaluated Pipelines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Architecture</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">FP Rate</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">CPU Overhead</th>
                <th className="py-2.5 px-3">ML Invocation (DAIR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comparisons.map((c) => {
                const isProposed = c.architecture_id.includes('CYRA');
                return (
                  <tr key={c.architecture_id} className={`transition-colors ${isProposed ? 'bg-cyan-950/20 font-semibold' : 'hover:bg-slate-800/30'}`}>
                    <td className="py-3 px-3 text-slate-200">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">{c.description}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{(c.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-slate-300">{(c.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isProposed ? 'text-emerald-400 bg-emerald-950 border border-emerald-800' : 'text-slate-300'}`}>
                        {(c.f1_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{(c.false_positive_rate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-3 text-slate-300">{c.detection_latency_ms} ms</td>
                    <td className="py-3 px-3">
                      <span className={`${c.cpu_overhead_percent > 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {c.cpu_overhead_percent}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${c.ml_invocation_rate === 100 ? 'text-rose-400 bg-rose-950' : 'text-cyan-300 bg-cyan-950 border border-cyan-800'}`}>
                        {c.ml_invocation_rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. RECHARTS COMPARATIVE CHARTS (2 Charts: Detection Quality & Resource Efficiency) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Detection Performance Comparison */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              1. Detection Performance Comparison (%)
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">F1 vs Precision vs Recall</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" domain={[70, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Precision" fill="#38bdf8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Recall" fill="#818cf8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="F1" fill="#34d399" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Computational Overhead & ML Invocation Rate */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              2. Computational Overhead vs. ML Invocation Rate (DAIR)
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono">85.8% DAIR Reduction</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={efficiencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="ML_Invocation_Rate" name="ML Invocation (DAIR %)" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="CPU_Overhead" name="CPU Overhead (%)" fill="#fbbf24" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Research Takeaway Key Takeaway Card */}
      <div className="p-4 rounded-xl border border-teal-800/80 bg-teal-950/20 text-xs text-teal-200 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-mono text-teal-300 uppercase tracking-wider block">Key Research Finding for Viva & Presentation:</strong>
          <p className="text-slate-300 font-sans leading-relaxed">
            By delegating continuous event filtering to lightweight endpoint telemetry and honeyfile tripwires, CYRA suppresses unnecessary ML invocations during benign bursts (e.g. IDE builds, backups). Expensive hybrid models (RF + XGBoost + Isolation Forest) run only when anomalous metadata surfaces, maintaining high detection efficacy with a fraction of the computational footprint.
          </p>
        </div>
      </div>

    </div>
  );
};
