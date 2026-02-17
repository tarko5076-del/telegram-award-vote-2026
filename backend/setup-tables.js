// backend/setup-tables.js
// One-time script to create tables - run once with: node setup-tables.js

require('dotenv').config();
const pool = require('./config/db');

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to database for table setup');

    // Create nominees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS nominees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Table "nominees" created or already exists');

    // Create voters table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS voters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        category VARCHAR(100) NOT NULL,
        nominee_id INT NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote_per_category (ip_address, category),
        FOREIGN KEY (nominee_id) REFERENCES nominees(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Table "voters" created or already exists');

    console.log('🎉 All tables are ready!');
    console.log('You can now safely delete this file or keep it for reference.');
  } catch (err) {
    console.error('❌ Failed to create tables:');
    console.error(err.message);
    if (err.code) console.error('Error code:', err.code);
  } finally {
    if (connection) connection.release();
    process.exit(0); // End the script
  }
})();