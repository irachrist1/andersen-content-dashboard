"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const AppHeader: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <header className="bg-white border-b border-brand-lightest fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-lg sm:text-xl font-semibold text-brand-dark">
              ContentFlow
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/"
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                pathname === '/' 
                  ? 'text-brand-red bg-gray-50' 
                  : 'text-gray-700 hover:text-brand-red hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
          </div>
          
          <div className="mt-2 sm:mt-0 ml-4">
            <button
              onClick={() => window.dispatchEvent(new Event('addContent'))}
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-brand-primary text-white text-sm sm:text-base font-medium rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Add Content
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}; 