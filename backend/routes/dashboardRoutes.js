const express = require('express');
const router = express.Router();
const db = require('../db/db'); // This now imports the PostgreSQL pool

// Show all resumes for a user
router.get('/:userId', (req, res) => {
  // PG CHANGE: Using $1 placeholder
  const sql = 'SELECT * FROM RESUME WHERE user_id = $1 AND is_deleted = FALSE';
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    
    // PG CHANGE: The data is in the 'rows' property
    res.status(200).json(results.rows);
  });
});

// Find resume by name for a user
router.get('/search/:userId/:title', (req, res) => {
  // PG CHANGE: Using $1 and $2 placeholders
  const sql = 'SELECT * FROM RESUME WHERE user_id = $1 AND title LIKE $2 AND is_deleted = FALSE';
  db.query(sql, 
    [req.params.userId, `%${req.params.title}%`], 
    (err, results) => {
      if (err) return res.status(500).json({ error: err });

      // PG CHANGE: The data is in the 'rows' property
      res.status(200).json(results.rows);
    }
  );
});

module.exports = router;
