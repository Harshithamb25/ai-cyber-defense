"""
Unit tests for CYRA FastAPI backend
"""

import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "CYRA" in data["service"]

def test_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["current_system_mode"] == "LIGHT"

def test_simulation():
    response = client.post("/api/simulate", json={"scenario": "COMBINED_RANSOMWARE_LIKE_ACTIVITY"})
    assert response.status_code == 200
    data = response.json()
    assert "event" in data
    assert data["event"]["severity"] == "CRITICAL"
    assert data["event"]["source"] == "CONTROLLED SIMULATION"

if __name__ == "__main__":
    test_health()
    test_status()
    test_simulation()
    print("All Python backend tests passed successfully.")
