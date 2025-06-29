import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { User, Lock, Key, Info, Save, Edit, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, canvasAPI } from '../services/api';

const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingToken, setIsEditingToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; message?: string } | null>(null);
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
        canvasApiToken: ''
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

  // Validate Canvas API token
  const handleValidateToken = async (token: string) => {
    setValidatingToken(true);
    try {
      const response = await authAPI.validateCanvasToken({ canvasApiToken: token });
      if (response.data.valid) {
        toast.success('Canvas API token is valid!');
        return true;
      } else {
        toast.error(response.data.message || 'Invalid Canvas API token');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to validate token');
      return false;
    } finally {
      setValidatingToken(false);
    }
  };

  // Test Canvas connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await canvasAPI.testConnection();
      setConnectionStatus(response.data);
      if (response.data.connected) {
        toast.success('Canvas connection successful!');
      } else {
        toast.error(response.data.message || 'Canvas connection failed');
      }
    } catch (error: any) {
      setConnectionStatus({ connected: false, message: 'Connection test failed' });
      toast.error(error.response?.data?.message || 'Failed to test connection');
    } finally {
      setTestingConnection(false);
    }
  };

  // Canvas API token update
  const handleUpdateToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.canvasApiToken) {
      toast.error('Please enter a Canvas API token');
      return;
    }
    
    setLoading(true);
    try {
      // First validate the token
      const isValid = await handleValidateToken(formData.canvasApiToken);
      if (!isValid) {
        setLoading(false);
        return;
      }
      
      // If valid, update profile with the token
      await authAPI.updateProfile({
        name: user?.name || '',
        email: user?.email || '',
        canvasApiToken: formData.canvasApiToken
      });
      await refreshUser();
      toast.success('Canvas API Token updated successfully!');
      setIsEditingToken(false);
      setFormData(prev => ({ ...prev, canvasApiToken: '' }));
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
      setConnectionStatus(null);
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
            {user?.hasCanvasToken ? (
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Profile (top) + Canvas Token (bottom) */}
        <div className="flex flex-col gap-8">
          {/* Profile Info - Top Left */}
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
          {/* Canvas API Token - Bottom Left */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Key className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Canvas API Token</h2>
              </div>
              {user?.hasCanvasToken && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  loading={testingConnection}
                  disabled={testingConnection}
                >
                  {connectionStatus?.connected ? (
                    <Wifi className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 mr-2 text-gray-500" />
                  )}
                  Test Connection
                </Button>
              )}
            </div>
            
            {/* Connection Status */}
            {connectionStatus && (
              <div className={`mb-4 p-3 rounded-lg border ${
                connectionStatus.connected 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {connectionStatus.connected ? (
                    <Wifi className="w-4 h-4 mr-2" />
                  ) : (
                    <WifiOff className="w-4 h-4 mr-2" />
                  )}
                  <span className="text-sm font-medium">
                    {connectionStatus.connected ? 'Connected to Canvas' : 'Connection Failed'}
                  </span>
                </div>
                {connectionStatus.message && (
                  <p className="text-xs mt-1">{connectionStatus.message}</p>
                )}
              </div>
            )}
            
            {/* Status Indicator */}
            <div className="mb-4">
              {user?.hasCanvasToken ? (
                <div className="flex items-center text-sm text-green-600"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Token is set</div>
              ) : (
                <div className="flex items-center text-sm text-gray-500"><div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>No token set</div>
              )}
            </div>
            
            {/* Token Input/Display */}
            {!user?.hasCanvasToken ? (
              // No token set - show input field
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
                  <Button type="submit" size="sm" loading={loading || validatingToken} disabled={loading || validatingToken} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {validatingToken ? 'Validating...' : 'Set Token'}
                  </Button>
                </div>
              </form>
            ) : isEditingToken ? (
              // Editing token - show input field
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
                  <Button type="submit" size="sm" loading={loading || validatingToken} disabled={loading || validatingToken}>
                    <Save className="w-4 h-4 mr-2" />
                    {validatingToken ? 'Validating...' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { setIsEditingToken(false); setFormData(prev => ({ ...prev, canvasApiToken: '' })); }} disabled={loading}>Cancel</Button>
                </div>
              </form>
            ) : (
              // Token is set - show management options
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-500">••••••••••••••••••••••••••••••••</span>
                  <span className="text-xs text-gray-400">Token stored securely</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditingToken(true)}>
                    <Edit className="w-4 h-4 mr-2" />Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearToken} disabled={loading} className="text-red-600 border-red-200 hover:text-red-800">
                    Clear
                  </Button>
                </div>
              </div>
            )}
            <CanvasTokenInstructions />
          </Card>
        </div>
        {/* Right column: Password Reset - spans entire right side */}
        <div className="lg:row-span-2">
          <Card className="p-6 h-full">
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