"use client";

import React from 'react';
import { AddContentButton } from '../board/AddContentButton';

export const Header: React.FC = () => {
  const handleAddContent = () => {
    // Dispatch a custom event to trigger the add content modal
    window.dispatchEvent(new Event('addContent'));
  };

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ContentFlow</h1>
        <AddContentButton onClick={handleAddContent} />
      </div>
    </header>
  );
};
