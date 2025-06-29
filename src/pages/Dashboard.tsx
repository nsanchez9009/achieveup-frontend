import React, { useState, useEffect } from 'react';
import { Target, Award, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { canvasAPI } from '../services/api';
import { CanvasCourse } from '../types';
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Reload dashboard data when user's Canvas token changes
  useEffect(() => {
    if (user?.canvasApiToken) {
      loadDashboardData();
    }
  }, [user?.canvasApiToken]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user's courses from Canvas
      const coursesResponse = await canvasAPI.getCourses();
      setCourses(coursesResponse.data);
      
      // Calculate stats based on real data
      setStats({
        totalSkills: coursesResponse.data.length, // Show actual course count
        earnedBadges: 0, // Will be calculated from badge API
        averageScore: 0, // Will be calculated from score API
        recentActivity: [] // Will be calculated from recent activity
      });
      
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      
      // Handle different error scenarios
      if (error.response?.status === 404) {
        // Backend endpoints not implemented yet
        setCourses([]);
        setStats({
          totalSkills: 0,
          earnedBadges: 0,
          averageScore: 0,
          recentActivity: []
        });
        toast.error('Canvas integration not available yet. Backend endpoints need to be implemented.');
      } else if (error.response?.status === 401) {
        // User needs to set up Canvas API token
        setCourses([]);
        setStats({
          totalSkills: 0,
          earnedBadges: 0,
          averageScore: 0,
          recentActivity: []
        });
        toast.error('Please set up your Canvas API token in Settings to view courses.');
      } else {
        // Other errors
        setCourses([]);
        setStats({
          totalSkills: 0,
          earnedBadges: 0,
          averageScore: 0,
          recentActivity: []
        });
        toast.error('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Create Skill Matrix',
      description: 'Define skills for your course',
      icon: Target,
      href: '/skill-matrix',
      color: 'bg-blue-500'
    },
    {
      title: 'Assign Skills',
      description: 'Link skills to quiz questions',
      icon: Target,
      href: '/skill-assignment',
      color: 'bg-green-500'
    },
    {
      title: 'View Badges',
      description: 'Check earned achievements',
      icon: Award,
      href: '/badges',
      color: 'bg-ucf-gold'
    },
    {
      title: 'Progress Dashboard',
      description: 'Track learning progress',
      icon: BarChart3,
      href: '/progress',
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-600">
          Welcome to AchieveUp - your micro-credentialling platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalSkills > 0 ? stats.totalSkills : '0'}
              </p>
              {stats.totalSkills === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {user?.canvasApiToken ? 'Loading...' : 'Set up Canvas token'}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Badges Earned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.earnedBadges}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button 
                  className="w-full flex items-center justify-start" 
                  variant="outline" 
                  key={action.title}
                  onClick={() => window.location.href = action.href}
                >
                  <Icon className="w-4 h-4 mr-2 flex-shrink-0" />
                  {action.title}
                </Button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{course.name}</p>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      toast('Course details page coming soon!');
                      // TODO: Navigate to course detail page when implemented
                      // window.location.href = `/course/${course.id}`;
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No courses found</p>
              <p className="text-sm text-gray-400 mb-4">
                {user?.canvasApiToken 
                  ? "Canvas integration is being set up. Check back soon!"
                  : "Set up your Canvas API token in Settings to view your courses."
                }
              </p>
              {!user?.canvasApiToken && (
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings'}>
                  Go to Settings
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No recent activity to display</p>
            <p className="text-sm text-gray-400 mb-4">
              {user?.canvasApiToken 
                ? "Complete assessments and earn badges to see your activity here"
                : "Set up Canvas integration to start tracking your progress"
              }
            </p>
            {!user?.canvasApiToken && (
              <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings'}>
                Set Up Canvas
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard; 