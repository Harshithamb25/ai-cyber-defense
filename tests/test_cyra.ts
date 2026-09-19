/**
 * CYRA Automated Test Suite
 * Validates metadata extraction, ML scoring, XAI attributions, evidence fusion,
 * and sandbox containment & SHA-256 recovery integrity.
 */

import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { MetadataExtractor, BehavioralFeatureVector } from '../server/metadata/MetadataExtractor.js';
import { HybridMLEngine } from '../server/ml/HybridMLEngine.js';
import { XAIContributionEngine } from '../server/xai/XAIContributionEngine.js';
import { EvidenceFusionEngine } from '../server/risk/EvidenceFusionEngine.js';
import { ResponseRecoveryEngine } from '../server/response/ResponseRecoveryEngine.js';
import { DetectionEvent, IncidentRecord } from '../src/types.js';

let passed = 0;
let total = 0;

function it(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

function createMockEvent(overrides: Partial<DetectionEvent> = {}): DetectionEvent {
  const base: DetectionEvent = {
    event_id: 'EVT-TEST-001',
    timestamp: new Date().toISOString(),
    source: 'CONTROLLED SIMULATION',
    detection_name: 'Test Detection',
    severity: 'HIGH',
    confidence: 0.9,
    process_name: 'test_proc.exe',
    process_id: 1234,
    executable_path: 'C:\\test\\test_proc.exe',
    parent_process: 'cmd.exe',
    affected_file: 'CYRA_TEST_ENVIRONMENT/research_project_notes.txt',
    affected_directory: 'CYRA_TEST_ENVIRONMENT',
    file_extension: '.txt',
    operation: 'BURST_WRITE',
    files_modified: 100,
    files_created: 0,
    files_deleted: 0,
    files_renamed: 50,
    extension_mutations: 50,
    write_rate: 100,
    rename_rate: 50,
    deletion_rate: 0,
    directory_spread: 4,
    entropy_change: 0.35,
    decoy_triggered: true,
    antivirus_confidence: 0.85,
    hash: null,
    metadata_available: true,
    simulation: true
  };
  return Object.assign(base, overrides);
}

async function runTests() {
  console.log('\n============================================================');
  console.log('CYRA Test Suite: Architecture & Defensive Pipeline Audit');
  console.log('============================================================\n');

  console.log('Suite 1: Metadata Extraction & Shannon Entropy');
  it('computes low Shannon entropy for plaintext notes buffer', () => {
    const filePath = path.resolve(process.cwd(), 'CYRA_TEST_ENVIRONMENT', 'research_project_notes.txt');
    const buffer = fs.readFileSync(filePath);
    const entropy = MetadataExtractor.calculateShannonEntropy(buffer);
    assert.ok(entropy > 2.0 && entropy < 6.0, `Expected entropy between 2.0 and 6.0, got ${entropy}`);
  });

  it('normalizes event into feature vector correctly', () => {
    const mockEvent = createMockEvent();
    const fv = MetadataExtractor.extractFeatureVector(mockEvent);
    assert.strictEqual(fv.write_rate, 100);
    assert.strictEqual(fv.decoy_triggered, 1);
    assert.strictEqual(fv.extension_mutations, 50);
  });

  console.log('\nSuite 2: Hybrid ML Verification (RF + XGBoost + Isolation Forest)');
  it('classifies benign build burst with low risk', () => {
    const benignFeatures: BehavioralFeatureVector = {
      write_rate: 85,
      rename_rate: 0,
      deletion_rate: 0,
      extension_mutations: 0,
      directory_spread: 4,
      entropy_change: 0.02,
      decoy_triggered: 0,
      antivirus_confidence: 0.1,
      parent_process_anomaly: 0
    };
    const scores = HybridMLEngine.evaluateAll(benignFeatures);
    assert.ok(scores.rf_score < 40, `RF score should be low for benign build, got ${scores.rf_score}`);
    assert.ok(scores.xgboost_score < 35, `XGBoost score should be low for benign build, got ${scores.xgboost_score}`);
  });

  it('classifies combined ransomware attack with high confidence', () => {
    const attackFeatures: BehavioralFeatureVector = {
      write_rate: 148,
      rename_rate: 124,
      deletion_rate: 12,
      extension_mutations: 124,
      directory_spread: 6,
      entropy_change: 0.42,
      decoy_triggered: 1,
      antivirus_confidence: 0.94,
      parent_process_anomaly: 1
    };
    const scores = HybridMLEngine.evaluateAll(attackFeatures);
    assert.ok(scores.rf_score >= 85, `RF score should be >= 85, got ${scores.rf_score}`);
    assert.ok(scores.xgboost_score >= 90, `XGBoost score should be >= 90, got ${scores.xgboost_score}`);
    assert.ok(scores.anomaly_score >= 80, `Anomaly score should be >= 80, got ${scores.anomaly_score}`);
  });

  console.log('\nSuite 3: Explainable AI (XAI) Attribution');
  it('generates itemized feature attributions and fact-grounded summary', () => {
    const mockEvent = createMockEvent();
    const attackFeatures = MetadataExtractor.extractFeatureVector(mockEvent);
    const xai = XAIContributionEngine.explainDetection(mockEvent, attackFeatures);
    assert.ok(xai.feature_contributions.length >= 4, 'Should contain at least 4 feature contributions');
    assert.ok(xai.why_flagged.critical_signal !== undefined, 'Decoy trigger should be marked as critical signal');
    assert.ok(xai.natural_language_summary.includes('decoy canary file touched'), 'Summary should mention canary trigger');
  });

  console.log('\nSuite 4: Evidence Fusion & Risk Engine');
  it('fuses multi-source evidence and assigns CRITICAL band for high scores', () => {
    const mockEvent = createMockEvent();
    const attackFeatures = MetadataExtractor.extractFeatureVector(mockEvent);
    const scores = HybridMLEngine.evaluateAll(attackFeatures);
    const fusion = EvidenceFusionEngine.fuseEvidence(mockEvent, attackFeatures, scores);
    assert.ok(fusion.fused_risk_score >= 80, `Risk score should be >= 80, got ${fusion.fused_risk_score}`);
    assert.strictEqual(fusion.risk_band, 'CRITICAL');
  });

  console.log('\nSuite 5: Sandbox Containment & SHA-256 Cryptographic Recovery');
  it('confines all file inspection to CYRA_TEST_ENVIRONMENT/', () => {
    const status = ResponseRecoveryEngine.getTestEnvironmentStatus();
    assert.ok(status.length >= 4, `Expected at least 4 files in sandbox, found ${status.length}`);
    for (const f of status) {
      assert.ok(!f.path.includes('..'), `Path should not escape sandbox: ${f.path}`);
      assert.ok(f.sha256.length === 64, `Expected valid 64-char SHA256 hex string, got ${f.sha256}`);
    }
  });

  it('verifies pre- and post-recovery SHA-256 integrity on test files', () => {
    const mockIncident: IncidentRecord = {
      incident_id: 'TEST-INC-001',
      event_id: 'EVT-001',
      detection_name: 'Simulated Ransomware',
      timestamp: new Date().toISOString(),
      status: 'CONTAINED',
      risk_score: 95,
      risk_band: 'CRITICAL',
      affected_file_count: 2,
      decoy_triggered: true,
      actions_taken: [],
      simulation: true
    };

    // 1. Simulate non-destructive safe mutation inside CYRA_TEST_ENVIRONMENT/
    ResponseRecoveryEngine.simulateTestFileMutation();

    // 2. Execute recovery from .baseline/
    const recoveryAction = ResponseRecoveryEngine.executeRecovery(mockIncident);

    // 3. Verify integrity
    assert.strictEqual(recoveryAction.status, 'VERIFIED');
    assert.strictEqual(recoveryAction.integrity_verified, true);
    assert.ok(recoveryAction.pre_incident_hash && recoveryAction.pre_incident_hash.length === 64, 'Baseline hash must be 64 chars');
    assert.strictEqual(recoveryAction.pre_incident_hash, recoveryAction.post_recovery_hash);
  });

  console.log('\n------------------------------------------------------------');
  console.log(`Results: ${passed}/${total} tests passed.`);
  console.log('------------------------------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
