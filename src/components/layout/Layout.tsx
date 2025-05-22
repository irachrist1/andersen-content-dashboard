"use client";

import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="h-12 md:h-16"></div>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}; 