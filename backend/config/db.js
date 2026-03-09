// config/db.js — Clean, no crash version
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Single startup test - no manual release
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Render PostgreSQL successfully!');

    const dbInfo = await client.query('SELECT current_database() AS db, version() AS version');
    console.log(`Database: ${dbInfo.rows[0].db} | PostgreSQL version: ${dbInfo.rows[0].version}`);

    const countRes = await client.query('SELECT COUNT(*) FROM nominees');
    console.log('Total nominees in DB:', countRes.rows[0].count);
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:');
    console.error(err);
  }
  // No release or finally - pool auto-cleans
})();

module.exports = pool;