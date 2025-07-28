import React, { useState, useEffect } from 'react';
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

// Student Progress Component
const StudentProgress: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [studentData, setStudentData] = useState<{
    students: Array<{
      id: string;
      name: string;
      progress: number;
      skillsMastered: number;
      badgesEarned: number;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
    skillDistribution: Record<string, number>;
    averageScores: Record<string, number>;
  } | null>(null);
  const [error, setError] = useState<string>('');

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  // Load student data when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadStudentData(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { canvasInstructorAPI } = await import('./services/api');
      const response = await canvasInstructorAPI.getInstructorCourses();
      setCourses(response.data);
      
      // Auto-select first course if available
      if (response.data.length > 0) {
        setSelectedCourse(response.data[0].id);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Please check your Canvas integration.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentData = async (courseId: string) => {
    try {
      setLoading(true);
      setError('');
      const { instructorAPI } = await import('./services/api');
      const response = await instructorAPI.getCourseStudentAnalytics(courseId);
      setStudentData(response.data);
    } catch (err) {
      console.error('Error loading student data:', err);
      setError('Failed to load student data. This may be because no skill matrix or assignments exist for this course yet.');
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (riskLevel: 'low' | 'medium' | 'high') => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskIcon = (riskLevel: 'low' | 'medium' | 'high') => {
    const { CheckCircle, AlertTriangle } = require('lucide-react');
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'medium': case 'high': return <AlertTriangle className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ucf-gold"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Progress Tracking</h1>
        <p className="text-gray-600">
          Monitor student skill development and progress across courses and assignments.
        </p>
      </div>

      {/* Course Selection */}
      {courses.length > 0 && (
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
          >
            <option value="">Choose a course...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* No Courses */}
      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📚</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Courses Found</h2>
          <p className="text-gray-600 mb-4">
            Make sure your Canvas instructor token is set up correctly.
          </p>
          <a
            href="/settings"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-ucf-gold hover:bg-yellow-600"
          >
            Configure Canvas Token
          </a>
        </div>
      )}

      {/* Student Data Display */}
      {studentData && studentData.students.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{studentData.students.length}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-lg font-semibold text-gray-900">{studentData.students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">
                      {Math.round(studentData.students.reduce((acc, s) => acc + s.progress, 0) / studentData.students.length)}%
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Average Progress</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Math.round(studentData.students.reduce((acc, s) => acc + s.progress, 0) / studentData.students.length)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">
                      {Object.keys(studentData.skillDistribution).length}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Skills Tracked</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {Object.keys(studentData.skillDistribution).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Student Progress Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Student Performance Overview</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills Mastered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Badges Earned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentData.students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.skillsMastered}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.badgesEarned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(student.riskLevel)}`}>
                          {getRiskIcon(student.riskLevel)}
                          {student.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skill Distribution */}
          {Object.keys(studentData.skillDistribution).length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Skill Distribution</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(studentData.skillDistribution).map(([skill, count]) => (
                    <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900">{skill}</span>
                      <span className="text-sm text-gray-600">{count} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Data State */}
      {selectedCourse && studentData && studentData.students.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Student Data Available</h2>
          <p className="text-gray-600 mb-6">
            Student progress will appear here once you create a skill matrix and assign skills to quiz questions.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-800">1</span>
              </div>
              <p className="text-blue-800">First, create a skill matrix for your course</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-800">2</span>
              </div>
              <p className="text-blue-800">Then, assign skills to quiz questions</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold text-blue-800">3</span>
              </div>
              <p className="text-blue-800">Student progress will appear here as they complete assessments</p>
            </div>
          </div>
        </div>
      )}
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