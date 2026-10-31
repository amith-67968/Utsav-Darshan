require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { supabase } = require('./config/supabase');

const app = express();
app.disable('x-powered-by');
app.use(helmet());

function normalizeOrigin(value) {
  const cleaned = String(value || '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  try { return new URL(cleaned).origin; }
  catch { return cleaned; }
}

app.use(cors({
  origin(origin, callback) {
    const configured = (process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',').map(normalizeOrigin).filter(Boolean);
    if (!origin || configured.includes(normalizeOrigin(origin))) return callback(null, true);
    console.warn(`[CORS] Rejected browser origin: ${origin}`);
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.use('/api', routes);
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'An unexpected server error occurred' : err.message });
});

module.exports = app;
