const { Pool } = require('pg');

// This configuration will use a DATABASE_URL environment variable on Render
// otherwise
// it will fall back to local settings.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Use a direct connection object for local development if DATABASE_URL isn't set
  ...( !process.env.DATABASE_URL && {
    host: 'localhost',
    user: 'postgres',
    password: 'root', // Your local PostgreSQL password
    database: 'resume_builder_database',
    port: 5432,
  }),
  // Required for Render's managed database and other cloud providers
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,

  family: 4, // Force connection over IPv4
});

// Test the connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Database connected successfully!');
    client.query('SELECT NOW()', (err, result) => {
        release(); 
        if (err) {
            return console.error('Error executing query', err.stack);
        }
    });
});

module.exports = pool;
