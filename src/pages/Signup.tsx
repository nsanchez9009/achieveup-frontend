import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Key, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SignupFormInputs {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  canvasApiToken: string;
}

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupFormInputs>();

  const password = watch('password');

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      const signupData = {
        name: data.name,
        email: data.email,
        password: data.password,
        canvasApiToken: data.canvasApiToken,
        canvasTokenType: 'instructor' as const,
      };

      await signup(signupData);
      navigate('/');
      toast.success('Instructor account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    }
  };

  const getCanvasTokenInstructions = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
      <div className="flex items-center mb-2">
        <Key className="w-4 h-4 text-blue-600 mr-2" />
        <h4 className="text-sm font-medium text-blue-900">Canvas API Token Instructions</h4>
      </div>
      <div className="text-sm text-blue-800 space-y-2">
        <p><strong>To get your Canvas instructor token:</strong></p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Log into your Canvas account as an instructor</li>
          <li>Go to Account → Settings</li>
          <li>Scroll down to "Approved Integrations"</li>
          <li>Click "+ New Access Token"</li>
          <li>Enter "AchieveUp" as the purpose</li>
          <li>Leave expiry blank (or set future date)</li>
          <li>Click "Generate Token"</li>
          <li>Copy the token and paste it above</li>
        </ol>
        <div className="flex items-center mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            <strong>Important:</strong> You must be an instructor in Canvas to use this application.
            Student tokens will not work.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-ucf-black via-gray-900 to-ucf-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-ucf-gold rounded-lg flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-ucf-black" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create Instructor Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Register as an instructor to manage courses and track student progress
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('name', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                type="text"
                autoComplete="name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ucf-gold focus:border-ucf-gold"
                placeholder="Dr. John Smith"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ucf-gold focus:border-ucf-gold"
                placeholder="instructor@ucf.edu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ucf-gold focus:border-ucf-gold"
                  placeholder="Enter a strong password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ucf-gold focus:border-ucf-gold"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="canvasApiToken" className="block text-sm font-medium text-gray-700">
                Canvas Instructor API Token
              </label>
              <input
                {...register('canvasApiToken', {
                  required: 'Canvas API token is required',
                  minLength: {
                    value: 60,
                    message: 'Canvas token should be around 69 characters'
                  }
                })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-ucf-gold focus:border-ucf-gold font-mono text-sm"
                placeholder="Enter your Canvas instructor API token"
              />
              {errors.canvasApiToken && (
                <p className="mt-1 text-sm text-red-600">{errors.canvasApiToken.message}</p>
              )}
              {getCanvasTokenInstructions()}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-ucf-black bg-ucf-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ucf-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ucf-black"></div>
                ) : (
                  'Create Instructor Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an instructor account?{' '}
                <Link to="/login" className="font-medium text-ucf-gold hover:text-yellow-600 transition-colors duration-200">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">
            AchieveUp Instructor Portal - UCF Integration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 