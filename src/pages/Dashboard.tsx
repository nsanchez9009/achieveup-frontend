import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Award, BarChart3, TrendingUp, Users, Clock, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalSkills: 0,
    earnedBadges: 0,
    averageScore: 0,
    recentActivity: []
  });

  useEffect(() => {
    // In a real app, you would fetch dashboard stats from the API
    // For now, we'll use mock data
    setStats({
      totalSkills: 12,
      earnedBadges: 8,
      averageScore: 78,
      recentActivity: [
        { type: 'badge', title: 'Earned Skill Master Badge', description: 'JavaScript', time: '2 hours ago' },
        { type: 'progress', title: 'Improved in React', description: 'Score increased by 15%', time: '1 day ago' },
        { type: 'assessment', title: 'Completed Quiz 3', description: 'Problem Solving', time: '2 days ago' },
      ]
    });
  }, []);

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

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'badge':
        return <Award className="w-5 h-5 text-ucf-gold" />;
      case 'progress':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'assessment':
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          Track your learning progress and achievements with AchieveUp
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalSkills}</div>
          <div className="text-sm text-gray-600">Skills Tracked</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-ucf-gold bg-opacity-20 rounded-lg mx-auto mb-4">
            <Award className="w-6 h-6 text-ucf-gold" />
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
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">3</div>
          <div className="text-sm text-gray-600">Active Courses</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action.color} mr-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Recent Activity">
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card title="Upcoming Tasks">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Complete Skill Assessment</p>
                <p className="text-xs text-blue-700">JavaScript Fundamentals</p>
              </div>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Review Progress</p>
                <p className="text-xs text-green-700">React Development</p>
              </div>
              <BarChart3 className="w-4 h-4 text-green-500" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-ucf-gold bg-opacity-20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-ucf-black">Earn Next Badge</p>
                <p className="text-xs text-ucf-black opacity-70">2 more skills to master</p>
              </div>
              <Award className="w-4 h-4 text-ucf-gold" />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              View All Tasks
            </Button>
          </div>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card title="Getting Started" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-ucf-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-ucf-gold font-bold text-lg">1</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Create Skill Matrix</h3>
            <p className="text-sm text-gray-600">
              Define the skills you want to track for your course
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-ucf-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-ucf-gold font-bold text-lg">2</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Assign Skills</h3>
            <p className="text-sm text-gray-600">
              Link skills to quiz questions to track progress
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-ucf-gold bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-ucf-gold font-bold text-lg">3</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Monitor Progress</h3>
            <p className="text-sm text-gray-600">
              View analytics and track student achievements
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard; 