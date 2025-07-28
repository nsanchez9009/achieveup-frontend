import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';
import './index.css';
import SkillMatrixCreator from './components/SkillMatrixCreator/SkillMatrixCreator';
import SkillAssignmentInterface from './components/SkillAssignmentInterface/SkillAssignmentInterface';
import AnalyticsDashboard from './components/AnalyticsDashboard/AnalyticsDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Student Progress Component (placeholder for now)
const StudentProgress: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Progress</h2>
        <p className="text-gray-600">
          View and track individual student progress across all skills and courses.
        </p>
        <div className="mt-8 p-8 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            This section will show detailed student progress tracking once the skill matrices 
            and assignments are set up.
          </p>
        </div>
      </div>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/skill-matrix" element={
        <ProtectedRoute>
          <Layout>
            <SkillMatrixCreator />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/skill-assignment" element={
        <ProtectedRoute>
          <Layout>
            <SkillAssignmentInterface />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute>
          <Layout>
            <StudentProgress />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <AnalyticsDashboard courseId="default" />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 