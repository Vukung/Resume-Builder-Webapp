const express = require('express');
const router = express.Router();
const db = require('../db/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profile-pics/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.params.userId;
    const fileExtension = path.extname(file.originalname);
    cb(null, `user_${userId}_${Date.now()}${fileExtension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET: Fetch user profile (PROTECTED)
router.get('/:userId', authenticateToken, authorizeUser, (req, res) => {
  const userId = req.params.userId;
  
  const query = 'SELECT user_id, username, name, email, phone_num, profile_pic FROM USER WHERE user_id = ?';
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// PUT: Update user profile information (PROTECTED)
router.put('/:userId', authenticateToken, authorizeUser, (req, res) => {
  const userId = req.params.userId;
  const { name, email, phone_num } = req.body;
  
  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Additional validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  const query = 'UPDATE USER SET name = ?, email = ?, phone_num = ? WHERE user_id = ?';
  db.query(query, [name, email, phone_num || null, userId], (error, result) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return updated user data
    db.query(
      'SELECT user_id, username, name, email, phone_num, profile_pic FROM USER WHERE user_id = ?',
      [userId],
      (err, userData) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to fetch updated user data' });
        }
        
        res.json({
          success: true,
          message: 'Profile updated successfully',
          user: userData[0]
        });
      }
    );
  });
});

// POST: Upload profile picture (PROTECTED)
router.post('/:userId/upload', authenticateToken, authorizeUser, upload.single('profilePic'), (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = `/uploads/profile-pics/${req.file.filename}`;
    
    // Optional: Remove old profile picture file
    db.query('SELECT profile_pic FROM USER WHERE user_id = ?', [userId], (selectErr, oldData) => {
      if (!selectErr && oldData.length > 0 && oldData[0].profile_pic) {
        const oldFilePath = path.join(__dirname, '..', oldData[0].profile_pic.substring(1)); // Remove leading slash
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath); // Delete old file
        }
      }
    });
    
    // Update database with new file path
    db.query(
      'UPDATE USER SET profile_pic = ? WHERE user_id = ?',
      [filePath, userId],
      (error, result) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Failed to update profile picture in database' });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
          success: true,
          message: 'Profile picture uploaded successfully',
          filePath: filePath,
          fileName: req.file.filename
        });
      }
    );
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

module.exports = router;
