import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Award, Clock, Filter, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { progressAPI, analyticsAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';

const ProgressDashboard = ({ studentId, courseId }) => {
  const [progressData, setProgressData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'detailed', 'comparison'

  useEffect(() => {
    loadProgressData();
  }, [studentId, courseId]);

  const loadProgressData = async () => {
    try {
      const [progressResponse, graphsResponse] = await Promise.all([
        progressAPI.getSkillProgress(studentId, courseId),
        analyticsAPI.getIndividualGraphs(studentId)
      ]);

      setProgressData(progressResponse.data);
      setGraphData(graphsResponse.data);
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (score) => {
    return Math.min(100, Math.max(0, score));
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportProgressData = async () => {
    try {
      const response = await analyticsAPI.exportCourseData(courseId);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-data-${courseId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Progress data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export progress data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No progress data available</p>
      </div>
    );
  }

  const skills = Object.keys(progressData.skill_progress || {});
  const skillProgressData = skills.map(skill => {
    const skillData = progressData.skill_progress[skill];
    return {
      skill,
      score: skillData.score,
      level: skillData.level,
      totalQuestions: skillData.total_questions,
      correctAnswers: skillData.correct_answers,
      percentage: (skillData.correct_answers / skillData.total_questions) * 100
    };
  });

  const radarData = skillProgressData.map(skill => ({
    subject: skill.skill,
    A: skill.percentage,
    fullMark: 100,
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Dashboard</h1>
          <p className="text-gray-600">Track your skill development and learning progress</p>
        </div>
        <Button onClick={exportProgressData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedView === 'overview' ? 'primary' : 'secondary'}
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </Button>
        <Button
          variant={selectedView === 'detailed' ? 'primary' : 'secondary'}
          onClick={() => setSelectedView('detailed')}
        >
          Detailed View
        </Button>
        <Button
          variant={selectedView === 'comparison' ? 'primary' : 'secondary'}
          onClick={() => setSelectedView('comparison')}
        >
          Comparison
        </Button>
      </div>

      {/* Overview Cards */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-primary-600">{skills.length}</div>
            <div className="text-sm text-gray-600">Total Skills</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {skillProgressData.filter(s => s.percentage >= 80).length}
            </div>
            <div className="text-sm text-gray-600">Mastered Skills</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {skillProgressData.filter(s => s.percentage >= 60 && s.percentage < 80).length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {skillProgressData.filter(s => s.percentage < 60).length}
            </div>
            <div className="text-sm text-gray-600">Needs Attention</div>
          </Card>
        </div>
      )}

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <Card title="Skill Performance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Radar Chart */}
        <Card title="Skill Overview">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Skill Progress */}
      {selectedView === 'detailed' && (
        <Card title="Detailed Skill Progress">
          <div className="space-y-4">
            {skillProgressData.map((skill) => (
              <div key={skill.skill} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                    {skill.level}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress: {skill.correctAnswers}/{skill.totalQuestions} questions</span>
                    <span>{skill.percentage.toFixed(1)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(skill.percentage)}`}
                      style={{ width: `${skill.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Score: {skill.score}</span>
                    <span>Last updated: {progressData.last_updated ? new Date(progressData.last_updated).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Comparison View */}
      {selectedView === 'comparison' && graphData && (
        <Card title="Progress Over Time">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={graphData.timeSeriesData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {skills.map((skill, index) => (
                <Line
                  key={skill}
                  type="monotone"
                  dataKey={skill}
                  stroke={`hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recommendations */}
      <Card title="Recommendations" className="mt-6">
        <div className="space-y-3">
          {skillProgressData
            .filter(skill => skill.percentage < 60)
            .map(skill => (
              <div key={skill.skill} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Target className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">
                    Focus on improving {skill.skill}
                  </p>
                  <p className="text-sm text-red-600">
                    Current performance: {skill.percentage.toFixed(1)}% - Consider reviewing related materials
                  </p>
                </div>
              </div>
            ))}
          
          {skillProgressData
            .filter(skill => skill.percentage >= 80)
            .map(skill => (
              <div key={skill.skill} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Award className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">
                    Excellent progress in {skill.skill}
                  </p>
                  <p className="text-sm text-green-600">
                    Consider taking on more advanced challenges in this area
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressDashboard; 