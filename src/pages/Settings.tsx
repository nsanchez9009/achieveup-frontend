import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { User, Lock, Key, Info, Save, Edit, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCanvasToken, setIsEditingCanvasToken] = useState(false);
  const [showCanvasToken, setShowCanvasToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    canvasApiToken: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        canvasApiToken: user.canvasApiToken || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };
      
      await authAPI.updateProfile(updateData);
      
      await refreshUser();
      
      toast.success('Profile updated successfully!');
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCanvasToken = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        name: user?.name || '',
        email: user?.email || ''
      };
      
      // Only include canvasApiToken if it's not empty
      if (formData.canvasApiToken) {
        updateData.canvasApiToken = formData.canvasApiToken;
      }
      
      await authAPI.updateProfile(updateData);
      
      await refreshUser();
      
      // Show specific success message based on what was updated
      if (formData.canvasApiToken) {
        toast.success('Canvas API Token updated successfully!');
      } else {
        toast.success('Canvas API Token cleared successfully!');
      }
      
      setIsEditingCanvasToken(false);
    } catch (error: any) {
      console.error('Canvas token update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update Canvas API Token');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password changed successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (error: any) {
      console.error('Password change failed:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getCanvasTokenInstructions = () => {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">How to get your Canvas API Token:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Log into your Canvas account</li>
              <li>Go to Account → Settings</li>
              <li>Scroll down to "Approved Integrations"</li>
              <li>Click "New Access Token"</li>
              <li>Give it a name (e.g., "AchieveUp")</li>
              <li>Copy the generated token and paste it above</li>
            </ol>
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs font-medium text-gray-700 mb-1">Current Status:</p>
              {user?.canvasApiToken ? (
                <p className="text-xs text-green-600">
                  ✅ Token is set and ready to use
                </p>
              ) : (
                <p className="text-xs text-orange-600">
                  ⚠️ No token set - courses won't load until you add one
                </p>
              )}
            </div>
            <p className="mt-2 text-xs">
              <strong>Note:</strong> Keep your token secure and don't share it with others.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <User className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {!isEditing ? (
            // Static view
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-gray-900">{user?.name || 'Not set'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{user?.email || 'Not set'}</p>
              </div>
            </div>
          ) : (
            // Edit form
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to current user data
                    if (user) {
                      setFormData(prev => ({
                        ...prev,
                        name: user.name || '',
                        email: user.email || '',
                        canvasApiToken: user.canvasApiToken || ''
                      }));
                    }
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Canvas API Token Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Key className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Canvas Integration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canvas API Token
              </label>
              
              {/* Token Status Indicator */}
              <div className="mb-2">
                {user?.canvasApiToken ? (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Canvas API Token is set
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                    No Canvas API Token set
                  </div>
                )}
              </div>
              
              {!user?.canvasApiToken ? (
                // No token set - show input field
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    name="canvasApiToken"
                    type="text"
                    value={formData.canvasApiToken}
                    onChange={handleChange}
                    placeholder="Paste your Canvas API token"
                    className="pl-10"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
              ) : !showCanvasToken ? (
                // Token is set but hidden - show reveal button
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500">••••••••••••••••••••••••••••••••</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCanvasToken(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Reveal
                  </Button>
                </div>
              ) : !isEditingCanvasToken ? (
                // Token is revealed but not editing - show token and edit button
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <span className="font-mono text-sm break-all">{user.canvasApiToken}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCanvasToken(false)}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Hide
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingCanvasToken(true);
                        setFormData(prev => ({ ...prev, canvasApiToken: user.canvasApiToken || '' }));
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Token
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, canvasApiToken: '' }));
                        setShowCanvasToken(false);
                        toast.success('Canvas API Token cleared');
                      }}
                      className="text-xs text-red-600 hover:text-red-800 transition-colors"
                    >
                      Clear Token
                    </button>
                  </div>
                </div>
              ) : (
                // Editing token - show input field with save/cancel
                <div className="space-y-3">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      name="canvasApiToken"
                      type="text"
                      value={formData.canvasApiToken}
                      onChange={handleChange}
                      placeholder="Paste your Canvas API token"
                      className="pl-10"
                      autoComplete="off"
                      data-lpignore="true"
                      data-form-type="other"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateCanvasToken}
                      loading={loading}
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Token
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingCanvasToken(false);
                        setShowCanvasToken(false);
                        // Reset form data to current user data
                        if (user) {
                          setFormData(prev => ({
                            ...prev,
                            canvasApiToken: user.canvasApiToken || ''
                          }));
                        }
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mt-1">
                <p className="text-xs text-gray-500">
                  This connects your account to Canvas for course data.
                </p>
              </div>
            </div>

            {!user?.canvasApiToken && (
              <Button
                onClick={handleUpdateCanvasToken}
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Set Canvas Token
              </Button>
            )}

            {getCanvasTokenInstructions()}
          </div>
        </Card>

        {/* Password Change */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Lock className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <Input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password *
              </label>
              <Input
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <Input
                name="confirmNewPassword"
                type="password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Change Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 