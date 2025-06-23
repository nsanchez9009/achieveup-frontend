import React, { useState, useEffect } from 'react';
import { Grid, List, Filter, Search, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { badgeAPI } from '../../services/api';
import BadgeCard from './BadgeCard';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const BadgeDisplaySystem = ({ studentId }) => {
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    badgeType: 'all',
    level: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    loadBadges();
  }, [studentId]);

  useEffect(() => {
    filterBadges();
  }, [badges, filters]);

  const loadBadges = async () => {
    try {
      const response = await badgeAPI.getStudentBadges(studentId);
      setBadges(response.data);
    } catch (error) {
      console.error('Error loading badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const filterBadges = () => {
    let filtered = [...badges];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(badge =>
        badge.skill.toLowerCase().includes(filters.search.toLowerCase()) ||
        badge.badge_type.toLowerCase().includes(filters.search.toLowerCase()) ||
        badge.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Badge type filter
    if (filters.badgeType !== 'all') {
      filtered = filtered.filter(badge => badge.badge_type === filters.badgeType);
    }

    // Level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(badge => badge.level === filters.level);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(badge => {
        const earnedDate = new Date(badge.earned_at);
        switch (filters.dateRange) {
          case '30days':
            return earnedDate >= thirtyDaysAgo;
          case '90days':
            return earnedDate >= ninetyDaysAgo;
          default:
            return true;
        }
      });
    }

    setFilteredBadges(filtered);
  };

  const handleViewDetails = (badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const handleShare = async (badge) => {
    try {
      const shareText = `I earned the ${badge.badge_type.replace('_', ' ')} badge for ${badge.skill} at ${badge.level} level!`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'AchieveUp Badge',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Badge details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing badge:', error);
      toast.error('Failed to share badge');
    }
  };

  const getBadgeStats = () => {
    const total = badges.length;
    const byType = badges.reduce((acc, badge) => {
      acc[badge.badge_type] = (acc[badge.badge_type] || 0) + 1;
      return acc;
    }, {});
    const byLevel = badges.reduce((acc, badge) => {
      acc[badge.level] = (acc[badge.level] || 0) + 1;
      return acc;
    }, {});

    return { total, byType, byLevel };
  };

  const stats = getBadgeStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Badges</h1>
        <p className="text-gray-600">Track your achievements and skill mastery</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Badges</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.byType.skill_master || 0}</div>
          <div className="text-sm text-gray-600">Skill Master</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.byType.consistent_learner || 0}</div>
          <div className="text-sm text-gray-600">Consistent Learner</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.byLevel.advanced || 0}</div>
          <div className="text-sm text-gray-600">Advanced Level</div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search badges..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.badgeType}
              onChange={(e) => setFilters(prev => ({ ...prev, badgeType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="skill_master">Skill Master</option>
              <option value="consistent_learner">Consistent Learner</option>
              <option value="quick_learner">Quick Learner</option>
              <option value="persistent">Persistent</option>
            </select>

            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Badges Display */}
      {filteredBadges.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No badges found</h3>
            <p>Try adjusting your filters or complete more assessments to earn badges!</p>
          </div>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge._id}
              badge={badge}
              onViewDetails={handleViewDetails}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* Badge Detail Modal */}
      {showModal && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">
                {selectedBadge.badge_type.replace('_', ' ')}
              </h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              <div className="space-y-2 text-sm">
                <p><strong>Skill:</strong> {selectedBadge.skill}</p>
                <p><strong>Level:</strong> {selectedBadge.level}</p>
                <p><strong>Earned:</strong> {new Date(selectedBadge.earned_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => handleShare(selectedBadge)}
                  className="flex-1"
                >
                  Share Badge
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplaySystem; 