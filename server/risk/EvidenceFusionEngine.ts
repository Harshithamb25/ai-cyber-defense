/**
 * CYRA Evidence Fusion & Dynamic Risk Engine
 * Implements weighted multi-source evidence fusion:
 * - Supervised ML (RF + XGBoost)
 * - Anomaly Model (Isolation Forest)
 * - Temporal Dynamics
 * - Contextual Behavioral Signals (Decoy, Entropy, Extension Mutations)
 *
 * Produces calibrated 0-100 CYRA Risk Score.
 */

import { DetectionEvent, EvidenceFusionResult, HybridModelScores, RiskBand } from '../../src/types.js';
import { BehavioralFeatureVector } from '../metadata/MetadataExtractor.js';

export class EvidenceFusionEngine {
  // Configurable fusion weights
  public static readonly WEIGHTS = {
    supervised: 0.35,
    anomaly: 0.25,
    context: 0.30,
    temporal: 0.10
  };

  public static fuseEvidence(
    event: DetectionEvent,
    features: BehavioralFeatureVector,
    scores: HybridModelScores
  ): EvidenceFusionResult {
    // 1. Supervised score: combination of Random Forest and XGBoost
    const supervisedScore = (scores.rf_score * 0.45) + (scores.xgboost_score * 0.55);

    // 2. Anomaly score: Isolation Forest
    const anomalyScore = scores.anomaly_score;

    // 3. Temporal score (if available, else fallback to sequence proxy)
    const temporalScore = scores.temporal_score !== null ? scores.temporal_score : 20;

    // 4. Contextual evidence score (decoy tripwire, entropy jump, extension mutation burst)
    let contextScore = (features.antivirus_confidence * 25);
    if (features.decoy_triggered) {
      contextScore += 45; // Critical tripwire
    }
    if (features.extension_mutations >= 10) {
      contextScore += 25;
    } else if (features.extension_mutations >= 3) {
      contextScore += 12;
    }
    if (features.entropy_change >= 0.25) {
      contextScore += 20;
    } else if (features.entropy_change >= 0.10) {
      contextScore += 10;
    }
    if (features.write_rate >= 80) {
      contextScore += 15;
    }
    contextScore = Math.min(100, Math.max(0, Math.round(contextScore)));

    // Weighted fusion calculation
    const rawFusedScore = 
      (supervisedScore * this.WEIGHTS.supervised) +
      (anomalyScore * this.WEIGHTS.anomaly) +
      (contextScore * this.WEIGHTS.context) +
      (temporalScore * this.WEIGHTS.temporal);

    const fusedRiskScore = Math.min(100, Math.max(0, Math.round(rawFusedScore)));

    // Categorize into Risk Band
    let riskBand: RiskBand = 'LOW';
    if (fusedRiskScore >= 80) {
      riskBand = 'CRITICAL';
    } else if (fusedRiskScore >= 60) {
      riskBand = 'HIGH';
    } else if (fusedRiskScore >= 30) {
      riskBand = 'MEDIUM';
    } else {
      riskBand = 'LOW';
    }

    // Build itemized decision reasons
    const reasons: string[] = [];
    if (features.decoy_triggered) {
      reasons.push('Decoy canary file breached in isolated test directory');
    }
    if (supervisedScore >= 70) {
      reasons.push(`Supervised ML models verified high threat concordance (RF: ${scores.rf_score}%, XGB: ${scores.xgboost_score}%)`);
    }
    if (anomalyScore >= 65) {
      reasons.push(`Isolation Forest flagged severe behavioral distribution anomaly (${scores.anomaly_score}%)`);
    }
    if (features.extension_mutations >= 5) {
      reasons.push(`Systematic file extension renaming detected (${features.extension_mutations} files)`);
    }
    if (features.entropy_change >= 0.20) {
      reasons.push(`Significant Shannon entropy increase observed (+${features.entropy_change.toFixed(2)})`);
    }
    if (features.write_rate >= 50) {
      reasons.push(`Abnormal file write burst intensity (${features.write_rate} operations/10s)`);
    }
    if (reasons.length === 0) {
      reasons.push('All measured behavioral signals remain within benign baseline operating boundaries');
    }

    return {
      supervised_score: Math.round(supervisedScore),
      anomaly_score: Math.round(anomalyScore),
      context_score: Math.round(contextScore),
      temporal_score: Math.round(temporalScore),
      fused_risk_score: fusedRiskScore,
      risk_band: riskBand,
      decision_reasons: reasons,
      weights_used: this.WEIGHTS
    };
  }
}
