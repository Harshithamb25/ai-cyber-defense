@echo off
echo =====================================================================
echo CYRA: Cybersecurity Yielding Resilient Adaptive Defense
echo Starting on Windows 11 HP Laptop Environment
echo =====================================================================

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js (v18+) to run the CYRA platform.
    pause
    exit /b 1
)

:: Ensure test environment baseline directory exists
if not exist "CYRA_TEST_ENVIRONMENT\.baseline" (
    echo [SETUP] Initializing CYRA_TEST_ENVIRONMENT cryptographic baseline...
    mkdir "CYRA_TEST_ENVIRONMENT\.baseline" 2>nul
    copy "CYRA_TEST_ENVIRONMENT\*.*" "CYRA_TEST_ENVIRONMENT\.baseline\" >nul
)

echo [START] Launching CYRA Full-Stack Server on port 3000...
echo [INFO] Endpoint Security Adapter: Windows Defender Operational Event Log Reader
echo [INFO] UI will be available at: http://localhost:3000
echo.

npm run dev

pause
