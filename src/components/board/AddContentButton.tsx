"use client";

import React from 'react';

interface AddContentButtonProps {
  onClick: () => void;
}

export const AddContentButton: React.FC<AddContentButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-1"
      aria-label="Add new content"
    >
      <span className="text-lg">+</span> Add Content
    </button>
  );
}; 