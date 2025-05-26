"use client";

import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { ContentItem, ContentRating } from '@/lib/database.types';
import { format } from 'date-fns';

interface RatingDisplayProps {
  contentItem: ContentItem;
  userId: string;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({ contentItem, userId }) => {
  const [ratings, setRatings] = useState<ContentRating[]>([]);
  const [userRating, setUserRating] = useState<ContentRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch ratings for this content item
  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all ratings for this content item
      const response = await fetch(`/api/ratings?contentId=${contentItem.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ratings: ${response.status}`);
      }
      
      const data = await response.json();
      setRatings(data);
      
      // Fetch user's rating if they have one
      const userResponse = await fetch(`/api/ratings/user?contentId=${contentItem.id}&userId=${userId}`);
      
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user rating: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      setUserRating(userData.exists === false ? null : userData);
      setComment(userData.comment || '');
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Submit or update a rating
  const submitRating = async (rating: number) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentId: contentItem.id,
          userId,
          rating,
          comment,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit rating: ${response.status}`);
      }
      
      const data = await response.json();
      setUserRating(data);
      
      // Refresh ratings to show the updated list
      fetchRatings();
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a rating
  const deleteRating = async () => {
    if (!userRating) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/ratings/${userRating.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete rating: ${response.status}`);
      }
      
      setUserRating(null);
      setComment('');
      
      // Refresh ratings to show the updated list
      fetchRatings();
    } catch (err) {
      console.error('Error deleting rating:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch ratings on component mount
  useEffect(() => {
    fetchRatings();
  }, [contentItem.id, userId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Ratings</h3>
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Average rating display */}
      <div className="flex items-center space-x-4">
        <div>
          <StarRating 
            rating={contentItem.average_rating || 0} 
            readonly 
            size="large"
            showValue
          />
        </div>
        <div className="text-sm text-gray-500">
          {contentItem.total_ratings ? `${contentItem.total_ratings} ${contentItem.total_ratings === 1 ? 'rating' : 'ratings'}` : 'No ratings yet'}
        </div>
      </div>
      
      {/* Publication eligibility badge */}
      {contentItem.publication_eligible && (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Eligible for publication
        </div>
      )}
      
      {/* User rating form */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Your Rating</h4>
        <div className="space-y-3">
          <StarRating 
            rating={userRating?.rating || 0}
            onRatingChange={submitRating}
            size="medium"
          />
          
          <div className="mt-2">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about your rating..."
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => submitRating(userRating?.rating || 0)}
              disabled={submitting || !userRating?.rating}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                userRating?.rating 
                  ? 'bg-brand-primary text-white hover:bg-brand-secondary' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Saving...' : userRating ? 'Update Comment' : 'Save Comment'}
            </button>
            
            {userRating && (
              <button
                type="button"
                onClick={deleteRating}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Delete Rating
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Rating list */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-2">Recent Ratings</h4>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading ratings...</p>
          </div>
        ) : ratings.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No ratings yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <li key={rating.id} className="py-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <StarRating rating={rating.rating} readonly size="small" />
                      <span className="ml-2 text-sm text-gray-500">
                        {format(new Date(rating.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="mt-1 text-sm text-gray-700">{rating.comment}</p>
                    )}
                  </div>
                  
                  {/* Show a badge if this is the current user's rating */}
                  {rating.user_identifier === userId && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Your rating
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}; 