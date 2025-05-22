import React from 'react';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  subMessage,
  icon 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white bg-opacity-90 rounded-lg border border-dashed border-gray-300 text-center">
      {icon || (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      <p className="text-xs sm:text-sm text-brand-medium font-medium">{message}</p>
      {subMessage && (
        <p className="text-xs text-brand-light mt-1 hidden sm:block">{subMessage}</p>
      )}
    </div>
  );
}; 