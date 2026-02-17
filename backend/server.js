// server.js - Full working backend server
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./config/db');

// Import routes
const nomineeRoutes = require('./routes/nominees');
const voteRoutes = require('./routes/votes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection check on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connection pool initialized successfully');
    
    // Optional: quick sanity check
    const [dbInfo] = await connection.query('SELECT DATABASE() as db, VERSION() as version');
    console.log(`Database: ${dbInfo[0].db} | MySQL version: ${dbInfo[0].version}`);
    
    connection.release();
  } catch (err) {
    console.error('❌ Failed to initialize database connection:');
    console.error(err.message);
    if (err.code) {
      console.error(`Error code: ${err.code}`);
      if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error(' → Check DB_USER / DB_PASS in .env');
      }
      if (err.code === 'ER_BAD_DB_ERROR') {
        console.error(' → Check DB_NAME in .env (database may not exist)');
      }
      if (err.code === 'ECONNREFUSED') {
        console.error(' → MySQL server is not running or wrong host/port');
      }
    }
    process.exit(1); // Exit if DB is critical and fails
  }
})();

// Routes
app.use('/api/nominees', nomineeRoutes);
app.use('/api/votes', voteRoutes);

// Simple health check / welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Telegram Awards Voting API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
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
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Ready to accept requests...');
});