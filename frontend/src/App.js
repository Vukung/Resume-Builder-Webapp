import { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import ResumeEditor from './components/ResumeEditor';
import SignupPage from './components/SignupPage';
import CreateResumeModal from './components/CreateResumeModal';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' or 'error'
  });

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

  // ADD: Check for existing token on app startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        loadResumes(user.user_id);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Helper function to format date for HTML input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // UPDATED: apiCall with JWT token authentication
  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem('token'); // Get stored token
      
      console.log('Making API call to:', `${API_BASE}${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '', // ADD AUTHENTICATION HEADER
          ...options.headers 
        },
        ...options
      });

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.log('Authentication failed, logging out user');
        handleLogout(); // Force logout if token is invalid
        return { error: 'Authentication failed' };
      }

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

  // ADD: Update current user function for profile updates
  const updateCurrentUser = (updatedUserData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedUserData
    }));
    // Update localStorage as well
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...updatedUserData
    }));
  };

  // UPDATED: Enhanced login handler with JWT token storage
  const handleLogin = async (loginForm) => {
    setIsLoading(true);
    console.log('Attempting login with:', loginForm);

    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });

      console.log('Login result:', result);

      if (result.user && result.token) { // Check for both user and token
        // Store token and user in localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        setCurrentUser(result.user);
        loadResumes(result.user.user_id);

        // Show subtle success notification
        setNotification({
          show: true,
          message: `Welcome back, ${result.user.name || 'User'}!`,
          type: 'success'
        });

        // Navigate after brief delay for smooth UX
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } else {
        // Error: Show user-friendly error notification
        setNotification({
          show: true,
          message: 'Invalid email or password',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setNotification({
        show: true,
        message: 'Connection error. Please check your internet and try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // UPDATED: Enhanced signup handler with notifications
  const handleSignup = async (signupForm) => {
    setIsLoading(true);
    console.log('Attempting signup with:', signupForm);

    try {
      const result = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupForm)
      });

      console.log('Signup result:', result);

      if (result.userId) {
        setNotification({
          show: true,
          message: 'Account created successfully! Please login.',
          type: 'success'
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setNotification({
          show: true,
          message: result.message || result.error || 'Signup failed',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Connection error. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
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

  const createNewResume = async (title) => {
    console.log('Creating new resume with title:', title);

    const result = await apiCall('/resume/create', {
      method: 'POST',
      body: JSON.stringify({ user_id: currentUser.user_id, title })
    });

    console.log('Create resume result:', result);

    if (result.resumeId) {
      setNotification({
        show: true,
        message: 'Resume created successfully!',
        type: 'success'
      });
      loadResumes(currentUser.user_id);
      setShowCreateModal(false); // Close modal on success
    } else {
      setNotification({
        show: true,
        message: result.message || result.error || 'Failed to create resume',
        type: 'error'
      });
    }
  };

  const duplicateResume = async (resumeId) => {
    console.log('Duplicating resume:', resumeId);

    const result = await apiCall(`/resume/duplicate/${resumeId}`, {
      method: 'POST'
    });

    console.log('Duplicate result:', result);

    if (result.newId) {
      setNotification({
        show: true,
        message: 'Resume duplicated successfully!',
        type: 'success'
      });
      loadResumes(currentUser.user_id);
    } else {
      setNotification({
        show: true,
        message: result.message || result.error || 'Failed to duplicate resume',
        type: 'error'
      });
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
      setNotification({
        show: true,
        message: 'Resume deleted successfully!',
        type: 'success'
      });
      loadResumes(currentUser.user_id);
    } else {
      setNotification({
        show: true,
        message: result.error || 'Failed to delete resume',
        type: 'error'
      });
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
      setNotification({
        show: true,
        message: 'No resume selected',
        type: 'error'
      });
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

      setNotification({
        show: true,
        message: 'Resume saved successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      setNotification({
        show: true,
        message: 'Failed to save resume. Please try again.',
        type: 'error'
      });
    }
  };

  // UPDATED: Enhanced logout handler
  const handleLogout = async () => {
    console.log('Logging out user');

    // Call logout API
    await apiCall('/auth/logout', { method: 'POST' });

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

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

    setNotification({
      show: true,
      message: 'Logged out successfully!',
      type: 'success'
    });

    setTimeout(() => navigate('/login'), 1500);
  };

  return (
    <>
      {/* Success/Error Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-100 transform transition-all duration-500 ease-in-out ${
          notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center max-w-sm ${
            notification.type === 'success'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : null} {/* No icon for errors */}

            <div className="flex-1">
              <p className="font-medium text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="ml-3 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

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
                onCreateResume={() => setShowCreateModal(true)}
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
                onUpdateUser={updateCurrentUser}
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

      {/* Modal component */}
      <CreateResumeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createNewResume}
        isLoading={isLoading}
      />
    </>
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
