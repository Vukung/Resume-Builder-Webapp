const mysql = require('mysql2');

// This configuration to use Render's environment variables when available,
// otherwise
// it will fall back to local development database settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'resume_builder_database',
  port: process.env.DB_PORT || 3306, // Default MySQL port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Database connected successfully!');
    connection.release(); // Release the connection
});

// Export the pool for use in other files
module.exports = pool;
