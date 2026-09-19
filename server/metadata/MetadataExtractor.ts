/**
 * CYRA Metadata Extractor & Behavioral Feature Engine
 * Extracts low-cost endpoint metadata when a security trigger is received.
 * Does NOT run heavy neural networks or full disk scanning on every event.
 */

import { DetectionEvent } from '../../src/types.js';

export interface BehavioralFeatureVector {
  write_rate: number;
  rename_rate: number;
  deletion_rate: number;
  extension_mutations: number;
  directory_spread: number;
  entropy_change: number;
  decoy_triggered: number; // 0 or 1
  antivirus_confidence: number;
  parent_process_anomaly: number; // 0 or 1
}

export class MetadataExtractor {
  // Baseline thresholds for normal office work
  private static readonly BASELINE_WRITE_RATE = 15; // writes/10s
  private static readonly BASELINE_MUTATION_RATE = 2;
  private static readonly BASELINE_ENTROPY_DELTA = 0.08;

  /**
   * Calculates Shannon Entropy of a buffer:
   * H(X) = - SUM [ P(x_i) * log2(P(x_i)) ]
   * Returns a value between 0.0 and 8.0 bits per byte.
   */
  public static calculateShannonEntropy(buffer: Buffer): number {
    if (!buffer || buffer.length === 0) return 0;
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < buffer.length; i++) {
      frequencies[buffer[i]]++;
    }
    let entropy = 0;
    const len = buffer.length;
    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const p = frequencies[i] / len;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  /**
   * Normalizes raw event into numerical feature vector for hybrid ML verification
   */
  public static extractFeatureVector(event: DetectionEvent): BehavioralFeatureVector {
    const suspiciousParents = ['cmd.exe', 'powershell.exe', 'wscript.exe', 'vssadmin.exe', 'cscript.exe'];
    const isSuspiciousParent = event.parent_process 
      ? suspiciousParents.some(p => event.parent_process!.toLowerCase().includes(p)) 
      : false;

    return {
      write_rate: event.write_rate,
      rename_rate: event.rename_rate,
      deletion_rate: event.deletion_rate,
      extension_mutations: event.extension_mutations,
      directory_spread: event.directory_spread,
      entropy_change: Math.max(0, event.entropy_change),
      decoy_triggered: event.decoy_triggered ? 1 : 0,
      antivirus_confidence: event.antivirus_confidence,
      parent_process_anomaly: isSuspiciousParent ? 1 : 0
    };
  }

  /**
   * Determines if the event warrants escalating from LIGHT to INVESTIGATE mode
   */
  public static shouldEscalateToHybridML(event: DetectionEvent): boolean {
    // Escalate if:
    // 1. Antivirus reported confidence >= 0.5
    // 2. Honeyfile decoy triggered
    // 3. Write rate exceeds 3x baseline
    // 4. Extension mutations >= 5
    // 5. Entropy delta >= 0.20
    if (event.decoy_triggered) return true;
    if (event.antivirus_confidence >= 0.50) return true;
    if (event.write_rate >= this.BASELINE_WRITE_RATE * 3) return true;
    if (event.extension_mutations >= 5) return true;
    if (event.entropy_change >= 0.20) return true;
    return false;
  }
}
