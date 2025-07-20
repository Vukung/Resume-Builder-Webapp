const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Signup
router.post('/signup', (req, res) => {
  const { username, name, email, password, phone_num, profile_pic } = req.body;
  const sql = `INSERT INTO USER (username, name, email, password, phone_num, profile_pic) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [username, name, email, password, phone_num, profile_pic], (err, result) => {
    if (err) return res.status(500).json({ message: 'Signup failed', error: err });
    res.status(201).json({ message: 'User created', userId: result.insertId });
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM USER WHERE email = ? AND password = ?', [email, password], (err, result) => {
    if (err) return res.status(500).json({
      message: 'Login error', error: err 
    });
    if (result.length === 0) return res.status(401).json({
      message: 'Invalid credentials' 
    });
    res.status(200).json({ 
      message: 'Login successful', user: result[0] 
      // console.log('Login successful, redirecting...') 
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
