import React, { useState, useEffect, useCallback } from 'react';
import { Award, Plus, RefreshCw, Download, Filter, LogIn, Globe, Share2, Copy } from 'lucide-react';
import { badgeAPI, canvasAPI, instructorAPI } from '../../services/api';
import { Badge, CanvasCourse } from '../../types';
import BadgeCard from './BadgeCard';
import Button from '../common/Button';
import Card from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
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

interface WebLinkedBadge extends Badge {
  webUrl?: string;
  shareUrl?: string;
  verificationCode?: string;
}

const BadgeDisplaySystem: React.FC<BadgeDisplaySystemProps> = ({ 
  studentId = 'current', 
  courseId 
}) => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [badges, setBadges] = useState<WebLinkedBadge[]>([]);
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
  const [showWebLinkedOptions, setShowWebLinkedOptions] = useState(false);

  const isInstructor = user?.canvasTokenType === 'instructor';

  const loadBadges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await badgeAPI.getStudentBadges(studentId);
      console.log('Badges response:', response.data); // Debug log
      
      // Validate and clean badge data
      const validBadges = (response.data || []).filter(badge => {
        if (!badge || typeof badge !== 'object') {
          console.warn('Invalid badge data:', badge);
          return false;
        }
        if (!badge.id || !badge.name || !badge.skill_name) {
          console.warn('Badge missing required fields:', badge);
          return false;
        }
        return true;
      });
      
      console.log('Valid badges:', validBadges);
      setBadges(validBadges);
    } catch (error: any) {
      console.error('Error loading badges:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Please log in to view badges');
        setBadges([]);
      } else if (error.response?.status === 404) {
        toast.error('No badges found for this user');
        setBadges([]);
      } else {
        toast.error('Failed to load badges. Please try again.');
        setBadges([]);
      }
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const loadCourses = useCallback(async () => {
    try {
      const response = await canvasAPI.getCourses();
      console.log('Courses response:', response.data); // Debug log
      setCourses(response.data || []);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        console.log('User not authenticated for courses');
        setCourses([]);
      } else {
        console.log('Other error loading courses:', error.message);
        setCourses([]);
      }
    }
  }, []);

  useEffect(() => {
    loadBadges();
    loadCourses();
  }, [loadBadges, loadCourses]);

  const generateBadges = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }

    setGenerating(true);
    try {
      if (isInstructor && showWebLinkedOptions) {
        // Generate web-linked badges for instructors
        const skillLevels: { [skillName: string]: 'beginner' | 'intermediate' | 'advanced' } = {
          'JavaScript': 'intermediate',
          'React': 'beginner',
          'TypeScript': 'advanced',
          'HTML': 'beginner',
          'CSS': 'beginner',
          'Node.js': 'intermediate'
        };

        const response = await instructorAPI.generateWebLinkedBadges(
          studentId,
          selectedCourse,
          skillLevels
        );

        setBadges(response.data);
        toast.success('Web-linked badges generated successfully!');
      } else {
        // Generate regular badges
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
      }
    } catch (error) {
      console.error('Error generating badges:', error);
      toast.error('Failed to generate badges');
    } finally {
      setGenerating(false);
    }
  };

  const copyBadgeUrl = async (badge: WebLinkedBadge) => {
    if (badge.webUrl) {
      try {
        await navigator.clipboard.writeText(badge.webUrl);
        toast.success('Badge URL copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy URL:', error);
        toast.error('Failed to copy URL');
      }
    }
  };

  const shareBadge = async (badge: WebLinkedBadge) => {
    if (badge.shareUrl && navigator.share) {
      try {
        await navigator.share({
          title: `AchieveUp Badge: ${badge.name}`,
          text: `I earned the ${badge.name} badge for ${badge.skill_name}!`,
          url: badge.shareUrl
        });
      } catch (error) {
        console.error('Failed to share badge:', error);
        toast.error('Failed to share badge');
      }
    } else if (badge.webUrl) {
      copyBadgeUrl(badge);
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
  const getWebLinkedCount = () => badges.filter(badge => badge.webUrl).length;

  const filteredBadges = getFilteredBadges();

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">Please log in to view your badges.</p>
          <Button onClick={() => window.location.href = '/login'}>
            <LogIn className="w-4 h-4 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

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

  // Error boundary for runtime errors
  try {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card
        title="Badge Display System"
        subtitle={isInstructor 
          ? "Generate and manage web-linked badges for student achievements"
          : "View and manage earned badges for skill mastery"
        }
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
            {isInstructor && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getWebLinkedCount()}</div>
                <div className="text-sm text-gray-600">Web-Linked</div>
              </div>
            )}
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
              {isInstructor ? 'Generate Badges' : 'Generate Badges'}
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

        {/* Web-Linked Badge Options for Instructors */}
        {isInstructor && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900 mb-1">Web-Linked Badges</h4>
                <p className="text-sm text-purple-700">
                  Generate badges with web URLs that can be shared and verified online
                </p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showWebLinkedOptions}
                  onChange={(e) => setShowWebLinkedOptions(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-purple-700">Enable web-linked badges</span>
              </label>
            </div>
            {showWebLinkedOptions && (
              <div className="mt-3 text-sm text-purple-600">
                <p>✓ Badges will have unique web URLs</p>
                <p>✓ Students can share badges on social media</p>
                <p>✓ Employers can verify badge authenticity</p>
              </div>
            )}
          </div>
        )}

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
            {filteredBadges.filter(badge => badge && badge.id).map((badge) => (
              <div key={badge.id} className="relative">
                <BadgeCard badge={badge} />
                
                {/* Web-Linked Badge Actions */}
                {isInstructor && badge.webUrl && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyBadgeUrl(badge)}
                      className="w-8 h-8 p-0 bg-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareBadge(badge)}
                      className="w-8 h-8 p-0 bg-white"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                                 {/* Web URL Indicator */}
                 {badge.webUrl && (
                   <div className="absolute top-2 left-2">
                     <div className="relative group">
                       <div className="bg-green-500 text-white rounded-full p-1">
                         <Globe className="w-3 h-3" />
                       </div>
                       <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         Web-linked badge
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
  } catch (error) {
    console.error('Error rendering BadgeDisplaySystem:', error);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <RefreshCw className="w-8 h-8 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">There was an error loading the badges page.</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Page
          </Button>
        </div>
      </div>
    );
  }
};

export default BadgeDisplaySystem;