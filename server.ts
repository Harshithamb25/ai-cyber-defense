/**
 * CYRA Full-Stack Server
 * Express + Vite Middleware hosting the complete CYRA backend and REST API.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { cyraService } from './server/cyraService.js';
import { ExperimentRunner } from './server/experiments/ExperimentRunner.js';
import { ResponseRecoveryEngine } from './server/response/ResponseRecoveryEngine.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES FIRST ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CYRA Ransomware Defense Platform',
      version: '1.0.0-research',
      timestamp: new Date().toISOString()
    });
  });

  // System status and live telemetry
  app.get('/api/status', (req, res) => {
    const metrics = cyraService.getSystemMetrics();
    res.json({
      metrics,
      timestamp: new Date().toISOString()
    });
  });

  // Get all detection events
  app.get('/api/detections', (req, res) => {
    res.json({
      events: cyraService.getEvents()
    });
  });

  // Get specific detection by event_id
  app.get('/api/detections/:id', (req, res) => {
    const event = cyraService.getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Detection event not found' });
    }
    res.json({ event });
  });

  // Trigger safe behavioral simulation (No destructive encryption)
  app.post('/api/simulate', async (req, res) => {
    const scenario = req.body?.scenario || 'COMBINED_RANSOMWARE_LIKE_ACTIVITY';
    try {
      const result = await cyraService.generateSimulationEvent(scenario);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Simulation error' });
    }
  });

  // Investigate specific event with XAI and Hybrid ML
  app.post('/api/investigate/:id', (req, res) => {
    try {
      const investigation = cyraService.investigateEvent(req.params.id);
      res.json({ investigation });
    } catch (err: any) {
      res.status(404).json({ error: err.message || 'Investigation error' });
    }
  });

  // Get active and resolved incidents
  app.get('/api/incidents', (req, res) => {
    res.json({
      incidents: cyraService.getIncidents()
    });
  });

  // Get incident details
  app.get('/api/incidents/:id', (req, res) => {
    const incident = cyraService.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ incident });
  });

  // Execute safe containment
  app.post('/api/incidents/:id/contain', (req, res) => {
    try {
      const result = cyraService.containIncident(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Execute safe rollback & SHA-256 recovery
  app.post('/api/incidents/:id/recover', (req, res) => {
    try {
      const result = cyraService.recoverIncident(req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get experimental architecture comparison data
  app.get('/api/experiments', (req, res) => {
    const comparisons = ExperimentRunner.getArchitecturalComparison();
    res.json({ comparisons });
  });

  // Get real-time system metrics
  app.get('/api/metrics', (req, res) => {
    res.json(cyraService.getSystemMetrics());
  });

  // Inspect safe test environment files & cryptographic hashes
  app.get('/api/test-environment', (req, res) => {
    const files = ResponseRecoveryEngine.getTestEnvironmentStatus();
    res.json({ files });
  });

  // Reset demo state
  app.post('/api/reset', (req, res) => {
    cyraService.resetDemo();
    res.json({ status: 'ok', message: 'Demo state reset to initial baseline' });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CYRA Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
