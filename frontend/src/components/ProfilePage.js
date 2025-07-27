import { Camera, Check, ChevronRight, Upload, User, X } from 'lucide-react';
import { useState } from 'react';

const ProfilePage = ({ currentUser, onBack, onUpdateUser, onShowNotification }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // State for profile editing
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
        if (typeof onShowNotification === 'function') {
          onShowNotification('Please select an image file', 'error');
        } else {
          alert('Please select an image file');
        }
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        if (typeof onShowNotification === 'function') {
          onShowNotification('File size must be less than 5MB', 'error');
        } else {
          alert('File size must be less than 5MB');
        }
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // UPDATED: Changed localhost to live backend URL
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://resume-rocket-backend.onrender.com/api/profile/${currentUser.user_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
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

  // UPDATED: Changed localhost to live backend URL
  const uploadProfilePicture = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePic', selectedFile);
    
    // Get token for authentication
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://resume-rocket-backend.onrender.com/api/profile/${currentUser.user_id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        
        await refreshUserData();
        
        // Use notification system if available, fallback to alert
        if (typeof onShowNotification === 'function') {
          onShowNotification('Image has been uploaded successfully! 📸', 'success');
        } else {
          alert('Profile picture updated successfully!');
        }
        
      } else {
        if (typeof onShowNotification === 'function') {
          onShowNotification('Failed to upload: ' + result.error, 'error');
        } else {
          alert('Failed to upload: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (typeof onShowNotification === 'function') {
        onShowNotification('Upload failed. Please try again.', 'error');
      } else {
        alert('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // UPDATED: Changed localhost to live backend URL
  const handleSaveProfile = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://resume-rocket-backend.onrender.com/api/profile/${currentUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        
        // Use notification system if available, fallback to alert
        if (typeof onShowNotification === 'function') {
          onShowNotification('Profile updated successfully! ✨', 'success');
        } else {
          alert('Profile updated successfully!');
        }
      } else {
        if (typeof onShowNotification === 'function') {
          onShowNotification('Failed to update profile: ' + result.error, 'error');
        } else {
          alert('Failed to update profile: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      if (typeof onShowNotification === 'function') {
        onShowNotification('Failed to save profile. Please try again.', 'error');
      } else {
        alert('Failed to save profile. Please try again.');
      }
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
                  {/* UPDATED: Removed profile picture display since feature was removed */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentUser?.name}</h2>
                  <p className="text-gray-400">{currentUser?.email}</p>
                </div>
                {/* Upload button removed since profile picture feature was removed */}
              </div>

              {/* Make form fields editable */}
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

              {/* Edit/save functionality */}
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

      {/* Upload Modal - Removed since profile picture feature was removed */}
    </>
  );
};

export default ProfilePage;
