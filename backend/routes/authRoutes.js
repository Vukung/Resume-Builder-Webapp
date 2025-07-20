const express = require('express');
const router = express.Router();
const db = require('../db/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-resume-builder-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  const { username, name, email, password, phone_num } = req.body;
  
  try {
    // Check if user already exists
    db.query('SELECT * FROM USER WHERE email = ? OR username = ?', [email, username], async (err, existing) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err });
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          message: 'User already exists with this email or username' 
        });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Insert new user
      const sql = `INSERT INTO USER (username, name, email, password, phone_num, profile_pic) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(sql, [username, name, email, hashedPassword, phone_num, null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Signup failed', error: err });
        
        res.status(201).json({ 
          message: 'User created successfully', 
          userId: result.insertId 
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
  
  db.query('SELECT * FROM USER WHERE email = ?', [email], async (err, result) => {
    if (err) return res.status(500).json({
      message: 'Database error', 
      error: err 
    });
    
    if (result.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password' 
      });
    }
    
    const user = result[0];
    
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
        token: token // This is crucial for authentication
      });
      
    } catch (error) {
      console.error('Password comparison error:', error);
      res.status(500).json({ message: 'Login error', error: error.message });
    }
  });
});

// Logout
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // Optional: You could maintain a blacklist of tokens for added security
  res.status(200).json({ 
    success: true,
    message: 'Logout successful' 
  });
});

// Get user profile (protected route)
router.get('/profile/:id', (req, res) => {
  const userId = req.params.id;
  
  db.query('SELECT user_id, username, name, email, phone_num, profile_pic FROM USER WHERE user_id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(result[0]);
  });
});

// Update user profile (protected route)
router.put('/profile/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, phone_num } = req.body;
  
  db.query('UPDATE USER SET name = ?, email = ?, phone_num = ? WHERE user_id = ?', 
    [name, email, phone_num, userId], 
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      
      if (result.affectedRows === 0) {
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
