"use client";

import React, { useState, useEffect } from 'react';
import { ContentItem } from '@/lib/database.types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ContentItem;
}

// Mock metadata extraction since we don't have a real API to fetch metadata
const getUrlMetadata = (url: string, platform: string) => {
  // In a real app, you would use an API like Open Graph or a server endpoint
  // to fetch actual metadata from the URL
  
  // Mock data based on platform and URL
  if (url.includes('youtube') || url.includes('youtu.be')) {
    return {
      title: 'YouTube Video',
      description: 'This is a video hosted on YouTube',
      image: 'https://i.ytimg.com/vi/cVA-9JHwbFY/maxresdefault.jpg',
      site: 'YouTube'
    };
  } else if (url.includes('twitter') || url.includes('x.com')) {
    return {
      title: 'Twitter Post',
      description: 'Twitter/X post with the latest updates and news',
      image: 'https://abs.twimg.com/responsive-web/client-web/twitter-icon-ios.c4bf472c.png',
      site: 'Twitter'
    };
  } else if (url.includes('instagram')) {
    return {
      title: 'Instagram Post',
      description: 'Beautiful imagery shared on Instagram',
      image: 'https://www.instagram.com/static/images/ico/favicon-200.png/ab6eff595bb1.png',
      site: 'Instagram'
    };
  } else if (url.includes('blog') || platform === 'Blog') {
    return {
      title: 'Blog Article',
      description: 'Interesting article with insights and information',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
      site: 'Blog'
    };
  } else {
    return {
      title: 'Web Content',
      description: 'Content published on the web',
      image: 'https://images.unsplash.com/photo-1557682250-f6086caa974f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1429&q=80',
      site: 'Website'
    };
  }
};

export const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (isOpen && item.post_url) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        setTimeout(() => {
          const data = getUrlMetadata(item.post_url || '', item.platform);
          setMetadata(data);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load preview');
        setIsLoading(false);
      }
    }
  }, [isOpen, item.post_url, item.platform]);

  if (!isOpen || !item.post_url) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-brand-dark">
            Content Preview
          </h2>
          <button 
            onClick={onClose}
            className="text-brand-medium hover:text-brand-dark transition-colors"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
              <p className="mt-4 text-brand-medium text-sm">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
              <p className="mt-2 text-sm">
                <a 
                  href={item.post_url} 
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                >
                  Open the link directly instead →
                </a>
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              {/* Link preview card similar to what you see in messaging apps */}
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img 
                  src={metadata?.image} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80';
                  }}
                />
              </div>
              
              <div className="p-5">
                <h3 className="font-semibold text-lg text-brand-dark">{item.title}</h3>
                <p className="text-brand-medium mt-2">{item.description}</p>
                
                <div className="flex items-center mt-4 text-sm text-brand-medium">
                  <span className="font-medium">{metadata?.site || item.platform}</span>
                  <span className="mx-2">•</span>
                  <a 
                    href={item.post_url} 
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 truncate transition-colors"
                  >
                    {item.post_url}
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <a 
              href={item.post_url} 
              target="_blank"
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary inline-flex items-center gap-1 transition-colors"
            >
              Visit {item.platform}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}; 