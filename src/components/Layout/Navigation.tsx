import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Target, Users, BarChart3, Settings, LogOut, User, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { user, logout, backendAvailable } = useAuth();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Skill Matrix', href: '/skill-matrix', icon: Target },
    { name: 'Skill Assignment', href: '/skill-assignment', icon: Target },
    { name: 'Student Progress', href: '/progress', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const handleLogout = (): void => {
    logout();
  };

  return (
    <nav className="bg-ucf-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-ucf-gold rounded-lg flex items-center justify-center">
                <span className="text-ucf-black font-bold text-lg">A</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">AchieveUp</span>
              <span className="ml-2 text-sm text-gray-500 hidden lg:inline">Instructor Portal</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                      isActive
                        ? 'border-ucf-gold text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="hidden lg:inline">{item.name}</span>
                    <span className="lg:hidden">{item.name.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              {/* Backend Status Indicator */}
              <div className="flex items-center space-x-1">
                {backendAvailable ? (
                  <div className="relative group">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Backend connected
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Backend unavailable
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span 
                  className="text-sm text-gray-700 max-w-32 truncate cursor-help" 
                  title={user?.name || user?.email || 'Instructor'}
                >
                  {user?.name || user?.email || 'Instructor'}
                </span>
                <span className="text-xs text-ucf-gold bg-ucf-gold bg-opacity-10 px-2 py-1 rounded-full">
                  Instructor
                </span>
              </div>
              <Link
                to="/settings"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
              >
                <Settings className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ucf-gold"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-ucf-white border-t border-gray-200">
            {/* Mobile Backend Status */}
            <div className="flex items-center px-3 py-2">
              {backendAvailable ? (
                <div className="flex items-center">
                  <Wifi className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-sm text-gray-600">Backend connected</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <WifiOff className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-sm text-gray-600">Backend unavailable</span>
                </div>
              )}
            </div>
            
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-ucf-gold bg-opacity-10 text-ucf-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile User Info */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <User className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-700">
                    {user?.name || user?.email || 'Instructor'}
                  </div>
                  <div className="text-xs text-ucf-gold">Instructor Portal</div>
                </div>
              </div>
              <Link
                to="/settings"
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 