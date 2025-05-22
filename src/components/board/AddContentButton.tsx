"use client";

import React from 'react';

interface AddContentButtonProps {
  onClick: () => void;
}

export const AddContentButton: React.FC<AddContentButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 bg-brand-primary text-white font-medium rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition duration-150"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      Add Content
    </button>
  );
}; 