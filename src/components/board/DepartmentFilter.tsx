"use client";

import React from 'react';
import { Department } from '@/lib/database.types';

interface DepartmentFilterProps {
  selectedDepartments: Department[];
  onDepartmentChange: (departments: Department[]) => void;
}

const DEPARTMENT_OPTIONS: Department[] = ['BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'];

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  selectedDepartments,
  onDepartmentChange
}) => {
  const handleDepartmentToggle = (department: Department) => {
    if (selectedDepartments.includes(department)) {
      // Remove department from selection
      onDepartmentChange(selectedDepartments.filter(d => d !== department));
    } else {
      // Add department to selection
      onDepartmentChange([...selectedDepartments, department]);
    }
  };

  const handleShowAll = () => {
    onDepartmentChange([]);
  };

  const handleSelectAll = () => {
    onDepartmentChange([...DEPARTMENT_OPTIONS]);
  };

  const showingAll = selectedDepartments.length === 0;
  const showingAllDepartments = selectedDepartments.length === DEPARTMENT_OPTIONS.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-brand-dark">Filter by Department</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleShowAll}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              showingAll 
                ? 'bg-brand-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show All
          </button>
          <button
            onClick={handleSelectAll}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              showingAllDepartments && !showingAll
                ? 'bg-brand-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Select All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {DEPARTMENT_OPTIONS.map(department => {
          const isSelected = selectedDepartments.includes(department);
          return (
            <button
              key={department}
              onClick={() => handleDepartmentToggle(department)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                isSelected
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-primary hover:text-brand-primary'
              }`}
            >
              {department}
            </button>
          );
        })}
      </div>

      {!showingAll && (
        <p className="text-xs text-brand-medium mt-2">
          Showing {selectedDepartments.length} of {DEPARTMENT_OPTIONS.length} departments
          {selectedDepartments.length > 0 && (
            <>
              {' '}• Items without department tags are hidden
            </>
          )}
        </p>
      )}
    </div>
  );
}; 