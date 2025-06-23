import React from 'react';
import { clsx } from 'clsx';
import { CardProps } from '../../types';

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  headerActions,
  ...props 
}) => {
  return (
    <div 
      className={clsx(
        'bg-ucf-white rounded-lg shadow-md overflow-hidden',
        className
      )}
      {...props}
    >
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center space-x-2">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default Card; 