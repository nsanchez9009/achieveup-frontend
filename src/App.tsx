import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import SkillMatrixCreator from './components/SkillMatrixCreator/SkillMatrixCreator';
import SkillAssignmentInterface from './components/SkillAssignmentInterface/SkillAssignmentInterface';
import BadgeDisplaySystem from './components/BadgeDisplaySystem/BadgeDisplaySystem';
import ProgressDashboard from './components/ProgressDashboard/ProgressDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard/AnalyticsDashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Protected Route Component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ucf-gold"></div>
      </div>
    );
  }
  
  if (!user) {
    // For demo purposes, we'll create a mock user
    // In a real app, you would redirect to login
    return <>{children}</>;
  }
  
  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/skill-matrix" element={
            <ProtectedRoute>
              <SkillMatrixCreator />
            </ProtectedRoute>
          } />
          <Route path="/skill-assignment" element={
            <ProtectedRoute>
              <SkillAssignmentInterface />
            </ProtectedRoute>
          } />
          <Route path="/badges" element={
            <ProtectedRoute>
              <BadgeDisplaySystem studentId="demo-student-123" />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <ProgressDashboard studentId="demo-student-123" courseId="demo-course-456" />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsDashboard courseId="demo-course-456" />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

// Root App Component with Providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 