import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import ResumeEditor from './components/ResumeEditor';
import ProfilePage from './components/ProfilePage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Main App Content Component
function AppContent() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [resumeForm, setResumeForm] = useState({
    title: '',
    about_text: '',
    education: [{ institution_name: '', degree: '', start_date_edu: '', end_date_edu: '' }],
    experience: [{ job_title: '', company_name: '', start_date_ex: '', end_date_ex: '' }],
    projects: [{ project_name: '', tech_stack: '', proj_desc: '', proj_link: '' }],
    certifications: [{ cert_name: '', issuer: '' }]
  });

  // Backend running on port 5000
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Helper function to format date for HTML input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const apiCall = async (endpoint, options = {}) => {
    try {
      console.log('Making API call to:', `${API_BASE}${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { error: error.message };
    }
  };

  const handleLogin = async (loginForm) => {
    setIsLoading(true);
    console.log('Attempting login with:', loginForm);
    
    const result = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginForm)
    });
    
    console.log('Login result:', result);
    
    if (result.user) {
      setCurrentUser(result.user);
      loadResumes(result.user.user_id);
      alert('Login successful!');
      navigate('/dashboard');
    } else {
      alert('Login failed: ' + (result.message || result.error || 'Invalid credentials'));
    }
    setIsLoading(false);
  };

  const handleSignup = async (signupForm) => {
    setIsLoading(true);
    console.log('Attempting signup with:', signupForm);
    
    const result = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupForm)
    });
    
    console.log('Signup result:', result);
    
    if (result.userId) {
      alert('Account created successfully! Please login.');
      navigate('/login');
    } else {
      alert('Signup failed: ' + (result.message || result.error || 'Unknown error'));
    }
    setIsLoading(false);
  };

  const loadResumes = async (userId) => {
    console.log('Loading resumes for user:', userId);
    const result = await apiCall(`/resume/${userId}`);
    console.log('Resumes loaded:', result);
    
    if (Array.isArray(result)) {
      setResumes(result);
    } else if (result.error) {
      console.error('Failed to load resumes:', result.error);
      setResumes([]);
    }
  };

  const loadResumeData = async (resumeId) => {
    console.log('Loading resume data for:', resumeId);
    
    const result = await apiCall(`/resume/data/${resumeId}`);
    console.log('Resume data loaded:', result);
    
    if (result.error) {
      console.error('Failed to load resume data:', result.error);
      return null;
    }
    
    return result;
  };

  const createNewResume = async () => {
    const title = prompt('Enter resume title:');
    if (!title) return;
    
    console.log('Creating new resume with title:', title);
    
    const result = await apiCall('/resume/create', {
      method: 'POST',
      body: JSON.stringify({ user_id: currentUser.user_id, title })
    });
    
    console.log('Create resume result:', result);
    
    if (result.resumeId) {
      alert('Resume created successfully!');
      loadResumes(currentUser.user_id);
    } else {
      alert('Failed to create resume: ' + (result.message || result.error || 'Unknown error'));
    }
  };

  const duplicateResume = async (resumeId) => {
    console.log('Duplicating resume:', resumeId);
    
    const result = await apiCall(`/resume/duplicate/${resumeId}`, { 
      method: 'POST' 
    });
    
    console.log('Duplicate result:', result);
    
    if (result.newId) {
      alert('Resume duplicated successfully!');
      loadResumes(currentUser.user_id);
    } else {
      alert('Failed to duplicate resume: ' + (result.message || result.error || 'Unknown error'));
    }
  };

  const deleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }
    
    console.log('Deleting resume:', resumeId);
    
    const result = await apiCall(`/resume/delete/${resumeId}`, { 
      method: 'POST' 
    });
    
    console.log('Delete result:', result);
    
    if (result.message) {
      alert('Resume deleted successfully!');
      loadResumes(currentUser.user_id);
    } else {
      alert('Failed to delete resume: ' + (result.error || 'Unknown error'));
    }
  };

  const handleEditResume = async (resume) => {
    console.log('Editing resume:', resume);
    setSelectedResume(resume);
    
    // Load existing resume data
    const resumeData = await loadResumeData(resume.resume_id);
    
    if (resumeData) {
      // Populate form with existing data
      setResumeForm({
        title: resumeData.title || '',
        about_text: resumeData.about?.about_text || '',
        education: resumeData.education.length > 0 ? resumeData.education.map(edu => ({
          institution_name: edu.institution_name || '',
          degree: edu.degree || '',
          start_date_edu: formatDateForInput(edu.start_date_edu),
          end_date_edu: formatDateForInput(edu.end_date_edu)
        })) : [{ institution_name: '', degree: '', start_date_edu: '', end_date_edu: '' }],
        experience: resumeData.experience.length > 0 ? resumeData.experience.map(exp => ({
          job_title: exp.job_title || '',
          company_name: exp.company_name || '',
          start_date_ex: formatDateForInput(exp.start_date_ex),
          end_date_ex: formatDateForInput(exp.end_date_ex)
        })) : [{ job_title: '', company_name: '', start_date_ex: '', end_date_ex: '' }],
        projects: resumeData.projects.length > 0 ? resumeData.projects.map(proj => ({
          project_name: proj.project_name || '',
          tech_stack: proj.tech_stack || '',
          proj_desc: proj.proj_desc || '',
          proj_link: proj.proj_link || ''
        })) : [{ project_name: '', tech_stack: '', proj_desc: '', proj_link: '' }],
        certifications: resumeData.certifications.length > 0 ? resumeData.certifications.map(cert => ({
          cert_name: cert.cert_name || '',
          issuer: cert.issuer || ''
        })) : [{ cert_name: '', issuer: '' }]
      });
    } else {
      // If no data found, use empty form
      setResumeForm({
        title: resume.title || '',
        about_text: '',
        education: [{ institution_name: '', degree: '', start_date_edu: '', end_date_edu: '' }],
        experience: [{ job_title: '', company_name: '', start_date_ex: '', end_date_ex: '' }],
        projects: [{ project_name: '', tech_stack: '', proj_desc: '', proj_link: '' }],
        certifications: [{ cert_name: '', issuer: '' }]
      });
    }
    
    // Navigate to editor with resume ID in URL
    navigate(`/resume/${resume.resume_id}/edit`);
  };

  const saveResumeData = async () => {
    if (!selectedResume) {
      alert('No resume selected');
      return;
    }

    console.log('Saving resume data:', resumeForm);
    
    try {
      // Clear existing data first (to avoid duplicates)
      await apiCall('/form/clear-education', {
        method: 'POST',
        body: JSON.stringify({ resume_id: selectedResume.resume_id })
      });
      
      await apiCall('/form/clear-experience', {
        method: 'POST',
        body: JSON.stringify({ resume_id: selectedResume.resume_id })
      });
      
      await apiCall('/form/clear-projects', {
        method: 'POST',
        body: JSON.stringify({ resume_id: selectedResume.resume_id })
      });
      
      await apiCall('/form/clear-certifications', {
        method: 'POST',
        body: JSON.stringify({ resume_id: selectedResume.resume_id })
      });

      // Save about info
      if (resumeForm.about_text && resumeForm.about_text.trim() !== '') {
        const aboutResult = await apiCall('/form/about', {
          method: 'POST',
          body: JSON.stringify({ 
            resume_id: selectedResume.resume_id, 
            about_text: resumeForm.about_text 
          })
        });
        console.log('About saved:', aboutResult);
      }

      // Save education entries (only if they have data)
      for (const edu of resumeForm.education) {
        if ((edu.institution_name && edu.institution_name.trim() !== '') || 
            (edu.degree && edu.degree.trim() !== '')) {
          const eduResult = await apiCall('/form/education', {
            method: 'POST',
            body: JSON.stringify({ 
              resume_id: selectedResume.resume_id,
              ...edu
            })
          });
          console.log('Education saved:', eduResult);
        }
      }

      // Save experience entries (only if they have data)
      for (const exp of resumeForm.experience) {
        if ((exp.job_title && exp.job_title.trim() !== '') || 
            (exp.company_name && exp.company_name.trim() !== '')) {
          const expResult = await apiCall('/form/experience', {
            method: 'POST',
            body: JSON.stringify({ 
              resume_id: selectedResume.resume_id,
              ...exp
            })
          });
          console.log('Experience saved:', expResult);
        }
      }

      // Save project entries (only if they have project name)
      for (const proj of resumeForm.projects) {
        if (proj.project_name && proj.project_name.trim() !== '') {
          const projResult = await apiCall('/form/projects', {
            method: 'POST',
            body: JSON.stringify({ 
              resume_id: selectedResume.resume_id,
              ...proj
            })
          });
          console.log('Project saved:', projResult);
        }
      }

      // Save certification entries (only if they have cert name)
      for (const cert of resumeForm.certifications) {
        if (cert.cert_name && cert.cert_name.trim() !== '') {
          const certResult = await apiCall('/form/certifications', {
            method: 'POST',
            body: JSON.stringify({ 
              resume_id: selectedResume.resume_id,
              ...cert
            })
          });
          console.log('Certification saved:', certResult);
        }
      }

      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  };

  const handleLogout = async () => {
    console.log('Logging out user');
    
    // Call logout API
    await apiCall('/auth/logout', { method: 'POST' });
    
    // Reset all state
    setCurrentUser(null);
    setResumes([]);
    setSelectedResume(null);
    setSearchQuery('');
    setResumeForm({
      title: '',
      about_text: '',
      education: [{ institution_name: '', degree: '', start_date_edu: '', end_date_edu: '' }],
      experience: [{ job_title: '', company_name: '', start_date_ex: '', end_date_ex: '' }],
      projects: [{ project_name: '', tech_stack: '', proj_desc: '', proj_link: '' }],
      certifications: [{ cert_name: '', issuer: '' }]
    });
    
    alert('Logged out successfully!');
    navigate('/login');
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              onSwitchToSignup={() => navigate('/signup')}
              isLoading={isLoading}
            />
          )
        } 
      />
      
      <Route 
        path="/signup" 
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage
              onSignup={handleSignup}
              onSwitchToLogin={() => navigate('/login')}
              isLoading={isLoading}
            />
          )
        } 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute isAuthenticated={!!currentUser}>
            <Dashboard
              currentUser={currentUser}
              resumes={resumes}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateResume={createNewResume}
              onEditResume={handleEditResume}
              onDuplicateResume={duplicateResume}
              onDeleteResume={deleteResume}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              onLogout={handleLogout}
              onProfile={() => navigate('/profile')}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/resume/:id/edit" 
        element={
          <ProtectedRoute isAuthenticated={!!currentUser}>
            <ResumeEditor
              selectedResume={selectedResume}
              resumeForm={resumeForm}
              onUpdateForm={setResumeForm}
              onSave={saveResumeData}
              onBack={() => navigate('/dashboard')}
              currentUser={currentUser}
            />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute isAuthenticated={!!currentUser}>
            <ProfilePage
              currentUser={currentUser}
              onBack={() => navigate('/dashboard')}
            />
          </ProtectedRoute>
        } 
      />

      {/* Default Route */}
      <Route 
        path="/" 
        element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} 
      />

      {/* 404 Route */}
      <Route 
        path="*" 
        element={
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">404</h1>
              <p className="text-gray-400 mb-4">Page not found</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go Home
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

// Main App Component with Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;