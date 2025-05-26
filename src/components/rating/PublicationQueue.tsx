"use client";

import React, { useState, useEffect } from 'react';
import { ContentItem } from '@/lib/database.types';
import { StarRating } from './StarRating';
import { format } from 'date-fns';
import { DepartmentBadge } from '../content/DepartmentBadge';

export const PublicationQueue: React.FC = () => {
  const [queueItems, setQueueItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch publication queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ratings/publication-queue');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch publication queue: ${response.status}`);
      }
      
      const data = await response.json();
      setQueueItems(data);
    } catch (err) {
      console.error('Error fetching publication queue:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Mark item for publication (move to Scheduled)
  const markForPublication = async (contentId: string) => {
    try {
      setProcessing(contentId);
      setError(null);
      
      const response = await fetch('/api/ratings/publication-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentId }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark for publication: ${response.status}`);
      }
      
      // Remove the item from the queue
      setQueueItems((prev) => prev.filter((item) => item.id !== contentId));
    } catch (err) {
      console.error('Error marking for publication:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setProcessing(null);
    }
  };

  // Fetch queue on component mount
  useEffect(() => {
    fetchQueue();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Publication Queue</h2>
        <button
          onClick={fetchQueue}
          className="text-sm text-brand-red hover:text-brand-red/80 flex items-center"
          disabled={loading}
        >
          <svg 
            className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Queue items */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-red mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading publication queue...</p>
        </div>
      ) : queueItems.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg 
            className="w-12 h-12 text-gray-400 mx-auto" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <p className="mt-2 text-gray-500">No content items eligible for publication.</p>
          <p className="text-sm text-gray-400 mt-1">
            Items with an average rating of 4.0+ and at least 3 ratings will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {queueItems.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.department && <DepartmentBadge department={item.department} variant="compact" />}
                      <h3 className="text-base font-medium text-gray-900">{item.title}</h3>
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center">
                        <StarRating rating={item.average_rating || 0} readonly size="small" showValue />
                        <span className="ml-2 text-xs text-gray-500">
                          ({item.total_ratings} {item.total_ratings === 1 ? 'rating' : 'ratings'})
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Created: {format(new Date(item.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center self-end sm:self-center">
                    <button
                      onClick={() => markForPublication(item.id)}
                      disabled={processing === item.id}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        processing === item.id
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-brand-red text-white hover:bg-brand-red/90'
                      }`}
                    >
                      {processing === item.id ? (
                        <>
                          <span className="inline-block animate-spin mr-1">⟳</span>
                          Processing...
                        </>
                      ) : (
                        'Move to Scheduled'
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 