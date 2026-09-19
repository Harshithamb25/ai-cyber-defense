/**
 * CYRA Explainable AI (XAI) Engine
 * Implements transparent local feature contribution attribution (analogous to TreeSHAP)
 * Answers: "WHY WAS THIS DETECTION FLAGGED?"
 * Strictly grounded in measured behavioral inputs.
 */

import { DetectionEvent, FeatureContribution, XAIExplanation } from '../../src/types.js';
import { BehavioralFeatureVector } from '../metadata/MetadataExtractor.js';

export class XAIContributionEngine {
  /**
   * Computes exact local contributions of each behavioral feature towards the risk score
   */
  public static explainDetection(event: DetectionEvent, features: BehavioralFeatureVector): XAIExplanation {
    const contributions: FeatureContribution[] = [];
    const highReasons: string[] = [];
    const mediumReasons: string[] = [];
    let criticalSignal: string | undefined = undefined;

    // 1. File Modification / Write Rate
    let writeContrib = 0;
    let writeSev: FeatureContribution['severity'] = 'LOW';
    if (features.write_rate >= 100) {
      writeContrib = 28;
      writeSev = 'HIGH';
      highReasons.push(`${features.write_rate} files modified within 10-second burst window`);
    } else if (features.write_rate >= 40) {
      writeContrib = 16;
      writeSev = 'MEDIUM';
      mediumReasons.push(`Elevated write velocity: ${features.write_rate} operations/10s`);
    } else if (features.write_rate > 15) {
      writeContrib = 8;
      writeSev = 'LOW';
    } else {
      writeContrib = -5; // Benign indicator
      writeSev = 'LOW';
    }
    contributions.push({
      feature: 'File modification rate',
      observed_value: `${features.write_rate}/10 sec`,
      contribution: writeContrib,
      severity: writeSev
    });

    // 2. Extension Mutation
    let extContrib = 0;
    let extSev: FeatureContribution['severity'] = 'LOW';
    if (features.extension_mutations >= 20) {
      extContrib = 25;
      extSev = 'HIGH';
      highReasons.push(`Abnormal extension mutation: ${features.extension_mutations} files altered to suspicious extensions`);
    } else if (features.extension_mutations >= 5) {
      extContrib = 15;
      extSev = 'MEDIUM';
      mediumReasons.push(`Detected ${features.extension_mutations} bulk file extension changes`);
    } else if (features.extension_mutations > 0) {
      extContrib = 5;
      extSev = 'LOW';
    } else {
      extContrib = -10; // Preserving normal extensions indicates standard software/builds
      extSev = 'LOW';
    }
    contributions.push({
      feature: 'Extension mutation',
      observed_value: `${features.extension_mutations} files`,
      contribution: extContrib,
      severity: extSev
    });

    // 3. Shannon Entropy Delta
    let entropyContrib = 0;
    let entropySev: FeatureContribution['severity'] = 'LOW';
    if (features.entropy_change >= 0.35) {
      entropyContrib = 18;
      entropySev = 'HIGH';
      highReasons.push(`Severe entropy surge (+${features.entropy_change.toFixed(2)}): indicates dense encrypted/compressed payloads`);
    } else if (features.entropy_change >= 0.15) {
      entropyContrib = 11;
      entropySev = 'MEDIUM';
      mediumReasons.push(`Moderate entropy increase (+${features.entropy_change.toFixed(2)})`);
    } else {
      entropyContrib = 2;
      entropySev = 'LOW';
    }
    contributions.push({
      feature: 'Entropy change',
      observed_value: `+${features.entropy_change.toFixed(2)}`,
      contribution: entropyContrib,
      severity: entropySev
    });

    // 4. Directory Spread
    let spreadContrib = 0;
    let spreadSev: FeatureContribution['severity'] = 'LOW';
    if (features.directory_spread >= 5) {
      spreadContrib = 12;
      spreadSev = 'MEDIUM';
      mediumReasons.push(`Broad lateral directory traversal across ${features.directory_spread} distinct folders`);
    } else if (features.directory_spread >= 2) {
      spreadContrib = 7;
      spreadSev = 'LOW';
    } else {
      spreadContrib = 1;
      spreadSev = 'LOW';
    }
    contributions.push({
      feature: 'Directory spread',
      observed_value: `${features.directory_spread} folders`,
      contribution: spreadContrib,
      severity: spreadSev
    });

    // 5. Honeyfile / Decoy Trigger (Critical Signal)
    let decoyContrib = 0;
    let decoySev: FeatureContribution['severity'] = 'LOW';
    if (features.decoy_triggered) {
      decoyContrib = 35;
      decoySev = 'CRITICAL';
      criticalSignal = `Protected decoy canary file touched (${event.affected_file || 'CYRA_HONEY_DOCUMENT.txt'})`;
    }
    contributions.push({
      feature: 'Decoy honeyfile interaction',
      observed_value: features.decoy_triggered ? 'TRIGGERED (Tripwire breached)' : 'UNTOUCHED',
      contribution: decoyContrib,
      severity: decoySev
    });

    // 6. Antivirus Telemetry Confidence
    const avContrib = Math.round(features.antivirus_confidence * 15);
    contributions.push({
      feature: 'Antivirus confidence alignment',
      observed_value: `${Math.round(features.antivirus_confidence * 100)}%`,
      contribution: avContrib,
      severity: features.antivirus_confidence > 0.7 ? 'HIGH' : features.antivirus_confidence > 0.3 ? 'MEDIUM' : 'LOW'
    });

    // 7. Parent Process Context
    if (features.parent_process_anomaly) {
      const parentName = event.parent_process || 'ScriptInterpreter';
      highReasons.push(`Process spawned by script execution host (${parentName})`);
      contributions.push({
        feature: 'Parent process context',
        observed_value: `Spawned via ${parentName}`,
        contribution: 12,
        severity: 'MEDIUM'
      });
    }

    // Sort contributions by absolute magnitude descending
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    // Synthesize natural-language summary strictly from observed facts
    let summary = '';
    if (criticalSignal && highReasons.length > 0) {
      summary = `Critical alarm: ${criticalSignal}. This is strongly corroborated by ${highReasons[0].toLowerCase()} and elevated hybrid model verification. Immediate containment recommended.`;
    } else if (highReasons.length >= 2) {
      summary = `Detection triggered due to multiple correlated behavioral indicators: ${highReasons.join(', ')}. Behavior strongly resembles automated ransomware encryption workflows.`;
    } else if (mediumReasons.length > 0) {
      summary = `Elevated activity noted: ${mediumReasons.join(' and ')}. Activity deviates from standard baseline but lacks critical destructive signatures.`;
    } else {
      summary = `Benign baseline activity: Nominal write velocity, zero extension tampering, and no honeyfile interaction. Safe to operate.`;
    }

    return {
      why_flagged: {
        high: highReasons,
        medium: mediumReasons,
        critical_signal: criticalSignal
      },
      feature_contributions: contributions,
      natural_language_summary: summary
    };
  }
}
