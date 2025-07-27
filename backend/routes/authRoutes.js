const express = require('express');
const router = express.Router();
const db = require('../db/db'); // This now imports the PostgreSQL pool
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-resume-builder-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  const { username, name, email, password, phone_num } = req.body;
  
  try {
    // Check if user already exists
    // PG CHANGE: Using $1, $2 placeholders and "USER" table
    db.query('SELECT * FROM "USER" WHERE email = $1 OR username = $2', [email, username], async (err, existing) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      
      // PG CHANGE: The result object has a 'rows' property
      if (existing.rows.length > 0) {
        return res.status(400).json({ 
          message: 'User already exists with this email or username' 
        });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      // PG CHANGE: Using $1, $2... placeholders, "USER" table, and RETURNING user_id
      const sql = `INSERT INTO "USER" (username, name, email, password, phone_num) VALUES ($1, $2, $3, $4, $5) RETURNING user_id`;
      db.query(sql, [username, name, email, hashedPassword, phone_num], (err, result) => {
        if (err) return res.status(500).json({ message: 'Signup failed', error: err });
        
        res.status(201).json({ 
          message: 'User created successfully', 
          // PG CHANGE: Getting the new ID from result.rows[0]
          userId: result.rows[0].user_id 
        });
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // PG CHANGE: Using $1 placeholder and "USER" table
  db.query('SELECT * FROM "USER" WHERE email = $1', [email], async (err, result) => {
    if (err) return res.status(500).json({
      message: 'Database error', 
      error: err 
    });
    
    // PG CHANGE: Checking result.rows
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password' 
      });
    }
    
    // PG CHANGE: Getting the user from result.rows[0]
    const user = result.rows[0];
    
    try {
      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.user_id, 
          email: user.email,
          username: user.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password from user object before sending
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({ 
        success: true,
        message: 'Login successful', 
        user: userWithoutPassword,
        token: token
      });
      
    } catch (error) {
      console.error('Password comparison error:', error);
      res.status(500).json({ message: 'Login error', error: error.message });
    }
  });
});

// Logout (No database interaction, no changes needed)
router.post('/logout', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Logout successful' 
  });
});

// Get user profile (protected route)
router.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  
  // PG CHANGE: Using $1 placeholder, "USER" table, and removed profile_pic
  const sql = 'SELECT user_id, username, name, email, phone_num FROM "USER" WHERE user_id = $1';
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    
    // PG CHANGE: Checking result.rows
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // PG CHANGE: Getting the user from result.rows[0]
    res.status(200).json(result.rows[0]);
  });
});

// Update user profile (protected route)
router.put('/profile/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, phone_num } = req.body;
  
  // PG CHANGE: Using $1, $2... placeholders and "USER" table
  const sql = 'UPDATE "USER" SET name = $1, email = $2, phone_num = $3 WHERE user_id = $4';
  db.query(sql, 
    [name, email, phone_num, userId], 
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      
      // PG CHANGE: Using result.rowCount instead of affectedRows
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.status(200).json({ 
        success: true,
        message: 'Profile updated successfully' 
      });
    }
  );
});

module.exports = router;
