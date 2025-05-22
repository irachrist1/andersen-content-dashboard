"use client";

import React from 'react';
import { ContentItem, Platform } from '@/lib/database.types';

interface ContentCardProps {
  item: ContentItem;
  onEdit: (id: string) => void;
}

// Platform badge colors
const platformColors: Record<Platform, string> = {
  Blog: 'bg-purple-100 text-purple-800',
  Instagram: 'bg-pink-100 text-pink-800',
  Twitter: 'bg-blue-100 text-blue-800',
  TikTok: 'bg-black text-white',
  YouTube: 'bg-red-100 text-red-800',
};

export const ContentCard: React.FC<ContentCardProps> = ({ item, onEdit }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
        <button
          onClick={() => onEdit(item.id)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Edit content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.description}</p>
      
      <div className="flex justify-between items-center">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${platformColors[item.platform]}`}>
          {item.platform}
        </span>
        
        {item.status === 'Done' && item.post_url && (
          <a 
            href={item.post_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Post →
          </a>
        )}
      </div>
    </div>
  );
}; 