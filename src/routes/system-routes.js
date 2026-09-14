const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ name: 'Taskr API', version: '1.0.0', docs: '/health' });
});

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/webhooks/task-update', (req, res) => {
  // TODO: process webhook payload
  console.log('[WEBHOOK] Received:', req.body);
  res.json({ received: true });
});

module.exports = { systemRouter: router };
