const express = require('express');
const router = express.Router();
const db = require('../db/db');


// Create a new resume
router.post('/create', (req, res) => {
    const { user_id, title } = req.body;
    const sql = `INSERT INTO RESUME (user_id, title, is_deleted) VALUES (?, ?, FALSE)`;
  
    db.query(sql, [user_id, title], (err, result) => {
      if (err) {
        console.error('Resume creation failed:', err);
        return res.status(500).json({ message: 'Failed to create resume', error: err });
      }
      res.status(201).json({ message: 'Resume created', resumeId: result.insertId });
    });
  });
  




// Show all resumes
router.get('/:userId', (req, res) => {
  db.query('SELECT * FROM RESUME WHERE user_id = ? AND is_deleted = FALSE', [req.params.userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(results);
  });
});

// Open each resume
router.get('/open/:resumeId', (req, res) => {
  db.query('SELECT * FROM RESUME WHERE resume_id = ?', [req.params.resumeId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(result[0]);
  });
});

// Duplicate resume
router.post('/duplicate/:resumeId', (req, res) => {
  const sql = `INSERT INTO RESUME (user_id, title) SELECT user_id, CONCAT(title, ' (Copy)') FROM RESUME WHERE resume_id = ?`;
  db.query(sql, [req.params.resumeId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: 'Resume duplicated', newId: result.insertId });
  });
});

// Soft Delete resume
router.post('/delete/:resumeId', (req, res) => {
  db.query('UPDATE RESUME SET is_deleted = TRUE WHERE resume_id = ?', [req.params.resumeId], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: 'Resume deleted' });
  });
});

// Download (as JSON for now)
router.get('/download/:resumeId', (req, res) => {
  db.query('SELECT * FROM RESUME WHERE resume_id = ?', [req.params.resumeId], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(result[0]);
  });
});


// Get complete resume data with all sections
router.get('/data/:resumeId', (req, res) => {
    const resumeId = req.params.resumeId;
    
    // Get basic resume info
    db.query('SELECT * FROM RESUME WHERE resume_id = ?', [resumeId], (err, resumeResult) => {
      if (err) return res.status(500).json({ error: err });
      
      if (resumeResult.length === 0) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      
      const resume = resumeResult[0];
      
      // Get about info
      db.query('SELECT * FROM ABOUT_INFO WHERE resume_id = ? AND is_deleted = FALSE', [resumeId], (err, aboutResult) => {
        if (err) return res.status(500).json({ error: err });
        
        // Get education
        db.query('SELECT * FROM EDUCATION WHERE resume_id = ? AND is_deleted = FALSE', [resumeId], (err, educationResult) => {
          if (err) return res.status(500).json({ error: err });
          
          // Get experience
          db.query('SELECT * FROM EXPERIENCE WHERE resume_id = ? AND is_deleted = FALSE', [resumeId], (err, experienceResult) => {
            if (err) return res.status(500).json({ error: err });
            
            // Get projects
            db.query('SELECT * FROM PROJECT WHERE resume_id = ? AND is_deleted = FALSE', [resumeId], (err, projectResult) => {
              if (err) return res.status(500).json({ error: err });
              
              // Get certifications
              db.query('SELECT * FROM CERTIFICATIONS WHERE resume_id = ? AND is_deleted = FALSE', [resumeId], (err, certResult) => {
                if (err) return res.status(500).json({ error: err });
                
                // Combine all data
                const completeResume = {
                  ...resume,
                  about: aboutResult[0] || null,
                  education: educationResult,
                  experience: experienceResult,
                  projects: projectResult,
                  certifications: certResult
                };
                
                res.status(200).json(completeResume);
              });
            });
          });
        });
      });
    });
  });


module.exports = router;
