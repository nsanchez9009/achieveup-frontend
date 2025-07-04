import React from 'react';
import { CheckCircle, Clock, Star } from 'lucide-react';
import { Badge } from '../../types';

interface BadgeCardProps {
  badge: Badge;
  onViewDetails?: (badge: Badge) => void;
  onShare?: (badge: Badge) => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  // Add null checking and default values
  const safeBadge = {
    id: badge?.id || 'unknown',
    name: badge?.name || 'Unknown Badge',
    description: badge?.description || '',
    skill_name: badge?.skill_name || 'Unknown Skill',
    level: badge?.level || 'beginner',
    earned: badge?.earned || false,
    earned_at: badge?.earned_at || '',
    progress: badge?.progress || 0,
    badge_type: badge?.badge_type || '',
    created_at: badge?.created_at || '',
    updated_at: badge?.updated_at || ''
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Star className="w-4 h-4" />;
      case 'intermediate':
        return <Star className="w-4 h-4" />;
      case 'advanced':
        return <Star className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getBadgeIcon = (skillName: string) => {
    const skill = skillName.toLowerCase();
    if (skill.includes('javascript') || skill.includes('js')) return '⚡';
    if (skill.includes('react')) return '⚛️';
    if (skill.includes('typescript')) return '📘';
    if (skill.includes('html')) return '🌐';
    if (skill.includes('css')) return '🎨';
    if (skill.includes('node')) return '🟢';
    if (skill.includes('python')) return '🐍';
    if (skill.includes('java')) return '☕';
    return '🏆';
  };

  return (
    <div className={`relative bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
      safeBadge.earned 
        ? 'border-primary-200 shadow-md' 
        : 'border-gray-200 opacity-75'
    }`}>
      {/* Earned Status Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        {safeBadge.earned ? (
          <div className="bg-green-500 text-white rounded-full p-1">
            <CheckCircle className="w-4 h-4" />
          </div>
        ) : (
          <div className="bg-gray-400 text-white rounded-full p-1">
            <Clock className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Badge Content */}
      <div className="p-6 text-center">
        {/* Badge Icon */}
        <div className="mb-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl ${
            safeBadge.earned ? 'bg-primary-100' : 'bg-gray-100'
          }`}>
            {getBadgeIcon(safeBadge.skill_name)}
          </div>
        </div>

        {/* Badge Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {safeBadge.name}
        </h3>

        {/* Skill Name */}
        <p className="text-sm text-gray-600 mb-3">
          {safeBadge.skill_name}
        </p>

        {/* Description */}
        {safeBadge.description && (
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
            {safeBadge.description}
          </p>
        )}

        {/* Level Badge */}
        <div className="flex items-center justify-center mb-4">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(safeBadge.level)}`}>
            {getLevelIcon(safeBadge.level)}
            {safeBadge.level.charAt(0).toUpperCase() + safeBadge.level.slice(1)}
          </span>
        </div>

        {/* Earned Date */}
        {safeBadge.earned && safeBadge.earned_at && (
          <div className="text-xs text-gray-500">
            Earned {new Date(safeBadge.earned_at).toLocaleDateString()}
          </div>
        )}

        {/* Progress Indicator for Unearned Badges */}
        {!safeBadge.earned && safeBadge.progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(safeBadge.progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${safeBadge.progress * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none"></div>
    </div>
  );
};

export default BadgeCard; 