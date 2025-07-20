const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "root",
  database: "resume_builder_database"  // Changed from resume_builder_db
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});

module.exports = db;
