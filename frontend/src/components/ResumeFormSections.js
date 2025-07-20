import React from 'react';

const AboutSection = ({ resumeForm, onUpdateForm }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <h3 className="text-xl font-semibold text-white mb-4">About</h3>
    <textarea
      value={resumeForm.about_text}
      onChange={(e) => onUpdateForm(prev => ({ ...prev, about_text: e.target.value }))}
      placeholder="Write a brief description about yourself..."
      className="w-full h-32 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  </div>
);

const EducationSection = ({ resumeForm, onUpdateForm, addField, removeField, updateField }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Education</h3>
      <button
        onClick={() => addField('education')}
        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Add
      </button>
    </div>
    {resumeForm.education.map((edu, index) => (
      <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Institution"
            value={edu.institution_name}
            onChange={(e) => updateField('education', index, 'institution_name', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => updateField('education', index, 'degree', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={edu.start_date_edu}
            onChange={(e) => updateField('education', index, 'start_date_edu', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={edu.end_date_edu}
            onChange={(e) => updateField('education', index, 'end_date_edu', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {resumeForm.education.length > 1 && (
          <button
            onClick={() => removeField('education', index)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    ))}
  </div>
);

const ExperienceSection = ({ resumeForm, onUpdateForm, addField, removeField, updateField }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Experience</h3>
      <button
        onClick={() => addField('experience')}
        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Add
      </button>
    </div>
    {resumeForm.experience.map((exp, index) => (
      <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Job Title"
            value={exp.job_title}
            onChange={(e) => updateField('experience', index, 'job_title', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Company"
            value={exp.company_name}
            onChange={(e) => updateField('experience', index, 'company_name', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={exp.start_date_ex}
            onChange={(e) => updateField('experience', index, 'start_date_ex', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={exp.end_date_ex}
            onChange={(e) => updateField('experience', index, 'end_date_ex', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {resumeForm.experience.length > 1 && (
          <button
            onClick={() => removeField('experience', index)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    ))}
  </div>
);

const ProjectsSection = ({ resumeForm, onUpdateForm, addField, removeField, updateField }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Projects</h3>
      <button
        onClick={() => addField('projects')}
        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Add
      </button>
    </div>
    {resumeForm.projects.map((proj, index) => (
      <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Project Name"
            value={proj.project_name}
            onChange={(e) => updateField('projects', index, 'project_name', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Tech Stack"
            value={proj.tech_stack}
            onChange={(e) => updateField('projects', index, 'tech_stack', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Project Description"
            value={proj.proj_desc}
            onChange={(e) => updateField('projects', index, 'proj_desc', e.target.value)}
            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
          />
        </div>
        <input
          type="url"
          placeholder="Project Link"
          value={proj.proj_link}
          onChange={(e) => updateField('projects', index, 'proj_link', e.target.value)}
          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {resumeForm.projects.length > 1 && (
          <button
            onClick={() => removeField('projects', index)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    ))}
  </div>
);

const CertificationsSection = ({ resumeForm, onUpdateForm, addField, removeField, updateField }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-white">Certifications</h3>
      <button
        onClick={() => addField('certifications')}
        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
      >
        Add
      </button>
    </div>
    {resumeForm.certifications.map((cert, index) => (
      <div key={index} className="mb-4 p-4 bg-gray-700 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Certification Name"
            value={cert.cert_name}
            onChange={(e) => updateField('certifications', index, 'cert_name', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Issuer"
            value={cert.issuer}
            onChange={(e) => updateField('certifications', index, 'issuer', e.target.value)}
            className="px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {resumeForm.certifications.length > 1 && (
          <button
            onClick={() => removeField('certifications', index)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    ))}
  </div>
);

export {
  AboutSection,
  EducationSection,
  ExperienceSection,
  ProjectsSection,
  CertificationsSection
};