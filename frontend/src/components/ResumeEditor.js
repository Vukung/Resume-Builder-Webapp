import { ChevronRight, HelpCircle, Maximize2, Save } from 'lucide-react';
import React, { useRef, useState } from 'react';
import FullscreenPreview from './FullscreenPreview';
import PDFResumePreview from './PDFResumePreview';

// --- BulletedTextarea Component ---
const BulletedTextarea = ({ value, onChange, ...props }) => {
  const handleChange = (e) => {
    const { value: newValue, selectionStart } = e.target;
    if (value === '' && newValue.length > 0) {
      const updatedValue = '• ' + newValue;
      onChange({ target: { value: updatedValue } });
      setTimeout(() => {
        const newCursorPosition = selectionStart + 2;
        if(e.target) {
           e.target.selectionStart = newCursorPosition;
           e.target.selectionEnd = newCursorPosition;
        }
      }, 0);
    } else {
      onChange(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart } = e.target;
      const newValue = value.substring(0, selectionStart) + '\n• ' + value.substring(selectionStart);
      onChange({ target: { value: newValue } });
      setTimeout(() => {
        const newCursorPosition = selectionStart + 3;
        if(e.target) {
          e.target.selectionStart = newCursorPosition;
          e.target.selectionEnd = newCursorPosition;
        }
      }, 0);
    }
  };

  return <textarea value={value} onKeyDown={handleKeyDown} onChange={handleChange} {...props} />;
};

// --- Date Helper Components and Functions ---
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const parseDateFromInput = (inputValue) => {
  if (!inputValue) return '';
  const parts = inputValue.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
  }
  return '';
};

const getDefaultStartDate = () => '2020-01-01';

const DateInput = ({ value, onChange, placeholder, className }) => {
  const [inputValue, setInputValue] = useState(formatDateForInput(value));
  const handleInputChange = (e) => {
    let input = e.target.value.replace(/[^\d/]/g, '');
    if (input.length >= 2 && !input.includes('/')) input = input.slice(0, 2) + '/' + input.slice(2);
    if (input.length >= 5 && input.split('/').length === 2) input = input.split('/')[0] + '/' + input.split('/')[1] + '/' + input.slice(5);
    if (input.length <= 10) {
      setInputValue(input);
      if (input.length === 10) {
        const dbDate = parseDateFromInput(input);
        if (dbDate) onChange(dbDate);
      }
    }
  };
  const handleBlur = () => setInputValue(formatDateForInput(value));
  React.useEffect(() => setInputValue(formatDateForInput(value)), [value]);
  return <input type="text" value={inputValue} onChange={handleInputChange} onBlur={handleBlur} placeholder={placeholder || "DD/MM/YYYY"} className={className} maxLength={10} />;
};

const GradeTooltip = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div className="relative inline-block">
      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help ml-2" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
          <div className="text-sm text-white space-y-3">
            <div className="font-semibold text-blue-400">Grade Conversion Formulas:</div>
            <div className="space-y-2">
              <div><span className="text-green-400">CGPA (out of 10) = (GPA / 4) × 10</span></div>
              <div><span className="text-green-400">GPA (out of 4) = (CGPA / 10) × 4</span></div>
            </div>
            <div className="border-t border-gray-600 pt-3">
              <div className="font-semibold text-yellow-400 mb-2">Important Notes:</div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• This is a linear conversion for general purposes.</li>
                <li>• Universities may have their own specific conversion tables.</li>
                <li>• You can check if your institution provides an official scale.</li>
              </ul>
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

// --- Main ResumeEditor Component ---
const ResumeEditor = ({ selectedResume, resumeForm, onUpdateForm, onSave, onBack, currentUser }) => {
  const resumeRef = useRef();
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const addField = (section) => {
    const newField = section === 'education' ? { institution_name: '', degree: '', start_date_edu: getDefaultStartDate(), end_date_edu: '', grade_type: 'percentage', grade_value: '' }
      : section === 'experience' ? { job_title: '', company_name: '', start_date_ex: '', end_date_ex: '', ex_desc: '• ' }
      : section === 'projects' ? { project_name: '', tech_stack: '', proj_desc: '', proj_link: '' }
      : { cert_name: '', issuer: '' };
    onUpdateForm(prev => ({ ...prev, [section]: [...prev[section], newField] }));
  };

  const removeField = (section, index) => onUpdateForm(prev => ({ ...prev, [section]: prev[section].filter((_, i) => i !== index) }));
  const updateField = (section, index, field, value) => onUpdateForm(prev => ({ ...prev, [section]: prev[section].map((item, i) => i === index ? { ...item, [field]: value } : item) }));
  const handleFullscreen = () => setIsFullscreenOpen(true);
  const handleCloseFullscreen = () => setIsFullscreenOpen(false);

  const validateGrade = (gradeType, value) => {
    if (!value || value === '') return true;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    if (gradeType === 'percentage') return numValue >= 0 && numValue <= 100;
    if (gradeType === 'cgpa') return numValue >= 0 && numValue <= 10;
    return false;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><ChevronRight className="w-5 h-5 rotate-180" /></button>
              <h1 className="text-xl font-bold text-white">{selectedResume?.title || 'Resume Editor'}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onSave} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"><Save className="w-4 h-4" /><span>Save</span></button>
              <button onClick={handleFullscreen} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"><Maximize2 className="w-4 h-4" /><span>Fullscreen Preview</span></button>
            </div>
          </div>
        </header>

        <div className="flex">
          <div className="w-1/2 p-6 overflow-y-auto max-h-screen custom-scroll">
            <div className="space-y-8">
              {/* About Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4">About / Professional Summary</h3>
                <textarea value={resumeForm.about_text} onChange={(e) => onUpdateForm(prev => ({ ...prev, about_text: e.target.value }))} placeholder="Write a brief description about yourself..." className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              {/* Education Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-white">Education</h3><button onClick={() => addField('education')} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">Add</button></div>
                {resumeForm.education.map((edu, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Institution" value={edu.institution_name} onChange={(e) => updateField('education', index, 'institution_name', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" placeholder="Degree" value={edu.degree} onChange={(e) => updateField('education', index, 'degree', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div><label className="block text-sm font-medium text-gray-300 mb-2">End Date</label><DateInput value={edu.end_date_edu} onChange={(value) => updateField('education', index, 'end_date_edu', value)} placeholder="DD/MM/YYYY" className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="flex items-center text-sm font-medium text-gray-300 mb-2">Grade Type <GradeTooltip /></label><select value={edu.grade_type || 'percentage'} onChange={(e) => updateField('education', index, 'grade_type', e.target.value)} className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="percentage">Percentage</option><option value="cgpa">CGPA</option></select></div>
                      <div><label className="block text-sm font-medium text-gray-300 mb-2">Grade (Optional)</label><input type="number" step="0.01" min="0" max={edu.grade_type === 'cgpa' ? '10' : '100'} value={edu.grade_value || ''} onChange={(e) => updateField('education', index, 'grade_value', e.target.value)} placeholder={edu.grade_type === 'cgpa' ? '0.00 - 10.00' : '0 - 100'} className={`w-full px-3 py-2 bg-gray-600 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${edu.grade_value && edu.grade_value !== '' && !validateGrade(edu.grade_type || 'percentage', edu.grade_value) ? 'border-red-500' : 'border-gray-500'}`} />{edu.grade_value && edu.grade_value !== '' && !validateGrade(edu.grade_type || 'percentage', edu.grade_value) && <p className="text-red-400 text-xs mt-1">{(edu.grade_type || 'percentage') === 'cgpa' ? 'CGPA must be between 0.00 and 10.00' : 'Percentage must be between 0 and 100'}</p>}</div>
                    </div>
                    {/* {edu.grade_value && validateGrade(edu.grade_type || 'percentage', edu.grade_value) && (<div className="mb-4 p-2 bg-gray-600 rounded-lg"><p className="text-sm text-gray-300">{edu.grade_type === 'cgpa' ? `CGPA ${edu.grade_value}/10` : `${edu.grade_value}%`}</p></div>)} */}
                    {resumeForm.education.length > 1 && <button onClick={() => removeField('education', index)} className="mt-2 text-red-400 hover:text-red-300 text-sm">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Experience Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-white">Experience</h3><button onClick={() => addField('experience')} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">Add</button></div>
                {resumeForm.experience.map((exp, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Job Title" value={exp.job_title} onChange={(e) => updateField('experience', index, 'job_title', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" placeholder="Company" value={exp.company_name} onChange={(e) => updateField('experience', index, 'company_name', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label><DateInput value={exp.start_date_ex} onChange={(value) => updateField('experience', index, 'start_date_ex', value)} placeholder="DD/MM/YYYY" className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-300 mb-2">End Date</label><DateInput value={exp.end_date_ex} onChange={(value) => updateField('experience', index, 'end_date_ex', value)} placeholder="DD/MM/YYYY" className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div>
                    <div className="mt-4"><label className="block text-sm font-medium text-gray-300 mb-2">Description / Key Responsibilities</label><BulletedTextarea placeholder="• Achieved X by doing Y..." value={exp.ex_desc || ''} onChange={(e) => updateField('experience', index, 'ex_desc', e.target.value)} className="w-full h-24 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                    {resumeForm.experience.length > 1 && <button onClick={() => removeField('experience', index)} className="mt-2 text-red-400 hover:text-red-300 text-sm">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Projects Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-white">Projects</h3><button onClick={() => addField('projects')} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">Add</button></div>
                {resumeForm.projects.map((proj, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Project Name" value={proj.project_name} onChange={(e) => updateField('projects', index, 'project_name', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" placeholder="Tech Stack" value={proj.tech_stack} onChange={(e) => updateField('projects', index, 'tech_stack', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="mb-4"><textarea placeholder="Project Description" value={proj.proj_desc} onChange={(e) => updateField('projects', index, 'proj_desc', e.target.value)} className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20" /></div>
                    <input type="url" placeholder="Project Link" value={proj.proj_link} onChange={(e) => updateField('projects', index, 'proj_link', e.target.value)} className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {resumeForm.projects.length > 1 && <button onClick={() => removeField('projects', index)} className="mt-2 text-red-400 hover:text-red-300 text-sm">Remove</button>}
                  </div>
                ))}
              </div>

              {/* Certifications Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-white">Certifications</h3><button onClick={() => addField('certifications')} className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">Add</button></div>
                {resumeForm.certifications.map((cert, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Certification Name" value={cert.cert_name} onChange={(e) => updateField('certifications', index, 'cert_name', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" placeholder="Issuer" value={cert.issuer} onChange={(e) => updateField('certifications', index, 'issuer', e.target.value)} className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    {resumeForm.certifications.length > 1 && <button onClick={() => removeField('certifications', index)} className="mt-2 text-red-400 hover:text-red-300 text-sm">Remove</button>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-1/2 bg-gray-800 border-l border-gray-700 p-6">
            <div className="bg-white rounded-lg shadow-lg p-4 max-h-screen overflow-y-auto"><div ref={resumeRef}><PDFResumePreview resumeForm={resumeForm} currentUser={currentUser} /></div></div>
          </div>
        </div>
      </div>
      {isFullscreenOpen && <FullscreenPreview resumeForm={resumeForm} currentUser={currentUser} onClose={handleCloseFullscreen} />}
    </>
  );
};

export default ResumeEditor;
