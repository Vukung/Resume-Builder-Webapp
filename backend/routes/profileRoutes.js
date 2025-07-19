const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Fetch profile
router.get('/:userId', (req, res) => {
  db.query('SELECT name, email, profile_pic FROM USER WHERE user_id = ?', [req.params.userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(result[0]);
  });
});

// Mock photo upload
router.post('/upload', (req, res) => {
  res.status(200).json({ message: 'Photo uploaded successfully' });
});

module.exports = router;
