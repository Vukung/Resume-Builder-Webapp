import { Camera, Check, ChevronRight, Upload, User, X } from 'lucide-react';
import { useState } from 'react';

const ProfilePage = ({ currentUser, onBack, onUpdateUser }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // ADD: State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone_num: currentUser?.phone_num || ''
  });
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // UPDATED: Add JWT token to refreshUserData function
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token'); // GET TOKEN
      const response = await fetch(`http://localhost:5000/api/profile/${currentUser.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}` // ADD AUTHENTICATION HEADER
        }
      });
      const userData = await response.json();
      
      if (userData && typeof onUpdateUser === 'function') {
        onUpdateUser(userData);
      } else {
        console.log('onUpdateUser not available, refreshing page...');
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // UPDATED: Add JWT token to uploadProfilePicture function
  const uploadProfilePicture = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePic', selectedFile);
    
    // Get token for authentication
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${currentUser.user_id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // ADD AUTHENTICATION HEADER
        },
        body: formData // Don't add Content-Type for FormData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        
        await refreshUserData();
        alert('Profile picture updated successfully!');
        
      } else {
        alert('Failed to upload: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ADD: Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ADD: Save profile changes with JWT authentication
  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/profile/${currentUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ADD AUTHENTICATION HEADER
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update user data and exit editing mode
        if (onUpdateUser) {
          onUpdateUser(result.user);
        }
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h1 className="text-xl font-bold text-white">Profile Settings</h1>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  {currentUser?.profile_pic ? (
                    <img 
                      src={`http://localhost:5000${currentUser.profile_pic}`} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-600" 
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentUser?.name}</h2>
                  <p className="text-gray-400">{currentUser?.email}</p>
                </div>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </button>
              </div>

              {/* UPDATED: Make form fields editable */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={isEditing ? formData.name : currentUser?.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={isEditing ? formData.email : currentUser?.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_num"
                    value={isEditing ? formData.phone_num : currentUser?.phone_num || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* UPDATED: Add edit/save functionality */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: currentUser?.name || '',
                          email: currentUser?.email || '',
                          phone_num: currentUser?.phone_num || ''
                        });
                      }}
                      className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal - stays the same */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Upload Profile Picture</h3>
              </div>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Current/Preview Image */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : currentUser?.profile_pic ? (
                    <img 
                      src={`http://localhost:5000${currentUser.profile_pic}`} 
                      alt="Current" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>

              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-upload-modal"
              />

              {!selectedFile ? (
                // Initial state - show file picker
                <div className="space-y-4">
                  <label
                    htmlFor="profile-upload-modal"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Choose Image</span>
                  </label>
                  
                  <p className="text-sm text-gray-400 text-center">
                    Supported formats: JPG, PNG, GIF<br/>
                    Max size: 5MB
                  </p>
                </div>
              ) : (
                // File selected - show upload controls
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-xs">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={uploadProfilePicture}
                      disabled={uploading}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Upload</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <label
                    htmlFor="profile-upload-modal"
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors flex items-center justify-center space-x-2 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Different Image</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
