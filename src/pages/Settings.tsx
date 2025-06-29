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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
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

  // Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await authAPI.updateProfile({ name: formData.name, email: formData.email });
      await refreshUser();
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Canvas API token update
  const handleUpdateToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile({
        name: user?.name || '',
        email: user?.email || '',
        canvasApiToken: formData.canvasApiToken
      });
      await refreshUser();
      toast.success('Canvas API Token updated!');
      setIsEditingToken(false);
      setShowToken(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update Canvas API Token');
    } finally {
      setLoading(false);
    }
  };

  // Canvas API token clear
  const handleClearToken = async () => {
    if (!window.confirm('Are you sure you want to clear your Canvas API token?')) return;
    setLoading(true);
    try {
      await authAPI.updateProfile({
        name: user?.name || '',
        email: user?.email || '',
        canvasApiToken: ''
      });
      await refreshUser();
      setFormData(prev => ({ ...prev, canvasApiToken: '' }));
      setIsEditingToken(false);
      setShowToken(false);
      toast.success('Canvas API Token cleared!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to clear Canvas API Token');
    } finally {
      setLoading(false);
    }
  };

  // Password change
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
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Canvas token instructions
  const CanvasTokenInstructions = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
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
              <p className="text-xs text-green-600">✅ Token is set and ready to use</p>
            ) : (
              <p className="text-xs text-orange-600">⚠️ No token set - courses won't load until you add one</p>
            )}
          </div>
          <p className="mt-2 text-xs">
            <strong>Note:</strong> Keep your token secure and don't share it with others.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Profile + Canvas Token */}
        <div className="md:col-span-1 flex flex-col gap-8">
          {/* Profile Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>
              {!isEditingProfile && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                  <Edit className="w-4 h-4 mr-2" />Edit
                </Button>
              )}
            </div>
            {!isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{user?.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <p className="text-gray-900">{user?.email || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <Input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter your full name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" required />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" loading={loading} disabled={loading}><Save className="w-4 h-4 mr-2" />Save</Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditingProfile(false); if (user) setFormData(prev => ({ ...prev, name: user.name || '', email: user.email || '' })); }} disabled={loading}>Cancel</Button>
                </div>
              </form>
            )}
          </Card>
          {/* Canvas API Token */}
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Key className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Canvas API Token</h2>
            </div>
            {/* Status Indicator */}
            <div className="mb-2">
              {user?.canvasApiToken ? (
                <div className="flex items-center text-sm text-green-600"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Token is set</div>
              ) : (
                <div className="flex items-center text-sm text-gray-500"><div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>No token set</div>
              )}
            </div>
            {/* Token Input/Display */}
            {!user?.canvasApiToken || isEditingToken ? (
              <form onSubmit={handleUpdateToken} className="space-y-3">
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
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={loading} disabled={loading}><Save className="w-4 h-4 mr-2" />Save</Button>
                  {user?.canvasApiToken && (
                    <Button type="button" variant="outline" size="sm" onClick={() => { setIsEditingToken(false); setShowToken(false); setFormData(prev => ({ ...prev, canvasApiToken: user.canvasApiToken || '' })); }} disabled={loading}>Cancel</Button>
                  )}
                </div>
              </form>
            ) : !showToken ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-500">••••••••••••••••••••••••••••••••</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowToken(true)}><Eye className="w-4 h-4 mr-2" />Reveal</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingToken(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
                  <Button variant="outline" size="sm" onClick={handleClearToken} disabled={loading} className="text-red-600 border-red-200 hover:text-red-800">Clear</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <span className="font-mono text-sm break-all">{user.canvasApiToken}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowToken(false)}><EyeOff className="w-4 h-4 mr-2" />Hide</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingToken(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
                  <Button variant="outline" size="sm" onClick={handleClearToken} disabled={loading} className="text-red-600 border-red-200 hover:text-red-800">Clear</Button>
                </div>
              </div>
            )}
            <CanvasTokenInstructions />
          </Card>
        </div>
        {/* Right column: Password Reset */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password *</label>
                <Input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} placeholder="Enter your current password" required />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password *</label>
                <Input name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} placeholder="Enter your new password" required />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password *</label>
                <Input name="confirmNewPassword" type="password" value={formData.confirmNewPassword} onChange={handleChange} placeholder="Confirm your new password" required />
              </div>
              <Button type="submit" loading={loading} disabled={loading}>Change Password</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings; 