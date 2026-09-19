#!/usr/bin/env bash
set -e

echo "====================================================================="
echo "CYRA: Cybersecurity Yielding Resilient Adaptive Defense"
echo "====================================================================="

# Initialize test environment baseline if needed
mkdir -p CYRA_TEST_ENVIRONMENT/.baseline
cp CYRA_TEST_ENVIRONMENT/*.* CYRA_TEST_ENVIRONMENT/.baseline/ 2>/dev/null || true

echo "[START] Launching CYRA Full-Stack Server on port 3000..."
npm run dev
