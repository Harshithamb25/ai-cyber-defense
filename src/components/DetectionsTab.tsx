import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, AlertTriangle, ShieldCheck, Terminal } from 'lucide-react';
import { DetectionEvent, EventSeverity, EventSource } from '../types';

interface DetectionsTabProps {
  events: DetectionEvent[];
  onSelectEventForInvestigation: (eventId: string) => void;
}

export const DetectionsTab: React.FC<DetectionsTabProps> = ({
  events,
  onSelectEventForInvestigation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = 
        e.detection_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.process_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.affected_file && e.affected_file.toLowerCase().includes(searchQuery.toLowerCase())) ||
        e.event_id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === 'ALL' || e.severity === severityFilter;
      const matchesSource = sourceFilter === 'ALL' || e.source === sourceFilter;

      return matchesSearch && matchesSeverity && matchesSource;
    });
  }, [events, searchQuery, severityFilter, sourceFilter]);

  return (
    <div className="space-y-4">
      
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="detection-search-input"
            type="text"
            placeholder="Search process, file, or detection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity & Source Selectors */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          <select
            id="detection-severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
            <option value="INFORMATIONAL">Informational</option>
          </select>

          <div className="flex items-center gap-1 text-slate-400 ml-2">
            <span>Source:</span>
          </div>
          <select
            id="detection-source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sources</option>
            <option value="LIVE ENDPOINT TELEMETRY">Live Telemetry</option>
            <option value="CONTROLLED SIMULATION">Controlled Simulation</option>
          </select>

          <span className="text-slate-500 font-mono ml-auto sm:ml-2">
            {filteredEvents.length} results
          </span>
        </div>

      </div>

      {/* Main Detections Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Event ID</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Detection Name</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Process / PID</th>
                <th className="py-3 px-3">Files / Spread</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans">
                    No detections match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.event_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-semibold text-[11px]">
                      {event.event_id}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200 line-clamp-1" title={event.detection_name}>
                        {event.detection_name}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 font-sans mt-0.5">
                        {event.affected_file || 'No single target file'}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        event.source === 'LIVE ENDPOINT TELEMETRY' 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {event.source === 'LIVE ENDPOINT TELEMETRY' ? 'LIVE DEFENDER' : 'SIMULATION'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{event.process_name}</div>
                      <div className="text-[10px] text-slate-500">PID: {event.process_id || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <div>{event.files_modified + event.files_renamed} files</div>
                      <div className="text-[10px] text-slate-500">{event.directory_spread} dirs</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        event.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        event.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        event.severity === 'MEDIUM' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {Math.round(event.confidence * 100)}%
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelectEventForInvestigation(event.event_id)}
                        className="px-2.5 py-1.5 text-xs rounded-md bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
