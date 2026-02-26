// db.js  ← this is your connection file
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // ← Render provides this internally
  // NO ssl line needed here! Internal connections are private & secure without it
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Optional test (keep this – prints in logs)
(async () => {
  try {
    await pool.connect();
    console.log('✅ Connected to PostgreSQL INTERNAL on Render!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
})();

module.exports = pool;