import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Download, Filter, TrendingUp, Users, Target, Award } from 'lucide-react';
import { analyticsAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';
import { AnalyticsDashboardProps, AnalyticsFilters, PerformanceData, SkillDistributionData, TrendData, RadarData } from '../../types';

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ courseId }) => {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    skillLevel: 'all',
    performanceRange: 'all',
    dateRange: '30'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<{
    performance: PerformanceData[];
    distribution: SkillDistributionData[];
    trends: TrendData[];
    radar: RadarData[];
  }>({
    performance: [],
    distribution: [],
    trends: [],
    radar: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [courseId, filters]);

  const fetchAnalyticsData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Mock data for demonstration
      // In a real app, you would call the actual API
      const mockData = {
        performance: [
          { studentId: 'S001', averageScore: 85, totalSkills: 12, masteredSkills: 8, needsImprovement: 2 },
          { studentId: 'S002', averageScore: 72, totalSkills: 12, masteredSkills: 6, needsImprovement: 4 },
          { studentId: 'S003', averageScore: 91, totalSkills: 12, masteredSkills: 10, needsImprovement: 1 },
          { studentId: 'S004', averageScore: 68, totalSkills: 12, masteredSkills: 5, needsImprovement: 5 },
        ],
        distribution: [
          { skill: 'JavaScript', count: 15, percentage: 25 },
          { skill: 'React', count: 12, percentage: 20 },
          { skill: 'Node.js', count: 10, percentage: 17 },
          { skill: 'Database', count: 8, percentage: 13 },
          { skill: 'API Design', count: 6, percentage: 10 },
          { skill: 'Testing', count: 4, percentage: 7 },
        ],
        trends: [
          { skill: 'JavaScript', week1: 70, week2: 75, week3: 80, week4: 85 },
          { skill: 'React', week1: 60, week2: 68, week3: 75, week4: 82 },
          { skill: 'Node.js', week1: 50, week2: 58, week3: 65, week4: 70 },
        ],
        radar: [
          { subject: 'JavaScript', A: 85, fullMark: 100 },
          { subject: 'React', A: 82, fullMark: 100 },
          { subject: 'Node.js', A: 70, fullMark: 100 },
          { subject: 'Database', A: 75, fullMark: 100 },
          { subject: 'API Design', A: 68, fullMark: 100 },
          { subject: 'Testing', A: 72, fullMark: 100 },
        ]
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportData = async (): Promise<void> => {
    try {
      const response = await analyticsAPI.exportCourseData(courseId);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${courseId}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const COLORS = ['#ffca06', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ucf-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into course performance and student progress</p>
          </div>
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-4">
            <select
              value={filters.skillLevel}
              onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
            >
              <option value="all">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={filters.performanceRange}
              onChange={(e) => handleFilterChange('performanceRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
            >
              <option value="all">All Performance Levels</option>
              <option value="high">High Performers (&gt;80%)</option>
              <option value="medium">Medium Performers (60-80%)</option>
              <option value="low">Low Performers (&lt;60%)</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">78%</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-ucf-gold bg-opacity-20 rounded-lg mx-auto mb-4">
            <Award className="w-6 h-6 text-ucf-gold" />
          </div>
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Badges Earned</div>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-600">Skills Tracked</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Comparison */}
        <Card title="Student Performance Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="studentId" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="averageScore" fill="#ffca06" name="Average Score" />
              <Bar dataKey="masteredSkills" fill="#10b981" name="Mastered Skills" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Skill Distribution */}
        <Card title="Skill Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card title="Skill Progress Trends" className="mb-8">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="week1" stroke="#ffca06" name="Week 1" />
            <Line type="monotone" dataKey="week2" stroke="#3b82f6" name="Week 2" />
            <Line type="monotone" dataKey="week3" stroke="#10b981" name="Week 3" />
            <Line type="monotone" dataKey="week4" stroke="#f59e0b" name="Week 4" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Radar Chart */}
      <Card title="Skill Proficiency Radar">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="Proficiency" dataKey="A" stroke="#ffca06" fill="#ffca06" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard; 