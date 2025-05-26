"use client";

import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'medium',
  showValue = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Size classes for stars
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  // Container size classes
  const containerSizeClasses = {
    small: 'gap-1',
    medium: 'gap-1.5',
    large: 'gap-2',
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  // Handle star click
  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  // Handle mouse enter on star
  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
      setIsHovering(true);
    }
  };

  // Handle mouse leave on star container
  const handleMouseLeave = () => {
    if (!readonly) {
      setIsHovering(false);
    }
  };

  // Determine the effective rating (hover rating or actual rating)
  const effectiveRating = isHovering ? hoverRating : rating;

  return (
    <div className="flex items-center">
      <div 
        className={`flex ${containerSizeClasses[size]}`}
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            disabled={readonly}
            className={`focus:outline-none ${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-150`}
            aria-label={`Rate ${value} out of 5`}
          >
            <svg 
              className={`${sizeClasses[size]} ${
                value <= effectiveRating 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              } ${
                !readonly && value <= hoverRating && isHovering
                  ? 'transform scale-110 transition-transform duration-150'
                  : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
              />
            </svg>
          </button>
        ))}
      </div>
      
      {showValue && (
        <span className={`ml-2 font-medium ${textSizeClasses[size]} ${rating > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
          {rating > 0 ? rating.toFixed(1) : ''}
        </span>
      )}
    </div>
  );
}; 