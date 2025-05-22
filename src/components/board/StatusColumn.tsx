import React from 'react';
import { Status } from '@/lib/database.types';

interface StatusColumnProps {
  status: Status;
  title: string;
  children?: React.ReactNode;
}

export const StatusColumn: React.FC<StatusColumnProps> = ({ 
  status: _status,
  title,
  children 
}) => {
  return (
    <div className="flex flex-col h-full min-h-[500px] bg-gray-50 rounded-md">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {children || (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No content items in this column</p>
          </div>
        )}
      </div>
    </div>
  );
}; 