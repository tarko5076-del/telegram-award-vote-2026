// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// === Allowed origins (add more if you have preview/staging branches) ===
const allowedOrigins = [
  'http://localhost:3000',                // React dev
  'http://localhost:5173',                // Vite dev
  'http://localhost:5185',                // other local port
  'https://telegram-award-vote-2026.vercel.app',  // your main production frontend
  // If using Vercel preview branches, you can temporarily add patterns like:
  // 'https://telegram-award-vote-2026-git-*.vercel.app'
];

// === CORS configuration (simple + reliable) ===
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// === Log incoming Origin for debugging (remove/comment out later if not needed) ===
app.use((req, res, next) => {
  console.log(`[CORS DEBUG] Incoming Origin: ${req.headers.origin || 'none'}`);
  console.log(`[CORS DEBUG] Request: ${req.method} ${req.path}`);
  next();
});

// === Explicit preflight handler – FIXED for Express 5+ ===
app.options('/*path', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin === undefined) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }
  res.status(403).json({ error: 'Origin not allowed' });
});

// === Middleware ===
app.use(express.json());

// === Routes ===
const nomineeRoutes = require('./routes/nominees');
const voteRoutes    = require('./routes/votes');
const authRoutes    = require('./routes/auth');

app.use('/api/nominees', nomineeRoutes);
app.use('/api/votes',    voteRoutes);
app.use('/api/auth',     authRoutes);

// === Health check ===
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Telegram Awards Voting API (PostgreSQL + Render)',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/',
      nominees: 'GET /api/nominees',
      vote:     'POST /api/votes/vote',
      auth:     'POST /api/auth/login',
    },
  });
});

// === Database startup check ===
(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ PostgreSQL connection pool initialized');

    const dbInfo = await client.query('SELECT current_database() AS db, version() AS pg_version');
    console.log(`Connected to DB: ${dbInfo.rows[0].db}`);
    console.log(`PostgreSQL version: ${dbInfo.rows[0].pg_version}`);

    const countRes = await client.query('SELECT COUNT(*) AS total FROM nominees');
    console.log(`Nominees count: ${countRes.rows[0].total}`);
  } catch (err) {
    console.error('❌ Database startup check failed:', err.message);
  } finally {
    if (client) client.release();
  }
})();

// === 404 handler ===
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// === Global error handler ===
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// === Start server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});