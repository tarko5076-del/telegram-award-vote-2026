// server.js - Updated with flexible CORS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

// === CORS configuration ===
const allowedOrigins = [
  "http://localhost:3000",   // React dev server
  "http://localhost:5173",   // Vite dev server
  "https://telegram-award-vote-2026-drex.vercel.app", // current Vercel frontend
  "https://telegram-award-vote-2026-1.onrender.com"   // backend domain (if serving frontend too)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman, curl, etc.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// JSON parser
app.use(express.json());

// === Import routes ===
const nomineeRoutes = require('./routes/nominees');
const voteRoutes    = require('./routes/votes');
const authRoutes    = require('./routes/auth');

// === Mount routes ===
app.use('/api/nominees', nomineeRoutes);
app.use('/api/votes',    voteRoutes);
app.use('/api/auth',     authRoutes);

// === Database connection health check ===
(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ PostgreSQL connection pool initialized successfully');

    const dbInfo = await client.query('SELECT current_database() AS db, version() AS pg_version');
    console.log(`Connected to database: ${dbInfo.rows[0].db}`);
    console.log(`PostgreSQL version: ${dbInfo.rows[0].pg_version}`);

    const countRes = await client.query('SELECT COUNT(*) AS total FROM nominees');
    console.log(`Total nominees in DB: ${countRes.rows[0].total}`);

  } catch (err) {
    console.error('❌ PostgreSQL startup check failed:');
    console.error('Error code:', err.code || 'N/A');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    if (client) client.release();
  }
})();

// Root / health check
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
      auth:     'POST /api/auth/login'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:');
  console.error(err.stack || err);

  const status = err.status || 500;
  res.status(status).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Waiting for requests...');
});
