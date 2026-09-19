/**
 * CYRA: Cybersecurity Yielding Resilient Adaptive Defense
 * Normalized DetectionEvent & Core Platform Types
 */

export type EventSource = 'LIVE ENDPOINT TELEMETRY' | 'CONTROLLED SIMULATION';

export type EventSeverity = 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SystemMode = 'LIGHT' | 'WATCH' | 'INVESTIGATE' | 'CONTAIN' | 'VERIFIED';

export type RiskBand = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectionEvent {
  event_id: string;
  timestamp: string;
  source: EventSource;
  detection_name: string;
  severity: EventSeverity;
  confidence: number; // 0.0 - 1.0
  process_name: string;
  process_id: number | null;
  executable_path: string | null;
  parent_process: string | null;
  affected_file: string | null;
  affected_directory: string | null;
  file_extension: string | null;
  operation: 'MODIFY' | 'CREATE' | 'DELETE' | 'RENAME' | 'BURST_WRITE' | 'DECOY_ACCESS';
  
  // Behavioral features extracted by metadata layer
  files_modified: number;
  files_created: number;
  files_deleted: number;
  files_renamed: number;
  extension_mutations: number;
  write_rate: number; // ops per 10s window
  rename_rate: number;
  deletion_rate: number;
  directory_spread: number;
  entropy_change: number; // -1.0 to +1.0 delta Shannon entropy
  decoy_triggered: boolean;
  antivirus_confidence: number;
  hash: string | null; // SHA-256 where legitimately available
  metadata_available: boolean;
  simulation: boolean;
}

export interface FeatureContribution {
  feature: string;
  observed_value: string;
  contribution: number; // -100 to +100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface XAIExplanation {
  why_flagged: {
    high: string[];
    medium: string[];
    critical_signal?: string;
  };
  feature_contributions: FeatureContribution[];
  natural_language_summary: string;
}

export interface HybridModelScores {
  rf_score: number; // 0 - 100
  xgboost_score: number; // 0 - 100
  anomaly_score: number; // 0 - 100 (Isolation Forest)
  temporal_score: number | null; // null if sequential sequence data is dormant
  temporal_status_note: string;
}

export interface EvidenceFusionResult {
  supervised_score: number;
  anomaly_score: number;
  context_score: number;
  temporal_score: number;
  fused_risk_score: number; // 0 - 100
  risk_band: RiskBand;
  decision_reasons: string[];
  weights_used: {
    supervised: number;
    anomaly: number;
    context: number;
    temporal: number;
  };
}

export interface InvestigationResult {
  event: DetectionEvent;
  xai: XAIExplanation;
  model_scores: HybridModelScores;
  fusion: EvidenceFusionResult;
  recommended_response: 'LOG_ONLY' | 'INCREASE_TELEMETRY' | 'INVESTIGATE_DEEPLY' | 'CONTAIN_AND_RECOVER';
  investigation_timestamp: string;
}

export interface ResponseAction {
  action_id: string;
  incident_id: string;
  action: 'LOG' | 'INCREASE_TELEMETRY' | 'CONTAIN_PROCESS' | 'ISOLATE_DIRECTORY' | 'RESTORE_BACKUP';
  timestamp: string;
  reason: string;
  risk_score: number;
  status: 'EXECUTED' | 'VERIFIED' | 'FAILED' | 'SIMULATED';
  reversible: boolean;
  simulation_mode: boolean;
  affected_files: string[];
  restored_files: string[];
  integrity_verified: boolean;
  pre_incident_hash?: string;
  post_recovery_hash?: string;
}

export interface IncidentRecord {
  incident_id: string;
  event_id: string;
  timestamp: string;
  detection_name: string;
  risk_score: number;
  risk_band: RiskBand;
  status: 'DETECTED' | 'VERIFIED' | 'CONTAINED' | 'RECOVERED' | 'RESOLVED';
  actions_taken: ResponseAction[];
  affected_file_count: number;
  decoy_triggered: boolean;
  simulation: boolean;
}

export interface SystemMetrics {
  total_events: number;
  ml_investigations_count: number;
  dair: number; // Deep Analysis Invocation Rate %
  current_system_mode: SystemMode;
  endpoint_status: 'DEFENDER_ACTIVE' | 'SIMULATION_MODE' | 'DEFENDER_READY_STANDBY';
  current_risk: number;
  active_incidents: number;
  contained_incidents: number;
  recovered_incidents: number;
  avg_inference_latency_ms: number;
  measured_cpu_overhead_percent: number;
  measured_memory_mb: number;
}

export interface ExperimentArchitectureMetric {
  architecture_id: string;
  name: string;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  detection_latency_ms: number;
  inference_latency_ms: number;
  cpu_overhead_percent: number;
  ml_invocation_rate: number; // %
  description: string;
}

export interface TestEnvironmentFile {
  name: string;
  path: string;
  size_bytes: number;
  sha256: string;
  is_honey_file: boolean;
  status: 'CLEAN' | 'MODIFIED_IN_SIMULATION' | 'ENCRYPTED_SIMULATION' | 'RESTORED';
}
