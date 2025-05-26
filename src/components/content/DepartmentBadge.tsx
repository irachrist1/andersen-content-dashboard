"use client";

import React from 'react';
import { Department } from '@/lib/database.types';

interface DepartmentBadgeProps {
  department: Department;
  variant?: 'default' | 'compact';
}

const getDepartmentColor = (department: Department): string => {
  switch (department) {
    case 'BSS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Tax Advisory':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Management Consulting':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Operations':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Technology':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDepartmentAbbreviation = (department: Department): string => {
  switch (department) {
    case 'BSS':
      return 'BSS';
    case 'Tax Advisory':
      return 'TAX';
    case 'Management Consulting':
      return 'MC';
    case 'Operations':
      return 'OPS';
    case 'Technology':
      return 'TECH';
    default:
      return 'DEPT';
  }
};

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({
  department,
  variant = 'default'
}) => {
  const colorClasses = getDepartmentColor(department);
  const isCompact = variant === 'compact';

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${colorClasses}
        ${isCompact 
          ? 'px-2 py-0.5 text-xs' 
          : 'px-2.5 py-1 text-xs'
        }
      `}
      title={department}
    >
      {isCompact ? getDepartmentAbbreviation(department) : department}
    </span>
  );
}; 