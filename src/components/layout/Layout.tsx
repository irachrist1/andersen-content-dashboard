"use client";

import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen h-screen bg-gray-50">
      <Header />
      <div className="h-16"></div>
      <main className="flex-grow overflow-hidden px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}; 