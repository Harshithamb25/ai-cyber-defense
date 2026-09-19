import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { DetectionsTab } from './components/DetectionsTab';
import { InvestigationTab } from './components/InvestigationTab';
import { ResponseTab } from './components/ResponseTab';
import { ExperimentsTab } from './components/ExperimentsTab';
import { DemoWalkthroughModal } from './components/DemoWalkthroughModal';
import { DetectionEvent, IncidentRecord, SystemMetrics } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'detections' | 'investigation' | 'response' | 'experiments'>('overview');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [isDemoWalkthroughOpen, setIsDemoWalkthroughOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Fetch all state from server
  const refreshAll = useCallback(async () => {
    try {
      const [statusRes, detectionsRes, incidentsRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/detections'),
        fetch('/api/incidents')
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setMetrics(statusData.metrics);
      }

      if (detectionsRes.ok) {
        const detectionsData = await detectionsRes.json();
        setEvents(detectionsData.events || []);
        if (!selectedEventId && detectionsData.events?.length > 0) {
          setSelectedEventId(detectionsData.events[0].event_id);
        }
      }

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData.incidents || []);
      }
    } catch {
      // Server might be compiling or restarting
    }
  }, [selectedEventId]);

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 4000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  // Show transient notification
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Run behavioral simulation
  const handleRunSimulation = async (scenario: string) => {
    setSimulating(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      if (data.event) {
        setSelectedEventId(data.event.event_id);
        showToast(`Generated: ${data.event.detection_name} (${data.event.severity})`, data.event.severity === 'CRITICAL' ? 'warning' : 'info');
        await refreshAll();
        if (data.investigation) {
          setActiveTab('investigation');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Simulation error', 'warning');
    } finally {
      setSimulating(false);
    }
  };

  // Contain incident
  const handleContainIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/contain`, { method: 'POST' });
      if (res.ok) {
        showToast(`Incident ${incidentId} contained successfully. Sandbox isolated.`, 'warning');
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Containment failed', 'warning');
    }
  };

  // Recover incident
  const handleRecoverIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}/recover`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(`Recovery complete: All test environment files restored. SHA-256 integrity verified.`, 'success');
        await refreshAll();
      }
    } catch (err: any) {
      showToast(err.message || 'Recovery failed', 'warning');
    }
  };

  // Reset demo state
  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('CYRA demonstration state reset to baseline.', 'info');
        await refreshAll();
        setActiveTab('overview');
      }
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'warning');
    }
  };

  const handleSelectEventForInvestigation = (eventId: string) => {
    setSelectedEventId(eventId);
    setActiveTab('investigation');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        onRunSimulation={handleRunSimulation}
        onResetDemo={handleResetDemo}
        onOpenDemoWalkthrough={() => setIsDemoWalkthroughOpen(true)}
        simulating={simulating}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl border text-xs font-mono shadow-2xl flex items-center gap-2.5 ${
            notification.type === 'success' ? 'bg-teal-950 border-teal-700 text-teal-200' :
            notification.type === 'warning' ? 'bg-rose-950 border-rose-700 text-rose-200' :
            'bg-slate-900 border-slate-700 text-slate-200'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            metrics={metrics}
            events={events}
            incidents={incidents}
            onSelectEventForInvestigation={handleSelectEventForInvestigation}
            onRunSimulation={handleRunSimulation}
            simulating={simulating}
            onNavigateToResponse={() => setActiveTab('response')}
          />
        )}

        {activeTab === 'detections' && (
          <DetectionsTab
            events={events}
            onSelectEventForInvestigation={handleSelectEventForInvestigation}
          />
        )}

        {activeTab === 'investigation' && (
          <InvestigationTab
            selectedEventId={selectedEventId}
            events={events}
            onSelectEvent={setSelectedEventId}
            onContainIncident={handleContainIncident}
            onNavigateToResponse={() => setActiveTab('response')}
          />
        )}

        {activeTab === 'response' && (
          <ResponseTab
            incidents={incidents}
            onContainIncident={handleContainIncident}
            onRecoverIncident={handleRecoverIncident}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentsTab />
        )}
      </main>

      {/* Presentation Walkthrough Modal */}
      <DemoWalkthroughModal
        isOpen={isDemoWalkthroughOpen}
        onClose={() => setIsDemoWalkthroughOpen(false)}
        onRunSimulation={handleRunSimulation}
        onNavigateToTab={setActiveTab}
        onContainIncident={handleContainIncident}
        onRecoverIncident={handleRecoverIncident}
        latestIncidentId={incidents[0]?.incident_id}
        latestEventId={events[0]?.event_id}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CYRA: Cybersecurity Yielding Resilient Adaptive Defense</span>
          <span>Target Environment: HP Windows 11 Laptop | Safe Sandbox: CYRA_TEST_ENVIRONMENT/</span>
        </div>
      </footer>

    </div>
  );
}
