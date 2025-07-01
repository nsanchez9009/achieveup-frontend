import React, { useState, useEffect } from 'react';
import { Award, Plus, RefreshCw, Download, Filter } from 'lucide-react';
import { badgeAPI, canvasAPI } from '../../services/api';
import { Badge, CanvasCourse } from '../../types';
import BadgeCard from './BadgeCard';
import Button from '../common/Button';
import Card from '../common/Card';
import toast from 'react-hot-toast';

interface BadgeDisplaySystemProps {
  studentId?: string;
  courseId?: string;
}

interface BadgeFilters {
  skill: string;
  level: 'all' | 'beginner' | 'intermediate' | 'advanced';
  earned: 'all' | 'earned' | 'unearned';
}

const BadgeDisplaySystem: React.FC<BadgeDisplaySystemProps> = ({ 
  studentId = 'current', 
  courseId 
}) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<BadgeFilters>({
    skill: 'all',
    level: 'all',
    earned: 'all'
  });
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBadges();
    loadCourses();
  }, [studentId, selectedCourse]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = await badgeAPI.getStudentBadges(studentId);
      setBadges(response.data);
    } catch (error) {
      console.error('Error loading badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await canvasAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const generateBadges = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    setGenerating(true);
    try {
      // Generate badges based on skill levels
      const skillLevels: { [skillName: string]: 'beginner' | 'intermediate' | 'advanced' } = {
        'JavaScript': 'intermediate',
        'React': 'beginner',
        'TypeScript': 'advanced',
        'HTML': 'beginner',
        'CSS': 'beginner',
        'Node.js': 'intermediate'
      };

      const response = await badgeAPI.generate({
        student_id: studentId,
        course_id: selectedCourse,
        skill_levels: skillLevels
      });

      setBadges(response.data);
      toast.success('Badges generated successfully!');
    } catch (error) {
      console.error('Error generating badges:', error);
      toast.error('Failed to generate badges');
    } finally {
      setGenerating(false);
    }
  };

  const exportBadges = () => {
    const filteredBadges = getFilteredBadges();
    const dataStr = JSON.stringify(filteredBadges, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `badges-${studentId}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Badges exported successfully!');
  };

  const getFilteredBadges = () => {
    return badges.filter(badge => {
      if (filters.skill !== 'all' && badge.skill_name !== filters.skill) return false;
      if (filters.level !== 'all' && badge.level !== filters.level) return false;
      if (filters.earned !== 'all') {
        const isEarned = badge.earned || false;
        if (filters.earned === 'earned' && !isEarned) return false;
        if (filters.earned === 'unearned' && isEarned) return false;
      }
      return true;
    });
  };

  const getUniqueSkills = () => {
    const skills = badges.map(badge => badge.skill_name);
    return ['all', ...Array.from(new Set(skills))];
  };

  const getEarnedCount = () => badges.filter(badge => badge.earned).length;
  const getTotalCount = () => badges.length;

  const filteredBadges = getFilteredBadges();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card
        title="Badge Display System"
        subtitle="View and manage earned badges for skill mastery"
      >
        {/* Header with stats and actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{getEarnedCount()}</div>
              <div className="text-sm text-gray-600">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{getTotalCount()}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getTotalCount() > 0 ? Math.round((getEarnedCount() / getTotalCount()) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportBadges}
              disabled={filteredBadges.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={generateBadges}
              loading={generating}
              disabled={!selectedCourse}
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Badges
            </Button>
          </div>
        </div>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course for Badge Generation
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill
                </label>
                <select
                  value={filters.skill}
                  onChange={(e) => setFilters(prev => ({ ...prev, skill: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {getUniqueSkills().map(skill => (
                    <option key={skill} value={skill}>
                      {skill === 'all' ? 'All Skills' : skill}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.earned}
                  onChange={(e) => setFilters(prev => ({ ...prev, earned: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Badges</option>
                  <option value="earned">Earned Only</option>
                  <option value="unearned">Unearned Only</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Badges Grid */}
        {filteredBadges.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges found</h3>
            <p className="text-gray-600 mb-4">
              {badges.length === 0 
                ? "No badges have been generated yet. Select a course and generate badges to get started."
                : "No badges match the current filters. Try adjusting your filter criteria."
              }
            </p>
            {badges.length === 0 && (
              <Button onClick={generateBadges} disabled={!selectedCourse}>
                <Plus className="w-4 h-4 mr-2" />
                Generate First Badges
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default BadgeDisplaySystem;