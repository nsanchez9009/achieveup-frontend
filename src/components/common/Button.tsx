import React from 'react';
import { clsx } from 'clsx';
import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  type = 'button',
  onClick,
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-ucf-gold hover:bg-primary-600 text-ucf-black focus:ring-ucf-gold',
    secondary: 'bg-ucf-grey hover:bg-gray-600 text-ucf-white focus:ring-gray-500',
    success: 'bg-success hover:bg-green-600 text-ucf-white focus:ring-green-500',
    warning: 'bg-ucf-gold hover:bg-primary-600 text-ucf-black focus:ring-ucf-gold',
    danger: 'bg-danger hover:bg-red-600 text-ucf-white focus:ring-red-500',
    outline: 'border-2 border-ucf-gold text-ucf-gold hover:bg-ucf-gold hover:text-ucf-black focus:ring-ucf-gold',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button; 