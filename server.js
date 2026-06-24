// ============================================================
//  CHAT TPG PORTFOLIO — server.js
//  Self-hosted Express server for Contabo VPS deployment
// ============================================================
require('dotenv').config();

const express = require('express');
const path    = require('path');

const portfolioRouter = require('./routes/portfolio');
const uploadRouter    = require('./routes/upload');

const app  = express();
const PORT = process.env.PORT || 3000;

// Allow large base64 image/video payloads in the request body
app.use(express.json({ limit: '50mb' }));

// CORS — open by default since this is a public portfolio site.
// Tighten by setting ALLOWED_ORIGIN in .env if you want to restrict it.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// API routes (same paths the frontend already calls: /api/portfolio, /api/upload)
app.use('/api/portfolio', portfolioRouter);
app.use('/api/upload', uploadRouter);

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any non-API route (simple SPA-style catch-all)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Basic error handler so a thrown error doesn't crash the whole process
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Chat TPG Portfolio running at http://localhost:${PORT}`);
});
