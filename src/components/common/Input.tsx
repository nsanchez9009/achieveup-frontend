import React from 'react';
import { clsx } from 'clsx';
import { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText,
  className = '',
  value,
  onChange,
  onKeyPress,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ucf-gold focus:border-transparent transition-colors duration-200',
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300',
          className
        )}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        required={required}
        {...props}
      />
      {(error || helperText) && (
        <p className={clsx(
          'mt-1 text-sm',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 