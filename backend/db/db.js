const { Pool } = require('pg');

// This configuration will use a DATABASE_URL environment variable on Render
// otherwise, it will fall back to local settings from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use environment variables for local development
  ...( !process.env.DATABASE_URL && {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'resume_builder_database',
    port: process.env.DB_PORT || 5432,
  }),
  // This is required for Render's managed database and other cloud providers
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Test the connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Database connected successfully!');
    client.query('SELECT NOW()', (err, result) => {
        release(); // Release the client back to the pool
        if (err) {
            return console.error('Error executing query', err.stack);
        }
    });
});

module.exports = pool;
