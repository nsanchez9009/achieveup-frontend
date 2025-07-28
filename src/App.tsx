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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Progress Tracking</h2>
        <p className="text-gray-600 mb-6">
          Track student skill development and progress across courses and assignments.
        </p>
        <div className="mt-8 p-8 bg-blue-50 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Getting Started</h3>
          <div className="text-left space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-800">1</span>
              </div>
              <p className="text-blue-800">First, create a skill matrix for your course</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-800">2</span>
              </div>
              <p className="text-blue-800">Then, assign skills to quiz questions</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-800">3</span>
              </div>
              <p className="text-blue-800">Student progress will appear here as they complete assessments</p>
            </div>
          </div>
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