const express = require('express');
const router = express.Router();
const db = require('../db/db'); // This now imports the PostgreSQL pool
const jwt = require('jsonwebtoken');

// JWT Secret - should match your authRoutes.js
const JWT_SECRET = process.env.JWT_SECRET || 'your-resume-builder-secret-key';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Add user info to request object
    next();
  });
};

// Authorization middleware - ensures user can only access their own data
const authorizeUser = (req, res, next) => {
  const userId = parseInt(req.params.userId);
  const tokenUserId = req.user.userId;

  if (userId !== tokenUserId) {
    return res.status(403).json({ error: 'Access denied - you can only access your own profile' });
  }
  
  next();
};

// GET: Fetch user profile (PROTECTED)
router.get('/:userId', authenticateToken, authorizeUser, (req, res) => {
  const userId = req.params.userId;
  
  // PG CHANGE: Removed profile_pic, using $1 placeholder and "USER" table
  const query = 'SELECT user_id, username, name, email, phone_num FROM "USER" WHERE user_id = $1';
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    // PG CHANGE: Checking results.rows
    if (results.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // PG CHANGE: Getting data from results.rows[0]
    res.json(results.rows[0]);
  });
});

// PUT: Update user profile information (PROTECTED)
router.put('/:userId', authenticateToken, authorizeUser, (req, res) => {
  const userId = req.params.userId;
  const { name, email, phone_num } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // PG CHANGE: Using $1, $2... placeholders and "USER" table
  const query = 'UPDATE "USER" SET name = $1, email = $2, phone_num = $3 WHERE user_id = $4';
  db.query(query, [name, email, phone_num || null, userId], (error, result) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    // PG CHANGE: Using result.rowCount instead of affectedRows
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return updated user data
    // PG CHANGE: Removed profile_pic, using $1 placeholder and "USER" table
    const selectQuery = 'SELECT user_id, username, name, email, phone_num FROM "USER" WHERE user_id = $1';
    db.query(
      selectQuery,
      [userId],
      (err, userData) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch updated user data' });
        }
        
        res.json({
          success: true,
          message: 'Profile updated successfully',
          // PG CHANGE: Getting data from userData.rows[0]
          user: userData.rows[0]
        });
      }
    );
  });
});

module.exports = router;
