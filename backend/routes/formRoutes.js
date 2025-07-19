const express = require('express');
const router = express.Router();
const db = require('../db/db');

// About - Handle both insert and update
router.post('/about', (req, res) => {
  const { resume_id, about_text } = req.body;
  
  // Only save if about_text is not empty
  if (!about_text || about_text.trim() === '') {
    return res.status(200).json({ message: 'About info skipped (empty)' });
  }
  
  // Check if about info already exists
  db.query('SELECT * FROM ABOUT_INFO WHERE resume_id = ? AND is_deleted = FALSE', [resume_id], (err, results) => {
    if (err) {
      console.error('About query error:', err);
      return res.status(500).json({ error: err });
    }
    
    if (results.length > 0) {
      // Update existing record
      db.query('UPDATE ABOUT_INFO SET about_text = ? WHERE resume_id = ? AND is_deleted = FALSE', 
        [about_text, resume_id], (err) => {
          if (err) {
            console.error('About update error:', err);
            return res.status(500).json({ error: err });
          }
          res.status(200).json({ message: 'About info updated' });
        });
    } else {
      // Insert new record
      db.query('INSERT INTO ABOUT_INFO (resume_id, about_text) VALUES (?, ?)', 
        [resume_id, about_text], (err) => {
          if (err) {
            console.error('About insert error:', err);
            return res.status(500).json({ error: err });
          }
          res.status(201).json({ message: 'About info saved' });
        });
    }
  });
});

// Education - Only save if at least one field is filled
router.post('/education', (req, res) => {
  const { resume_id, institution_name, degree, start_date_edu, end_date_edu } = req.body;
  
  // Only save if at least institution or degree is provided
  if ((!institution_name || institution_name.trim() === '') && 
      (!degree || degree.trim() === '')) {
    return res.status(200).json({ message: 'Education skipped (empty)' });
  }
  
  // Convert empty strings to null for DATE fields
  const startDate = start_date_edu && start_date_edu !== '' ? start_date_edu : null;
  const endDate = end_date_edu && end_date_edu !== '' ? end_date_edu : null;
  
  db.query('INSERT INTO EDUCATION (resume_id, institution_name, degree, start_date_edu, end_date_edu) VALUES (?, ?, ?, ?, ?)',
    [resume_id, institution_name || null, degree || null, startDate, endDate], (err) => {
      if (err) {
        console.error('Education insert error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'Education saved' });
    });
});

// Experience - Only save if at least one field is filled
router.post('/experience', (req, res) => {
  const { resume_id, job_title, company_name, start_date_ex, end_date_ex } = req.body;
  
  // Only save if at least job title or company is provided
  if ((!job_title || job_title.trim() === '') && 
      (!company_name || company_name.trim() === '')) {
    return res.status(200).json({ message: 'Experience skipped (empty)' });
  }
  
  // Convert empty strings to null for DATE fields
  const startDate = start_date_ex && start_date_ex !== '' ? start_date_ex : null;
  const endDate = end_date_ex && end_date_ex !== '' ? end_date_ex : null;
  
  db.query('INSERT INTO EXPERIENCE (resume_id, job_title, company_name, start_date_ex, end_date_ex) VALUES (?, ?, ?, ?, ?)',
    [resume_id, job_title || null, company_name || null, startDate, endDate], (err) => {
      if (err) {
        console.error('Experience insert error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'Experience saved' });
    });
});

// Projects - Only save if project name is provided
router.post('/projects', (req, res) => {
  const { resume_id, project_name, tech_stack, proj_desc, proj_link } = req.body;
  
  // Only save if project name is provided
  if (!project_name || project_name.trim() === '') {
    return res.status(200).json({ message: 'Project skipped (empty)' });
  }
  
  db.query('INSERT INTO PROJECT (resume_id, project_name, tech_stack, proj_desc, proj_link) VALUES (?, ?, ?, ?, ?)',
    [resume_id, project_name, tech_stack || null, proj_desc || null, proj_link || null], (err) => {
      if (err) {
        console.error('Projects insert error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'Project saved' });
    });
});

// Certifications - Only save if cert name is provided
router.post('/certifications', (req, res) => {
  const { resume_id, cert_name, issuer } = req.body;
  
  // Only save if cert name is provided
  if (!cert_name || cert_name.trim() === '') {
    return res.status(200).json({ message: 'Certification skipped (empty)' });
  }
  
  db.query('INSERT INTO CERTIFICATIONS (resume_id, cert_name, issuer) VALUES (?, ?, ?)',
    [resume_id, cert_name, issuer || null], (err) => {
      if (err) {
        console.error('Certifications insert error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'Certification saved' });
    });
});

// Clear existing data routes
router.post('/clear-education', (req, res) => {
  const { resume_id } = req.body;
  db.query('UPDATE EDUCATION SET is_deleted = TRUE WHERE resume_id = ?', [resume_id], (err) => {
    if (err) {
      console.error('Clear education error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Education cleared' });
  });
});

router.post('/clear-experience', (req, res) => {
  const { resume_id } = req.body;
  db.query('UPDATE EXPERIENCE SET is_deleted = TRUE WHERE resume_id = ?', [resume_id], (err) => {
    if (err) {
      console.error('Clear experience error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Experience cleared' });
  });
});

router.post('/clear-projects', (req, res) => {
  const { resume_id } = req.body;
  db.query('UPDATE PROJECT SET is_deleted = TRUE WHERE resume_id = ?', [resume_id], (err) => {
    if (err) {
      console.error('Clear projects error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Projects cleared' });
  });
});

router.post('/clear-certifications', (req, res) => {
  const { resume_id } = req.body;
  db.query('UPDATE CERTIFICATIONS SET is_deleted = TRUE WHERE resume_id = ?', [resume_id], (err) => {
    if (err) {
      console.error('Clear certifications error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Certifications cleared' });
  });
});

module.exports = router;