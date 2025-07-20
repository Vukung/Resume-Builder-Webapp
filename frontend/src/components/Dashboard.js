import React from 'react';
import { FileText, Plus, Search, Eye, Copy, Trash2, ChevronRight, Moon, Sun, LogOut, Settings } from 'lucide-react';

const Header = ({ currentUser, darkMode, onToggleDarkMode, onLogout, onProfile }) => (
  <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Resume Builder</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={onProfile}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
);

const ResumeCard = ({ resume, onEdit, onDuplicate, onDelete }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 group">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-white" />
      </div>
      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(resume)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDuplicate(resume.resume_id)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(resume.resume_id)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    
    <h3 className="text-lg font-semibold text-white mb-2 truncate">{resume.title}</h3>
    <p className="text-gray-400 text-sm mb-4">Last updated: {new Date().toLocaleDateString()}</p>
    
    <button
      onClick={() => onEdit(resume)}
      className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
    >
      <span>Edit Resume</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

const Dashboard = ({ 
  currentUser, 
  resumes, 
  searchQuery, 
  onSearchChange, 
  onCreateResume, 
  onEditResume, 
  onDuplicateResume, 
  onDeleteResume, 
  darkMode, 
  onToggleDarkMode, 
  onLogout, 
  onProfile 
}) => {
  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        currentUser={currentUser}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onLogout={onLogout}
        onProfile={onProfile}
      />

      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {currentUser?.name}!</h2>
          <p className="text-gray-400">Manage your resumes and create new ones</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onCreateResume}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Resume</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResumes.map((resume) => (
            <ResumeCard
              key={resume.resume_id}
              resume={resume}
              onEdit={onEditResume}
              onDuplicate={onDuplicateResume}
              onDelete={onDeleteResume}
            />
          ))}
        </div>

        {filteredResumes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No resumes found</h3>
            <p className="text-gray-500 mb-6">Create your first resume to get started</p>
            <button
              onClick={onCreateResume}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Resume</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;