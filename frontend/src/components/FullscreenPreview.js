import React from 'react';
import { X, Download, Printer } from 'lucide-react';

const FullscreenPreview = ({ resumeForm, currentUser, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    if (!start && !end) return '';
    if (!start) return end;
    return `${start} - ${end}`;
  };

  const uniqueSkills = resumeForm.projects
    .filter(proj => proj.tech_stack)
    .flatMap(proj => proj.tech_stack.split(',').map(tech => tech.trim()))
    .filter(skill => skill.length > 0);
  
  const skillsSet = [...new Set(uniqueSkills)];

  const handlePrint = () => {
    // Hide the toolbar before printing
    const toolbar = document.querySelector('[data-toolbar]');
    if (toolbar) {
      toolbar.style.display = 'none';
    }
    
    // Trigger print
    window.print();
    
    // Show toolbar after print dialog closes
    setTimeout(() => {
      if (toolbar) {
        toolbar.style.display = 'flex';
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Toolbar - Hidden during print */}
      <div 
        data-toolbar
        className="fixed top-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between shadow-lg z-10 print:hidden"
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Resume Preview</h1>
          <span className="text-sm text-gray-300">A4 Format</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* A4 Resume Content */}
      <div className="pt-20 pb-8 px-4 bg-gray-100 min-h-screen print:pt-0 print:px-0 print:bg-white">
        <div 
          className="mx-auto bg-white shadow-2xl print:shadow-none"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            lineHeight: '1.4',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e5e5', paddingBottom: '20px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#1a1a1a' }}>
              {currentUser?.name || 'Your Name'}
            </h1>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', fontSize: '11px', color: '#666' }}>
              {currentUser?.email && (
                <span>📧 {currentUser.email}</span>
              )}
              {currentUser?.phone_num && (
                <span>📞 {currentUser.phone_num}</span>
              )}
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

          {/* Experience */}
          {resumeForm.experience.some(exp => exp.job_title || exp.company_name) && (
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
                PROFESSIONAL EXPERIENCE
              </h2>
              {resumeForm.experience.map((exp, index) => (
                (exp.job_title || exp.company_name) && (
                  <div key={index} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                          {exp.job_title}
                        </h3>
                        <p style={{ fontSize: '12px', color: '#0066cc', margin: '2px 0', fontWeight: '600' }}>
                          {exp.company_name}
                        </p>
                      </div>
                      {(exp.start_date_ex || exp.end_date_ex) && (
                        <span style={{ fontSize: '10px', color: '#666', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {formatDateRange(exp.start_date_ex, exp.end_date_ex)}
                        </span>
                      )}
                    </div>
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
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0', color: '#1a1a1a' }}>
                          {edu.degree}
                        </h3>
                        <p style={{ fontSize: '11px', color: '#0066cc', margin: '2px 0', fontWeight: '600' }}>
                          {edu.institution_name}
                        </p>
                      </div>
                      {(edu.start_date_edu || edu.end_date_edu) && (
                        <span style={{ fontSize: '10px', color: '#666', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                          {formatDateRange(edu.start_date_edu, edu.end_date_edu)}
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
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:pt-0 {
            padding-top: 0 !important;
          }
          
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          
          .print\\:bg-white {
            background: white !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          @page {
            margin: 0;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default FullscreenPreview;