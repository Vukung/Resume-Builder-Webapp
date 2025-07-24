import React from 'react';

const PDFResumePreview = ({ resumeForm, currentUser }) => {
  // --- CLEANED UP DATE HELPERS ---

  // For Education Section: Returns only the year (e.g., "2026")
  const formatYearOnly = (dateString) => {
    if (!dateString) return '';
    return dateString.slice(0, 4);
  };

  // For Experience Section: Returns month and year (e.g., "Jul 2025")
  const formatMonthYear = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };
  
  // Creates the date range string for experience (e.g., "Jan 2024 - Jul 2025")
  const formatExperienceDateRange = (startDate, endDate) => {
    const start = formatMonthYear(startDate);
    const end = endDate ? formatMonthYear(endDate) : 'Present';
    if (!start && !end) return '';
    if (!start) return end;
    if (!end) return start; // If only start date is present
    return `${start} - ${end}`;
  };

  // Format grade display based on type
  const formatGrade = (gradeType, gradeValue) => {
    if (!gradeValue || gradeValue === '') return '';
    if (gradeType === 'cgpa') {
      return `CGPA ${gradeValue}/10`;
    } else {
      return `${gradeValue}%`;
    }
  };

  const uniqueSkills = resumeForm.projects
    .filter(proj => proj.tech_stack)
    .flatMap(proj => proj.tech_stack.split(',').map(tech => tech.trim()))
    .filter(skill => skill.length > 0);

  const skillsSet = [...new Set(uniqueSkills)];

  return (
    <div
      className="bg-white text-black w-full mx-auto"
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        padding: '20px',
        boxSizing: 'border-box',
        maxWidth: '800px'
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e5e5', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1a1a1a' }}>
          {currentUser?.name || 'Your Name'}
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '11px', color: '#666' }}>
          {currentUser?.email && <span>📧 {currentUser.email}</span>}
          {currentUser?.phone_num && <span>📞 {currentUser.phone_num}</span>}
          <span>📍 Your City, State</span>
        </div>
      </div>

      {/* Professional Summary */}
      {resumeForm.about_text && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ margin: '0', textAlign: 'justify', lineHeight: '1.5', color: '#333' }}>
            {resumeForm.about_text}
          </p>
        </div>
      )}

      {/* --- UPDATED EXPERIENCE SECTION --- */}
      {resumeForm.experience.some(exp => exp.job_title || exp.company_name) && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {resumeForm.experience.map((exp, index) => (
            (exp.job_title || exp.company_name) && (
              <div key={index} style={{ marginBottom: '15px' }}>
                {/* Line 1: Job Title and Date Range */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                    {exp.job_title}
                  </h3>
                  {(exp.start_date_ex || exp.end_date_ex) && (
                    <span style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap', paddingLeft: '10px' }}>
                      {formatExperienceDateRange(exp.start_date_ex, exp.end_date_ex)}
                    </span>
                  )}
                </div>

                {/* Line 2: Company Name */}
                <p style={{ fontSize: '12px', color: '#0066cc', margin: '0 0 5px 0', fontWeight: '600' }}>
                  {exp.company_name}
                </p>

                {/* Description Bullet Points */}
                {exp.ex_desc && (
                  <ul style={{ margin: '0 0 0 20px', padding: '0', listStyleType: 'disc' }}>
                    {exp.ex_desc.split('\n').map((point, i) => (
                      point.replace(/^•\s*/, '').trim() && (
                        <li key={i} style={{ marginBottom: '4px', lineHeight: '1.4', color: '#333' }}>
                          {point.replace(/^•\s*/, '')}
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* Education */}
      {resumeForm.education.some(edu => edu.institution_name || edu.degree) && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            EDUCATION
          </h2>
          {resumeForm.education.map((edu, index) => (
            (edu.institution_name || edu.degree) && (
              <div key={index} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                    {edu.institution_name}
                  </h3>
                  {edu.end_date_edu && (
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>
                      {formatYearOnly(edu.end_date_edu)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#0066cc', margin: '0', fontWeight: '600' }}>
                    {edu.degree}
                  </p>
                  {edu.grade_value && (
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                      | {formatGrade(edu.grade_type || 'percentage', edu.grade_value)}
                    </span>
                  )}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Skills */}
      {skillsSet.length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            TECHNICAL SKILLS
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsSet.map((skill, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '500'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resumeForm.projects.some(proj => proj.project_name) && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            PROJECTS
          </h2>
          {resumeForm.projects.map((proj, index) => (
            proj.project_name && (
              <div key={index} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                    {proj.project_name}
                  </h3>
                  {proj.proj_link && (
                    <span style={{ fontSize: '10px', color: '#0066cc' }}>
                      🔗 {proj.proj_link}
                    </span>
                  )}
                </div>
                {proj.tech_stack && (
                  <p style={{ fontSize: '10px', color: '#666', margin: '3px 0' }}>
                    <strong>Tech Stack:</strong> {proj.tech_stack}
                  </p>
                )}
                {proj.proj_desc && (
                  <p style={{ fontSize: '11px', margin: '3px 0', lineHeight: '1.4', color: '#333' }}>
                    {proj.proj_desc}
                  </p>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* Certifications */}
      {resumeForm.certifications.some(cert => cert.cert_name) && (
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            CERTIFICATIONS
          </h2>
          {resumeForm.certifications.map((cert, index) => (
            cert.cert_name && (
              <div key={index} style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                  🏆 {cert.cert_name}
                </h3>
                {cert.issuer && (
                  <p style={{ fontSize: '10px', color: '#666', margin: '2px 0' }}>
                    Issued by {cert.issuer}
                  </p>
                )}
              </div>
            )
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '30px', paddingTop: '15px', borderTop: '1px solid #e5e5e5', textAlign: 'center' }}>
        <p style={{ fontSize: '8px', color: '#999', margin: '0' }}>
          Resume created with Resume Builder • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default PDFResumePreview;
