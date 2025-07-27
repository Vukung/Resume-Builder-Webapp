const { Pool } = require('pg');

// This configuration will use a DATABASE_URL environment variable on Render
// otherwise,
// it will fall back to local settings.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use a direct connection object for local development for now
  ...( !process.env.DATABASE_URL && {
    host: 'localhost',
    user: 'postgres', // Default user 
    password: 'root', // local PostgreSQL password
    database: 'resume_builder_database',
    port: 5432, // Default port for PostgreSQL
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
