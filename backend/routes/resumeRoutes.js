const express = require('express');
const router = express.Router();
const db = require('../db/db'); // This now imports the PostgreSQL pool

// Create a new resume
router.post('/create', (req, res) => {
  const { user_id, title } = req.body;
  // PG CHANGE: Using $1, $2 and RETURNING resume_id
  const sql = `INSERT INTO RESUME (user_id, title, is_deleted) VALUES ($1, $2, FALSE) RETURNING resume_id`;

  db.query(sql, [user_id, title], (err, result) => {
    if (err) {
      console.error('Resume creation failed:', err);
      return res.status(500).json({ message: 'Failed to create resume', error: err });
    }
    // PG CHANGE: Get ID from result.rows[0]
    res.status(201).json({ message: 'Resume created', resumeId: result.rows[0].resume_id });
  });
});

// Show all resumes for a user
router.get('/:userId', (req, res) => {
  // PG CHANGE: Using $1
  const sql = 'SELECT * FROM RESUME WHERE user_id = $1 AND is_deleted = FALSE';
  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    // PG CHANGE: Data is in results.rows
    res.status(200).json(results.rows);
  });
});

// Open a single resume
router.get('/open/:resumeId', (req, res) => {
  // PG CHANGE: Using $1
  const sql = 'SELECT * FROM RESUME WHERE resume_id = $1';
  db.query(sql, [req.params.resumeId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    // PG CHANGE: Data is in result.rows[0]
    res.status(200).json(result.rows[0]);
  });
});

// Duplicate resume
router.post('/duplicate/:resumeId', (req, res) => {
  // PG CHANGE: Using $1 and RETURNING resume_id
  const sql = `INSERT INTO RESUME (user_id, title) SELECT user_id, CONCAT(title, ' (Copy)') FROM RESUME WHERE resume_id = $1 RETURNING resume_id`;
  db.query(sql, [req.params.resumeId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    // PG CHANGE: Get ID from result.rows[0]
    res.status(201).json({ message: 'Resume duplicated', newId: result.rows[0].resume_id });
  });
});

// Soft Delete resume
router.post('/delete/:resumeId', (req, res) => {
  // PG CHANGE: Using $1
  const sql = 'UPDATE RESUME SET is_deleted = TRUE WHERE resume_id = $1';
  db.query(sql, [req.params.resumeId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Resume deleted' });
  });
});

// Download (as JSON for now)
router.get('/download/:resumeId', (req, res) => {
  // PG CHANGE: Using $1
  const sql = 'SELECT * FROM RESUME WHERE resume_id = $1';
  db.query(sql, [req.params.resumeId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    // PG CHANGE: Data is in result.rows[0]
    res.status(200).json(result.rows[0]);
  });
});

// Get complete resume data with all sections (Refactored for performance)
router.get('/data/:resumeId', async (req, res) => {
  const resumeId = req.params.resumeId;
  
  try {
    // 1. Get the main resume document
    const resumeResult = await db.query('SELECT * FROM RESUME WHERE resume_id = $1', [resumeId]);
    
    if (resumeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    const resume = resumeResult.rows[0];

    // 2. Fetch all sections in parallel for better performance
    const [aboutResult, educationResult, experienceResult, projectResult, certResult] = await Promise.all([
      db.query('SELECT * FROM ABOUT_INFO WHERE resume_id = $1 AND is_deleted = FALSE', [resumeId]),
      db.query('SELECT * FROM EDUCATION WHERE resume_id = $1 AND is_deleted = FALSE', [resumeId]),
      db.query('SELECT * FROM EXPERIENCE WHERE resume_id = $1 AND is_deleted = FALSE', [resumeId]),
      db.query('SELECT * FROM PROJECT WHERE resume_id = $1 AND is_deleted = FALSE', [resumeId]),
      db.query('SELECT * FROM CERTIFICATIONS WHERE resume_id = $1 AND is_deleted = FALSE', [resumeId])
    ]);

    // 3. Combine all data into a single response object
    const completeResume = {
      ...resume,
      about: aboutResult.rows[0] || null,
      education: educationResult.rows,
      experience: experienceResult.rows,
      projects: projectResult.rows,
      certifications: certResult.rows
    };
    
    res.status(200).json(completeResume);

  } catch (err) {
    console.error(`Error fetching data for resumeId ${resumeId}:`, err);
    res.status(500).json({ error: 'Failed to fetch complete resume data.' });
  }
});

module.exports = router;
