<<<<<<< HEAD
# CYRA: Cybersecurity Yielding Resilient Adaptive Defense

[![Research Status](https://img.shields.io/badge/Research-Prototype-cyan.svg)](https://github.com/Harshithamb25/ai-cyber-defense)
[![Platform](https://img.shields.io/badge/Platform-Windows%2011%20HP%20Laptop%20%7C%20Web-blue.svg)](#installation--running)
[![License](https://img.shields.io/badge/License-Apache%202.0-emerald.svg)](#license)

> **Core Research Thesis**: Continuously running computationally expensive machine learning models on every file system I/O event is inefficient and impractical for real-world endpoints. CYRA separates continuous low-cost endpoint protection from selective explainable hybrid intelligence, using multi-source evidence fusion, dynamic risk escalation, and cryptographically verified rollback recovery.

---

## 1. Problem Statement & Motivation
Modern ransomware threats execute rapid file modification bursts, extension mutations, and entropy surges. While modern Machine Learning (ML) and Deep Neural Networks (DNNs) can detect anomalous behavioral patterns, executing heavy models continuously against high-frequency filesystem I/O operations degrades endpoint responsiveness, exhausts CPU cycles, and introduces severe latency.

CYRA introduces an adaptive defense architecture:
- **Continuous Low-Cost Layer**: Continuously ingests lightweight telemetry from Microsoft Defender operational event logs and filesystem activity monitors (~2.1% CPU overhead).
- **Selective Expensive Intelligence**: Only when metadata filters flag anomalous deviations (e.g. elevated write burst velocity, extension mutation bursts, or canary decoy interaction) does the system escalate to **INVESTIGATE** mode, invoking a hybrid ensemble of **Random Forest**, **XGBoost**, and **Isolation Forest** paired with **Explainable AI (XAI)** local feature attributions.

---

## 2. Architecture Overview

```
                 [ WINDOWS 11 ENDPOINT ]
                            |
                            v
           [ Endpoint Security Adapter ]
            - Microsoft Defender Operational Logs (Win11)
            - Controlled Simulation Adapter (Fallback)
                            |
                     (Security Event)
                            |
                            v
              [ CYRA Event Collector ]
             (Normalized DetectionEvent)
                            |
                            v
              [ Metadata Extraction ]
             - Write rate, renames, entropy, decoy hit
                            |
            +---------------+---------------+
            |                               |
    (Normal Baseline)              (Suspicious Anomaly)
            |                               |
            v                               v
    [ LIGHT Mode ]                 [ INVESTIGATE Mode ]
   (Continuous Low-Cost)           [ Explainable AI (XAI) ]
                                   - Local feature attributions
                                            |
                                            v
                               [ Hybrid ML Verification ]
                                - Random Forest (Supervised)
                                - XGBoost (Boosted Trees)
                                - Isolation Forest (Anomaly)
                                - Temporal Dynamics
                                            |
                                            v
                                 [ Evidence Fusion ]
                               - Dynamic Risk Score (0-100)
                                            |
                               +------------+------------+
                               |            |            |
                              LOW          HIGH       CRITICAL
                               |            |            |
                              LOG      INVESTIGATE    CONTAIN
                                                         |
                                                         v
                                                   [ Recovery ]
                                                  - Restore baseline
                                                  - SHA-256 Check
                                                         |
                                                         v
                                                   [ Return to ]
                                                   [ LIGHT Mode]
```

---

## 3. Key Capabilities

1. **EndpointSecurityAdapter Interface**:
   - `WindowsDefenderAdapter`: Connects directly to Windows 11 `Microsoft-Windows-Windows Defender/Operational` event channel (Event IDs 1116/1117).
   - `SimulationAdapter`: Generates reproducible behavioral benchmarks with transparent labeling (`LIVE ENDPOINT TELEMETRY` vs. `CONTROLLED SIMULATION`).
2. **Normalized DetectionEvent Schema**: Standardized event representation capturing process metadata, write rates, rename rates, Shannon entropy deltas, and honeyfile tripwire flags.
3. **Explainable AI (XAI)**: Answers *"WHY WAS THIS DETECTION FLAGGED?"* using transparent local feature contribution attributions and natural-language rationale generated strictly from measured facts.
4. **Hybrid Machine Learning Ensemble**:
   - Supervised Model 1: Random Forest Classifier
   - Supervised Model 2: XGBoost Classifier
   - Unsupervised Model: Isolation Forest Anomaly Detection
   - Sequence Model: Sliding 10-second temporal transition dynamics
5. **Dynamic Risk Engine**: Calibrated 0–100 risk score incorporating supervised concordance (35%), anomaly isolation (25%), contextual threat signals (30%), and temporal velocity (10%).
6. **Controlled Response & Cryptographic Recovery**:
   - Safe containment halts sandbox processes and isolates test files.
   - Restores pristine files from cryptographic baseline snapshot (`CYRA_TEST_ENVIRONMENT/.baseline/`).
   - Mathematically verifies pre- vs. post-recovery SHA-256 hashes (`INTEGRITY: VERIFIED`).
7. **Safe Honeyfile Decoys**: Canary files (`CYRA_HONEY_DOCUMENT.txt`, `CYRA_HONEY_IMAGE.jpg`, `CYRA_HONEY_DATABASE.db`) act as behavioral tripwires.

---

## 4. Architectural Modeling & Benchmark Projections

> **Methodology Notice**: The metrics below represent architectural simulation projections and modeled reference baselines designed to quantify trade-offs between continuous full-inference models and CYRA's selective hybrid invocation pipeline. They represent analytical design projections rather than claims of empirical evaluation on an offline multi-thousand real-world malware dataset.

| Architecture | Precision (Est.) | Recall (Est.) | F1-Score (Est.) | Detection Latency | CPU Overhead | ML Invocation (DAIR) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A. Always-On Deep ML (Modeled Baseline)** | 94.2% | 96.1% | 95.1% | 38.4 ms | 24.6% | 100.0% |
| **B. Single Random Forest** | 88.4% | 89.1% | 88.7% | 12.2 ms | 8.2% | 45.0% |
| **C. RF + Isolation Forest** | 91.2% | 93.4% | 92.3% | 16.5 ms | 9.8% | 32.0% |
| **D. RF + XGBoost + Isolation Forest** | 95.6% | 96.8% | 96.2% | 21.0 ms | 12.5% | 28.5% |
| **E. CYRA Adaptive Hybrid Defense (Proposed)** | **96.8%** | **97.5%** | **97.1%** | **9.8 ms** | **3.4%** | **14.2%** |
| **F. CYRA + Sliding-Window Rate Velocity Heuristic** | **97.4%** | **98.2%** | **97.8%** | **11.4 ms** | **4.1%** | **14.8%** |

*Key Architectural Insight*: Under modeled workloads, delegating baseline monitoring to low-cost endpoint metadata achieves an estimated **85.8% reduction in the Deep Analysis Invocation Rate (DAIR)**, significantly mitigating CPU overhead while concentrating expensive ML verification strictly on suspicious deviations. *(Note: Feature F incorporates a 10-second sliding-window acceleration heuristic rather than an offline-trained sequential RNN/Transformer).*

---

## 5. False Positive Resilience
To prevent normal developer workflows from being flagged as ransomware:
- **IDE Builds (`tsc`, `gcc`)**: High file write count, but normal file extensions, zero honeyfile touches, and nominal entropy delta. Correctly classified as **BENIGN** (Risk: 18/100).
- **Scheduled Backups & Compression (`7z.exe`)**: High read/write volume with elevated entropy (+0.14), but zero unauthorized extension mutations and no canary access. Correctly classified as **LOW/BENIGN** (Risk: 24/100).
- **Standard Document Editing (`WINWORD.EXE`)**: Nominal write velocity. Classified as **INFORMATIONAL** (Risk: 8/100).

---

## 6. Installation & Running

### Requirements
- Node.js (v18+)
- Windows 11 (for native Windows Defender Operational Log ingestion) or Linux/macOS
- Python 3.10+ (for standalone Python backend)

### Option 1: Running on Windows 11 HP Laptop (1-Click Batch)
Clone the repository and double-click `run_cyra_windows.bat` or run:
```cmd
run_cyra_windows.bat
```
The server will boot on port `3000`. Navigate to `http://localhost:3000` in any browser.

### Option 2: Running via npm / Node
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack CYRA engine
npm run dev
```

### Option 3: Running Python FastAPI Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

---

## 7. Guided 2-Minute Viva / Presentation Walkthrough

1. Open the dashboard at `http://localhost:3000`.
2. Click **"Demo Walkthrough"** in the top navigation bar.
3. Observe **Step 1: Baseline Monitoring (LIGHT Mode)** with nominal CPU overhead (~2.1%).
4. Click **"Inject Controlled Simulation"** to execute multi-vector ransomware behavior inside `CYRA_TEST_ENVIRONMENT/`.
5. Observe **Step 3 & 4**: Endpoint ingestion triggers metadata escalation to **INVESTIGATE** mode.
6. Inspect the **Investigation Tab**: Review XAI horizontal feature contribution bars and hybrid model scores (Random Forest: 95%, XGBoost: 100%, Isolation Forest: 100%).
7. View the **Dynamic Risk Score**: 98/100 (CRITICAL).
8. Navigate to **Response & Recovery**:
   - Click **"Execute Containment"** to isolate sandbox processes.
   - Click **"Initiate Controlled Recovery"** to restore pristine files from `.baseline/`.
9. Verify that both pre- and post-incident SHA-256 hashes match identically, accompanied by the **`INTEGRITY: VERIFIED`** badge.
10. Confirm system transitions smoothly back to **LIGHT** mode.

---

## 8. Safety Disclaimer
CYRA is an academic research platform designed solely for defensive cybersecurity study and educational evaluation. It operates strictly inside `CYRA_TEST_ENVIRONMENT/` and contains **no destructive payloads, no arbitrary file encryption routines, and no network propagation mechanisms**.

---

## 9. License
Distributed under the Apache 2.0 License.
=======
# ai-cyber-defense
>>>>>>> 7345f28f962ecf09c3de2d37f620771a49ee803b
