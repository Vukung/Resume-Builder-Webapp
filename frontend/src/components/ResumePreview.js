import React from 'react';
import { Mail, Phone, MapPin, Calendar, ExternalLink, Award, User, Briefcase, GraduationCap, Code, Star } from 'lucide-react';

const ModernResumePreview = ({ resumeForm, currentUser }) => {
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

  // Extract unique skills from projects
  const uniqueSkills = resumeForm.projects
    .filter(proj => proj.tech_stack)
    .flatMap(proj => proj.tech_stack.split(',').map(tech => tech.trim()))
    .filter(skill => skill.length > 0);
  
  const skillsSet = [...new Set(uniqueSkills)];

  return (
    <div className="bg-white text-black max-h-screen overflow-y-auto shadow-2xl">
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <div className="w-2/5 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-8">
          {/* Profile Section */}
          <div className="text-center mb-10">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
              <span className="text-3xl font-bold text-white">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'YN'}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              {currentUser?.name || 'Your Name'}
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              <h2 className="text-lg font-bold text-gray-200">CONTACT</h2>
            </div>
            <div className="space-y-4 text-sm pl-7">
              {currentUser?.email && (
                <div className="flex items-center gap-3 group">
                  <Mail className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span className="break-all text-gray-300">{currentUser.email}</span>
                </div>
              )}
              {currentUser?.phone_num && (
                <div className="flex items-center gap-3 group">
                  <Phone className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  <span className="text-gray-300">{currentUser.phone_num}</span>
                </div>
              )}
              <div className="flex items-center gap-3 group">
                <MapPin className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-gray-300">Your City, State</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          {skillsSet.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center mb-4">
                <Code className="w-5 h-5 mr-2 text-blue-400" />
                <h2 className="text-lg font-bold text-gray-200">TECHNICAL SKILLS</h2>
              </div>
              <div className="space-y-3 pl-7">
                {skillsSet.map((skill, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-all duration-200">
                      <span className="text-sm font-medium text-gray-200">{skill}</span>
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-blue-400 text-blue-400 ml-1" />
                        ))}
                        <Star className="w-3 h-3 text-gray-500 ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {resumeForm.certifications.some(cert => cert.cert_name) && (
            <div className="mb-10">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 mr-2 text-blue-400" />
                <h2 className="text-lg font-bold text-gray-200">CERTIFICATIONS</h2>
              </div>
              <div className="space-y-4 text-sm pl-7">
                {resumeForm.certifications.map((cert, index) => (
                  cert.cert_name && (
                    <div key={index} className="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition-colors">
                      <div className="flex items-start gap-3">
                        <Award className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                        <div>
                          <div className="font-semibold text-white mb-1">{cert.cert_name}</div>
                          {cert.issuer && (
                            <div className="text-gray-400 text-xs">Issued by {cert.issuer}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Footer Quote */}
          <div className="mt-auto pt-8 border-t border-slate-600">
            <p className="text-xs text-gray-400 italic text-center">
              "Excellence is not a skill, it's an attitude."
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-3/5 p-10 bg-gray-50">
          {/* Professional Summary */}
          {resumeForm.about_text && (
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">PROFESSIONAL SUMMARY</h2>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed text-justify">{resumeForm.about_text}</p>
              </div>
            </div>
          )}

          {/* Professional Experience */}
          {resumeForm.experience.some(exp => exp.job_title || exp.company_name) && (
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">PROFESSIONAL EXPERIENCE</h2>
              </div>
              <div className="space-y-6">
                {resumeForm.experience.map((exp, index) => (
                  (exp.job_title || exp.company_name) && (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-purple-500">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.job_title}</h3>
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                            <p className="text-lg text-purple-600 font-semibold">{exp.company_name}</p>
                          </div>
                        </div>
                        {(exp.start_date_ex || exp.end_date_ex) && (
                          <div className="bg-gray-100 px-4 py-2 rounded-full">
                            <div className="text-sm text-gray-600 flex items-center font-medium">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDateRange(exp.start_date_ex, exp.end_date_ex)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeForm.education.some(edu => edu.institution_name || edu.degree) && (
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">EDUCATION</h2>
              </div>
              <div className="space-y-4">
                {resumeForm.education.map((edu, index) => (
                  (edu.institution_name || edu.degree) && (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{edu.degree}</h3>
                          <div className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2 text-green-600" />
                            <p className="text-green-600 font-semibold">{edu.institution_name}</p>
                          </div>
                        </div>
                        {(edu.start_date_edu || edu.end_date_edu) && (
                          <div className="bg-gray-100 px-4 py-2 rounded-full">
                            <div className="text-sm text-gray-600 flex items-center font-medium">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDateRange(edu.start_date_edu, edu.end_date_edu)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Projects Portfolio */}
          {resumeForm.projects.some(proj => proj.project_name) && (
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-4"></div>
                <h2 className="text-2xl font-bold text-gray-900">PROJECT PORTFOLIO</h2>
              </div>
              <div className="grid gap-6">
                {resumeForm.projects.map((proj, index) => (
                  proj.project_name && (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-orange-500 group">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {proj.project_name}
                        </h3>
                        {proj.proj_link && (
                          <a 
                            href={proj.proj_link} 
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full flex items-center text-sm font-medium transition-all duration-200 hover:scale-105"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Project
                          </a>
                        )}
                      </div>
                      
                      {proj.tech_stack && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {proj.tech_stack.split(',').map((tech, techIndex) => (
                              <span 
                                key={techIndex}
                                className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {proj.proj_desc && (
                        <p className="text-gray-700 leading-relaxed">{proj.proj_desc}</p>
                      )}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Resume created with Resume Builder • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernResumePreview;