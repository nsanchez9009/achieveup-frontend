import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { canvasInstructorAPI, instructorAPI } from '../services/api';
import { CanvasCourse } from '../types';
import Card from '../components/common/Card';
import { Home, Target, Award, Users, TrendingUp, Brain, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Activity {
  type: 'badge' | 'progress' | 'assessment';
  title: string;
  description: string;
  time: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

interface DashboardStats {
  totalSkills: number;
  earnedBadges: number;
  averageScore: number;
  recentActivity: Activity[];
}

interface InstructorDashboardStats {
  totalCourses: number;
  totalStudents: number;
  averageProgress: number;
  recentActivity: Activity[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSkills: 0,
    earnedBadges: 0,
    averageScore: 0,
    recentActivity: []
  });
  const [instructorStats, setInstructorStats] = useState<InstructorDashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    recentActivity: []
  });

  const isInstructor = user?.canvasTokenType === 'instructor';

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isInstructor) {
        // Load instructor-specific data
        const [coursesResponse, dashboardResponse] = await Promise.all([
          canvasInstructorAPI.getInstructorCourses(),
          instructorAPI.getInstructorDashboard()
        ]);
        
        setCourses(coursesResponse.data);
        setInstructorStats({
          totalCourses: dashboardResponse.data.totalCourses,
          totalStudents: dashboardResponse.data.totalStudents,
          averageProgress: dashboardResponse.data.averageProgress,
          recentActivity: dashboardResponse.data.recentActivity || []
        });
      } else {
        // Load student data (existing logic)
        const response = await canvasInstructorAPI.getInstructorCourses();
        setCourses(response.data);
        setStats({
          totalSkills: 0,
          earnedBadges: 0,
          averageScore: 0,
          recentActivity: []
        });
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 404) {
        // Backend endpoints not implemented yet
        setCourses([]);
        if (isInstructor) {
          setInstructorStats({
            totalCourses: 0,
            totalStudents: 0,
            averageProgress: 0,
            recentActivity: []
          });
        } else {
          setStats({
            totalSkills: 0,
            earnedBadges: 0,
            averageScore: 0,
            recentActivity: []
          });
        }
        toast.error('Canvas integration not available yet. Backend endpoints need to be implemented.');
      } else if (error.response?.status === 401) {
        // User needs to set up Canvas API token
        setCourses([]);
        if (isInstructor) {
          setInstructorStats({
            totalCourses: 0,
            totalStudents: 0,
            averageProgress: 0,
            recentActivity: []
          });
        } else {
          setStats({
            totalSkills: 0,
            earnedBadges: 0,
            averageScore: 0,
            recentActivity: []
          });
        }
        toast.error('Please set up your Canvas API token in Settings to view courses.');
      } else {
        // Other errors
        setCourses([]);
        if (isInstructor) {
          setInstructorStats({
            totalCourses: 0,
            totalStudents: 0,
            averageProgress: 0,
            recentActivity: []
          });
        } else {
          setStats({
            totalSkills: 0,
            earnedBadges: 0,
            averageScore: 0,
            recentActivity: []
          });
        }
        toast.error('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [isInstructor]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Instructor-specific quick actions
  const instructorQuickActions: QuickAction[] = [
    {
      title: 'Create Skill Matrix',
      description: 'Define skills and competencies for your course',
      icon: Target,
      href: '/skill-matrix',
      color: 'bg-blue-500'
    },
    {
      title: 'AI Skill Assignment',
      description: 'Use AI to automatically assign skills to questions',
      icon: Brain,
      href: '/skill-assignment',
      color: 'bg-purple-500'
    },
    {
      title: 'Course Settings',
      description: 'Manage Canvas integration and course settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    }
  ];

  // Student quick actions (existing)
  const studentQuickActions: QuickAction[] = [
    {
      title: 'View Progress',
      description: 'Track your skill development and progress',
      icon: TrendingUp,
      href: '/progress',
      color: 'bg-green-500'
    },
    {
      title: 'Course Settings',
      description: 'Manage Canvas integration and course settings',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    }
  ];

  const quickActions = isInstructor ? instructorQuickActions : studentQuickActions;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          {isInstructor 
            ? 'Welcome to your instructor dashboard. Manage your courses, track student progress, and create skill-based assessments.'
            : 'Welcome to your learning dashboard. Track your progress and earn badges for your achievements.'
          }
        </p>
        
        {/* Token Type Indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isInstructor 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isInstructor ? 'Instructor Mode' : 'Student Mode'}
          </div>
          {!user?.hasCanvasToken && (
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Canvas Token Required
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {isInstructor ? (
          <>
            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{instructorStats.totalCourses}</div>
              <div className="text-sm text-gray-600">Active Courses</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{instructorStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{instructorStats.averageProgress}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
                <Brain className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
              <div className="text-sm text-gray-600">Courses Loaded</div>
            </Card>
          </>
        ) : (
          <>
            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSkills}</div>
              <div className="text-sm text-gray-600">Skills Tracked</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.earnedBadges}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </Card>

            <Card className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
              <div className="text-sm text-gray-600">Enrolled Courses</div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.href}
                className="group block p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>



    </div>
  );
};

export default Dashboard; 