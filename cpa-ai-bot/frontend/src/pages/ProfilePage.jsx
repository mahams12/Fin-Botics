import React, { useState, useRef } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Building, Phone, MapPin, Camera, Save, X, Upload } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { apiMethods } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile, updateProfilePicture, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_picture || null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    businessName: user?.business_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setPhotoLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload photo
      const response = await apiMethods.upload('/users/upload-profile-picture', formData);
      
      // Update local state immediately
      setProfilePhoto(response.profile_picture);
      
      // Update user context with the new profile picture
      await updateProfile({ profile_picture: response.profile_picture });
      
      // Force update the profile picture in context
      if (typeof updateProfilePicture === 'function') {
        updateProfilePicture(response.profile_picture);
      }
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setPhotoLoading(true);
      
      // Remove photo from server
      await apiMethods.delete('/users/profile-picture');
      
      // Update local state
      setProfilePhoto(null);
      
      // Update user context with null profile picture
      await updateProfile({ profile_picture: null });
      
      // Force update the profile picture in context
      if (typeof updateProfilePicture === 'function') {
        updateProfilePicture(null);
      }
      
      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('Photo removal error:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        business_name: formData.businessName,
        phone: formData.phone,
        address: formData.address,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      businessName: user?.business_name || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const getProfileImage = () => {
    return profilePhoto || user?.profile_picture;
  };

  const getInitials = () => {
    return user?.first_name?.charAt(0) || 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Profile Picture Section */}
          <Card title="Profile Picture">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {getProfileImage() ? (
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials()}
                  </div>
                )}
                
                {/* Upload/Camera Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {photoLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"></div>
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Remove Photo Button */}
                {getProfileImage() && (
                  <button
                    onClick={handleRemovePhoto}
                    disabled={photoLoading}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {getProfileImage() ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  {getProfileImage() && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRemovePhoto}
                      disabled={photoLoading}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </Card>

          {/* Personal Information */}
          <Card 
            title="Personal Information"
            footer={
              isEditing ? (
                <div className="flex items-center justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    form="profile-form"
                    loading={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )
            }
          >
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  disabled={!isEditing}
                  required
                  icon={User}
                />

                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  disabled={!isEditing}
                  required
                  icon={User}
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                disabled={!isEditing}
                required
                icon={Mail}
              />

              <Input
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={Building}
                helpText="Optional: Your business or company name"
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={Phone}
                helpText="Optional: For account recovery and notifications"
              />

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                icon={MapPin}
                helpText="Optional: Business address for tax purposes"
              />
            </form>
          </Card>

          {/* Account Settings */}
          <Card title="Account Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive email updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-medium text-gray-900">Data Export</h4>
                  <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                </div>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card title="Danger Zone" className="border-red-200">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;