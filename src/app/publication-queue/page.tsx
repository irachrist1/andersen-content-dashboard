"use client";

import React from 'react';
import { PublicationQueue } from '@/components/rating/PublicationQueue';
import { AppHeader } from '@/components/layout/AppHeader';

export default function PublicationQueuePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Publication Queue</h1>
          <p className="text-gray-600 mt-1">
            Content items with high ratings that are eligible for publication.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <PublicationQueue />
        </div>
      </main>
    </div>
  );
} 