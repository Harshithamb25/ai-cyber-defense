# CYRA Defensive Safety Mandate & Containment Protocol

## 1. Safety Principles
1. **Zero Destructive Encryption**: CYRA is strictly a defensive research system. It does NOT contain code that encrypts arbitrary user files or deletes arbitrary system files.
2. **Strict Sandbox Boundary**: All ransomware-like simulations and rollback recovery operations operate exclusively within:
   ```
   CYRA_TEST_ENVIRONMENT/
   ```
3. **Decoy Canary Files**: Canary tripwire files (`CYRA_HONEY_DOCUMENT.txt`, `CYRA_HONEY_IMAGE.jpg`, `CYRA_HONEY_DATABASE.db`) are monitored for unauthorized write or rename operations.
4. **Cryptographic Baseline Snapshot**: Pristine copies of all sandbox files are maintained in `CYRA_TEST_ENVIRONMENT/.baseline/`.
5. **Deterministic Integrity Verification**: Upon incident containment and recovery, every file's SHA-256 hash is computed and compared against its baseline record. If pre- and post-hashes match identically, status is logged as `INTEGRITY: VERIFIED`.
