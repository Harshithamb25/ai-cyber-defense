import React, { useState } from 'react';
import { 
  X, Play, ArrowRight, CheckCircle2, ShieldAlert, Cpu, 
  RotateCcw, Lock, BarChart3, Terminal, Sparkles
} from 'lucide-react';

interface DemoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (scenario: string) => Promise<void>;
  onNavigateToTab: (tab: 'overview' | 'detections' | 'investigation' | 'response' | 'experiments') => void;
  onContainIncident: (id: string) => void;
  onRecoverIncident: (id: string) => void;
  latestIncidentId?: string;
  latestEventId?: string;
}

export const DemoWalkthroughModal: React.FC<DemoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onRunSimulation,
  onNavigateToTab,
  onContainIncident,
  onRecoverIncident,
  latestIncidentId,
  latestEventId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inProgress, setInProgress] = useState(false);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: '1. Start CYRA Baseline',
      desc: 'System operates in LIGHT mode. Low-cost continuous endpoint telemetry monitors system calls without invoking heavy ML models. DAIR remains low (~0%).',
      actionLabel: 'View Overview Baseline',
      action: async () => {
        onNavigateToTab('overview');
      }
    },
    {
      step: 2,
      title: '2. Inject Safe Ransomware Simulation',
      desc: 'Execute controlled multi-vector ransomware behavior inside CYRA_TEST_ENVIRONMENT/: burst writes (148 ops/10s), extension mutations (.cyra_locked), entropy surge (+0.42), and canary file touch.',
      actionLabel: 'Inject Controlled Simulation',
      action: async () => {
        setInProgress(true);
        await onRunSimulation('COMBINED_RANSOMWARE_LIKE_ACTIVITY');
        setInProgress(false);
        onNavigateToTab('detections');
      }
    },
    {
      step: 3,
      title: '3. Endpoint Ingestion & Metadata Extraction',
      desc: 'Detection event normalized into DetectionEvent schema. Lightweight metadata extractor extracts write burst rate, rename rate, Shannon entropy, and honeyfile tripwire status.',
      actionLabel: 'Inspect Telemetry Metadata',
      action: async () => {
        onNavigateToTab('investigation');
      }
    },
    {
      step: 4,
      title: '4. Selective Hybrid ML & XAI Attribution',
      desc: 'Because metadata breached safety thresholds, CYRA automatically escalates to INVESTIGATE mode, invoking Random Forest (95%), XGBoost (100%), Isolation Forest (100%), and XAI local feature attributions.',
      actionLabel: 'View XAI Feature Contributions',
      action: async () => {
        onNavigateToTab('investigation');
      }
    },
    {
      step: 5,
      title: '5. Dynamic Risk Engine Fusion',
      desc: 'Weighted multi-source evidence fusion calculates the dynamic risk score: 98/100 (CRITICAL). System transitions to CONTAIN mode.',
      actionLabel: 'Review Fused Risk Score',
      action: async () => {
        onNavigateToTab('investigation');
      }
    },
    {
      step: 6,
      title: '6. Automated Controlled Containment',
      desc: 'Isolate test processes, halt mutation queues, and preserve forensic evidence inside the sandbox without affecting user files.',
      actionLabel: 'Execute Containment',
      action: async () => {
        if (latestIncidentId) {
          onContainIncident(latestIncidentId);
        }
        onNavigateToTab('response');
      }
    },
    {
      step: 7,
      title: '7. Controlled Recovery & SHA-256 Verification',
      desc: 'Restore test environment files from cryptographic baseline snapshot (.baseline/). Validate SHA-256 pre- vs. post-recovery checksums to confirm 100% data integrity.',
      actionLabel: 'Restore & Verify SHA-256 Integrity',
      action: async () => {
        if (latestIncidentId) {
          onRecoverIncident(latestIncidentId);
        }
        onNavigateToTab('response');
      }
    },
    {
      step: 8,
      title: '8. Audit & Transition Back to Light Mode',
      desc: 'All incidents resolved and verified. System mode transitions from VERIFIED back to LIGHT for sustainable, low-overhead monitoring.',
      actionLabel: 'View Experiments & Performance',
      action: async () => {
        onNavigateToTab('experiments');
        onClose();
      }
    }
  ];

  const activeStepObj = steps[currentStep - 1];

  const handleStepAction = async () => {
    await activeStepObj.action();
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 p-6 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100 font-mono tracking-wider">
              CYRA Research Jury Presentation Walkthrough
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Step {currentStep} of {steps.length}</span>
            <span className="text-cyan-400 font-bold">{Math.round((currentStep / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Card */}
        <div className="p-5 rounded-xl border border-cyan-800/60 bg-cyan-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-cyan-300 font-mono">
              {activeStepObj.title}
            </h4>
            <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              PHASE {currentStep}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {activeStepObj.desc}
          </p>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              disabled={inProgress}
              onClick={handleStepAction}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{inProgress ? 'Executing...' : activeStepObj.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
