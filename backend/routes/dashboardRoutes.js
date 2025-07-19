const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Show all resumes
router.get('/:userId', (req, res) => {
  db.query('SELECT * FROM RESUME WHERE user_id = ? AND is_deleted = FALSE', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

// Find resume by name
router.get('/search/:userId/:title', (req, res) => {
  db.query('SELECT * FROM RESUME WHERE user_id = ? AND title LIKE ? AND is_deleted = FALSE', 
  [req.params.userId, `%${req.params.title}%`], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

module.exports = router;
