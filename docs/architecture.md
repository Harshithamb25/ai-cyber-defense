# CYRA Architecture Specification

## 1. Core Thesis
Continuously executing computationally intensive machine learning and deep neural networks on every low-level file I/O event introduces prohibitive CPU overhead and latency. CYRA (**Cybersecurity Yielding Resilient Adaptive Defense**) addresses this by separating:
1. **Continuous Low-Cost Endpoint Protection**: Microsoft Defender operational event logs and lightweight filesystem metadata filters.
2. **Selective Explainable Hybrid Intelligence**: High-dimensional ensemble verification invoked *only* when suspicious behavioral deviations surface.

## 2. Adaptive Operating Modes
- **LIGHT (Nominal)**: Continuous monitoring with ~2.1% CPU overhead. Bypasses expensive inference for standard office and background workloads.
- **WATCH (Elevated)**: Metadata collection actively tracking write burst rates, rename rates, and decoy file access.
- **INVESTIGATE (Selective ML)**: Tri-model hybrid verification (Random Forest, XGBoost, Isolation Forest) and XAI local feature attributions.
- **CONTAIN (Active Incident)**: Non-destructive process isolation and sandbox freezing confined to `CYRA_TEST_ENVIRONMENT/`.
- **VERIFIED (Post-Recovery)**: Cryptographic SHA-256 pre- vs post-recovery hash verification before transitioning back to LIGHT mode.

## 3. High-Level Flow Diagram
```
        [ WINDOWS 11 HP LAPTOP ENDPOINT ]
                        |
                        v
     [ Endpoint Security Layer (Defender / Telemetry) ]
                        |
                (Security Event)
                        |
                        v
          [ CYRA Metadata Extractor ]
           - Write rate, renames, entropy, honeyfile
                        |
        +---------------+---------------+
        |                               |
 (Benign Baseline)             (Anomalous Trigger)
        |                               |
        v                               v
[ Remain in LIGHT Mode ]      [ Escalate to INVESTIGATE ]
(DAIR = 14.2%, CPU = 3.4%)              |
                                        v
                            [ Explainable AI (XAI) ]
                             - Local feature attribution
                                        |
                                        v
                            [ Hybrid ML Verification ]
                             - Random Forest (Supervised)
                             - XGBoost (Boosted Trees)
                             - Isolation Forest (Anomaly)
                             - Temporal Sequence Dynamics
                                        |
                                        v
                            [ Evidence Fusion Risk Engine ]
                             - Dynamic score (0-100)
                             - LOW / MED / HIGH / CRITICAL
                                        |
                                        v
                         [ Automated Safe Response ]
                          - Contain test process
                          - Restore from .baseline/
                          - SHA-256 cryptographic audit
```
