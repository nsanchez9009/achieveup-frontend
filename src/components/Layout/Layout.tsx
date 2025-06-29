import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from './Navigation';
import Button from '../common/Button';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show back button on dashboard
  const showBackButton = location.pathname !== '/dashboard' && location.pathname !== '/';
  
  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/skill-matrix':
        return 'Skill Matrix Creator';
      case '/skill-assignment':
        return 'Skill Assignment';
      case '/badges':
        return 'Badges';
      case '/progress':
        return 'Progress Dashboard';
      case '/analytics':
        return 'Analytics Dashboard';
      case '/settings':
        return 'Settings';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-6">
        {/* Page Header with Back Button */}
        {showBackButton && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout; 