// server.js - Corrected full version with strong CORS, stable connection, no crashes
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./config/db');

// Create Express app
const app = express();

// === CORS - MUST BE THE VERY FIRST MIDDLEWARE ===
app.use(cors({
  origin: '*',  // Wildcard for development (allows localhost:5175, 3000, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Manual fallback headers for OPTIONS preflight (extra safety)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Now JSON parser and other middleware
app.use(express.json());

// Import routes
const nomineeRoutes = require('./routes/nominees');
const voteRoutes = require('./routes/votes');
const authRoutes = require('./routes/auth'); // if you have this

// Mount routes
app.use('/api/nominees', nomineeRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/auth', authRoutes);

// Database connection check on startup - safe, no double release
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection pool initialized successfully');

    const dbInfo = await client.query('SELECT current_database() AS db, version() AS version');
    console.log(`Database: ${dbInfo.rows[0].db} | PostgreSQL version: ${dbInfo.rows[0].version}`);

    const countRes = await client.query('SELECT COUNT(*) FROM nominees');
    console.log(`Total nominees in DB: ${countRes.rows[0].count}`);

    // No manual release - pool auto-handles
  } catch (err) {
    console.error('❌ PostgreSQL connection failed on startup:');
    console.error('Error code:', err.code || 'N/A');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
})();

// Health check / welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Telegram Awards Voting API is running (PostgreSQL / Render)',
    timestamp: new Date().toISOString(),
    endpoints: {
      root: '/',
      nominees: '/api/nominees (GET)',
      vote: '/api/votes/vote (POST)'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:');
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Ready to accept requests...');
});
