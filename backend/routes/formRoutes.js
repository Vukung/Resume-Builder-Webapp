const express = require('express');
const router = express.Router();
const db = require('../db/db'); // This now imports the PostgreSQL pool

// About - Handle both insert and update
router.post('/about', (req, res) => {
  const { resume_id, about_text } = req.body;
  
  if (!about_text || about_text.trim() === '') {
    return res.status(200).json({ message: 'About info skipped (empty)' });
  }
  
  // PG CHANGE: Using $1 placeholder
  db.query('SELECT * FROM ABOUT_INFO WHERE resume_id = $1 AND is_deleted = FALSE', [resume_id], (err, results) => {
    if (err) {
      console.error('About query error:', err);
      return res.status(500).json({ error: err });
    }
    
    // PG CHANGE: Checking results.rows
    if (results.rows.length > 0) {
      // PG CHANGE: Using $1, $2 placeholders
      db.query('UPDATE ABOUT_INFO SET about_text = $1 WHERE resume_id = $2 AND is_deleted = FALSE', 
        [about_text, resume_id], (err) => {
          if (err) {
            console.error('About update error:', err);
            return res.status(500).json({ error: err });
          }
          res.status(200).json({ message: 'About info updated' });
        });
    } else {
      // PG CHANGE: Using $1, $2 placeholders
      db.query('INSERT INTO ABOUT_INFO (resume_id, about_text) VALUES ($1, $2)', 
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

// Education
router.post('/education', (req, res) => {
  const { resume_id, institution_name, degree, start_date_edu, end_date_edu, grade_type, grade_value } = req.body;

  if ((!institution_name || institution_name.trim() === '') && 
      (!degree || degree.trim() === '')) {
    return res.status(200).json({ message: 'Education skipped (empty)' });
  }
  
  const startDate = start_date_edu || null;
  const endDate = end_date_edu || null;
  const final_grade_type = grade_type || 'percentage';
  const final_grade_value = (grade_value && String(grade_value).trim() !== '') ? grade_value : null;

  // PG CHANGE: Using $1, $2... placeholders
  const sql = `
    INSERT INTO EDUCATION 
    (resume_id, institution_name, degree, start_date_edu, end_date_edu, grade_type, grade_value) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;
  
  const values = [
    resume_id, 
    institution_name || null, 
    degree || null, 
    startDate, 
    endDate,
    final_grade_type,
    final_grade_value
  ];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Education insert error:', err);
      return res.status(500).json({ error: 'Database error while saving education.' });
    }
    res.status(201).json({ message: 'Education saved successfully' });
  });
});

// Experience
router.post('/experience', (req, res) => {
  const { resume_id, job_title, company_name, start_date_ex, end_date_ex, ex_desc } = req.body;
  
  if ((!job_title || job_title.trim() === '') && 
      (!company_name || company_name.trim() === '')) {
    return res.status(200).json({ message: 'Experience skipped (empty)' });
  }
  
  const startDate = start_date_ex || null;
  const endDate = end_date_ex || null;
  const final_ex_desc = ex_desc || null;

  // PG CHANGE: Using $1, $2... placeholders
  const sql = `
    INSERT INTO EXPERIENCE 
    (resume_id, job_title, company_name, start_date_ex, end_date_ex, ex_desc) 
    VALUES ($1, $2, $3, $4, $5, $6)
  `;
  
  const values = [
    resume_id, 
    job_title || null, 
    company_name || null, 
    startDate, 
    endDate,
    final_ex_desc 
  ];
  
  db.query(sql, values, (err) => {
    if (err) {
      console.error('Experience insert error:', err);
      return res.status(500).json({ error: 'Database error while saving experience.' });
    }
    res.status(201).json({ message: 'Experience saved' });
  });
});

// Projects
router.post('/projects', (req, res) => {
  const { resume_id, project_name, tech_stack, proj_desc, proj_link } = req.body;
  
  if (!project_name || project_name.trim() === '') {
    return res.status(200).json({ message: 'Project skipped (empty)' });
  }
  
  // PG CHANGE: Using $1, $2... placeholders
  const sql = 'INSERT INTO PROJECT (resume_id, project_name, tech_stack, proj_desc, proj_link) VALUES ($1, $2, $3, $4, $5)';
  db.query(sql,
    [resume_id, project_name, tech_stack || null, proj_desc || null, proj_link || null], (err) => {
      if (err) {
        console.error('Projects insert error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'Project saved' });
    });
});

// Certifications
router.post('/certifications', (req, res) => {
  const { resume_id, cert_name, issuer } = req.body;
  
  if (!cert_name || cert_name.trim() === '') {
    return res.status(200).json({ message: 'Certification skipped (empty)' });
  }
  
  // PG CHANGE: Using $1, $2, $3 placeholders
  const sql = 'INSERT INTO CERTIFICATIONS (resume_id, cert_name, issuer) VALUES ($1, $2, $3)';
  db.query(sql,
    [resume_id, cert_name, issuer || null], (err) => {
      if (err) {
        console.error('Certifications insert error:', err);
        return res.status(500).json({ error: err });
      }
      res.status(201).json({ message: 'Certification saved' });
    });
});

// --- Clear existing data routes ---
router.post('/clear-education', (req, res) => {
  const { resume_id } = req.body;
  // PG CHANGE: Using $1 placeholder
  db.query('UPDATE EDUCATION SET is_deleted = TRUE WHERE resume_id = $1', [resume_id], (err) => {
    if (err) {
      console.error('Clear education error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Education cleared' });
  });
});

router.post('/clear-experience', (req, res) => {
  const { resume_id } = req.body;
  // PG CHANGE: Using $1 placeholder
  db.query('UPDATE EXPERIENCE SET is_deleted = TRUE WHERE resume_id = $1', [resume_id], (err) => {
    if (err) {
      console.error('Clear experience error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Experience cleared' });
  });
});

router.post('/clear-projects', (req, res) => {
  const { resume_id } = req.body;
  // PG CHANGE: Using $1 placeholder
  db.query('UPDATE PROJECT SET is_deleted = TRUE WHERE resume_id = $1', [resume_id], (err) => {
    if (err) {
      console.error('Clear projects error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Projects cleared' });
  });
});

router.post('/clear-certifications', (req, res) => {
  const { resume_id } = req.body;
  // PG CHANGE: Using $1 placeholder
  db.query('UPDATE CERTIFICATIONS SET is_deleted = TRUE WHERE resume_id = $1', [resume_id], (err) => {
    if (err) {
      console.error('Clear certifications error:', err);
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: 'Certifications cleared' });
  });
});

module.exports = router;
