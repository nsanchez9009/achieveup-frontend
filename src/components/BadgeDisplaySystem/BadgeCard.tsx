import React from 'react';
import { Trophy, Star, Zap, Target, Share2, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { BadgeCardProps } from '../../types';

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onViewDetails, onShare }) => {
  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'skill_master':
        return <Trophy className="w-8 h-8 text-ucf-gold" />;
      case 'consistent_learner':
        return <Star className="w-8 h-8 text-blue-500" />;
      case 'quick_learner':
        return <Zap className="w-8 h-8 text-purple-500" />;
      case 'persistent':
        return <Target className="w-8 h-8 text-green-500" />;
      default:
        return <Trophy className="w-8 h-8 text-gray-500" />;
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'skill_master':
        return 'bg-ucf-gold bg-opacity-20 border-ucf-gold';
      case 'consistent_learner':
        return 'bg-blue-50 border-blue-200';
      case 'quick_learner':
        return 'bg-purple-50 border-purple-200';
      case 'persistent':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'badge-beginner';
      case 'intermediate':
        return 'badge-intermediate';
      case 'advanced':
        return 'badge-advanced';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={clsx(
      'relative p-6 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer',
      getBadgeColor(badge.badge_type)
    )}>
      {/* Badge Icon */}
      <div className="flex justify-center mb-4">
        {getBadgeIcon(badge.badge_type)}
      </div>

      {/* Badge Content */}
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {badge.badge_type.replace('_', ' ')}
        </h3>
        
        <p className="text-sm text-gray-600">
          {badge.description || `Achieved mastery in ${badge.skill}`}
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium',
            getLevelColor(badge.level)
          )}>
            {badge.level}
          </span>
        </div>

        <div className="text-xs text-gray-500">
          Earned on {formatDate(badge.earned_at)}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 pt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(badge);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full text-xs font-medium transition-colors"
          >
            <Eye className="w-3 h-3" />
            Details
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(badge);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full text-xs font-medium transition-colors"
          >
            <Share2 className="w-3 h-3" />
            Share
          </button>
        </div>
      </div>

      {/* Achievement Animation */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-ucf-gold rounded-full animate-pulse"></div>
    </div>
  );
};

export default BadgeCard; 