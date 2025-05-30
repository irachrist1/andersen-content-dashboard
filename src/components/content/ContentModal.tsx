"use client";

import React, { useState, useEffect } from 'react';
import { ContentItem, Platform, Platforms, Status, Department } from '@/lib/database.types';
import { RatingDisplay } from '../rating/RatingDisplay';
import { AIAssistantModal } from '../ai/AIAssistantModal';
import { AIUsageAnalytics } from '../ai/AIUsageAnalytics';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contentItem: Partial<ContentItem>) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<ContentItem>;
  mode: 'add' | 'edit';
  userId?: string; // Add userId prop for rating functionality
}

const PLATFORM_OPTIONS: Platform[] = ['LinkedIn', 'Website'];
const STATUS_OPTIONS: Status[] = ['Inbox', 'PendingReview', 'Scheduled', 'Done'];
const DEPARTMENT_OPTIONS: Department[] = ['BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'];

export const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  mode,
  userId = 'anonymous' // Default to 'anonymous' if userId is not provided
}) => {
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'ratings'>('details');
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [isAIAnalyticsOpen, setIsAIAnalyticsOpen] = useState<boolean>(false);
  
  const getInitialFormData = (): Partial<ContentItem> => ({
    title: '',
    description: '',
    platform: ['LinkedIn'] as Platforms, // Default to LinkedIn only
    status: 'Inbox' as Status,
    post_url: '',
    suggested_post_time: '',
    post_date: '',
    target_date: '',
    department: undefined,
  });

  const [formData, setFormData] = useState<Partial<ContentItem>>(getInitialFormData());
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) { // Only update formData when modal is opening or initialData changes while open
      if (mode === 'edit' && initialData) {
        setFormData({
          ...getInitialFormData(), // Start with defaults to ensure all fields are present
          ...initialData,
          // Convert string platform to array if needed (for backward compatibility)
          platform: Array.isArray(initialData.platform) 
            ? initialData.platform 
            : initialData.platform ? [initialData.platform as Platform] : ['LinkedIn'],
          // Ensure date fields are empty strings if null/undefined for controlled inputs
          post_date: initialData.post_date || '',
          target_date: initialData.target_date || '',
          suggested_post_time: initialData.suggested_post_time || '',
          post_url: initialData.post_url || '',
          department: initialData.department || undefined,
        });
      } else if (mode === 'add') {
        setFormData(getInitialFormData());
      }
      setUrlError(null); // Reset URL error when modal opens/re-initializes
      setConfirmDelete(false); // Reset delete confirmation when modal opens
      setActiveTab('details'); // Reset to details tab when modal opens
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // If the field is post_url, validate the URL format
    if (name === 'post_url') {
      validateUrl(value);
    }
    
    // Handle department selection (convert empty string to undefined and cast to Department)
    if (name === 'department') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : value as Department }));
    } else {
    setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle platform checkbox changes
  const handlePlatformChange = (platform: Platform) => {
    setFormData(prev => {
      const currentPlatforms = Array.isArray(prev.platform) ? [...prev.platform] : [];
      
      // If platform is already selected, remove it, otherwise add it
      if (currentPlatforms.includes(platform)) {
        // Don't allow removing the last platform
        if (currentPlatforms.length === 1) return prev;
        return { ...prev, platform: currentPlatforms.filter(p => p !== platform) };
      } else {
        return { ...prev, platform: [...currentPlatforms, platform] };
      }
    });
  };

  const validateUrl = (url: string): boolean => {
    // If URL is empty, it's valid (not required)
    if (!url) {
      setUrlError(null);
      return true;
    }
    
    // Basic URL pattern matching
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    if (!urlPattern.test(url)) {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
      return false;
    }
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      setUrlError(null);
      return true;
    } catch (error) {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For Done status, validate URL if provided
    if (formData.status === 'Done' && formData.post_url) {
      if (!validateUrl(formData.post_url)) {
        return; // Don't submit if URL is invalid
      }
    }
    
    onSave(formData);
  };
  
  const handleAIContentGenerated = (updatedContent: Partial<ContentItem>) => {
    setFormData({
      ...formData,
      ...updatedContent
    });
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    if (onDelete && formData.id) {
      onDelete(formData.id);
    }
  };

  // Only render the main modal when it's open
  if (!isOpen) return null;

  return (
    <>
      {isAIAssistantOpen && (
        <AIAssistantModal 
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          initialContent={formData}
          onContentGenerated={handleAIContentGenerated}
        />
      )}
      
      {isAIAnalyticsOpen && (
        <AIUsageAnalytics
          isOpen={isAIAnalyticsOpen}
          onClose={() => setIsAIAnalyticsOpen(false)}
        />
      )}
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-brand-dark">
              {mode === 'add' ? 'Add New Content' : 'Edit Content'}
            </h2>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setIsAIAssistantOpen(true)}
                className="px-3 py-1 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors flex items-center text-sm"
                title="AI Assistant"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                  <path d="M16.5 7.5h-9v9h9v-9z" />
                  <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3a.75.75 0 010-1.5h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                </svg>
                AI Assistant
              </button>
              
              <button
                onClick={() => setIsAIAnalyticsOpen(true)}
                className="px-3 py-1 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors flex items-center text-sm"
                title="AI Usage Analytics"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
                </svg>
                Analytics
              </button>
            </div>
          </div>

          {/* Tabs - Only show in edit mode and when we have an ID */}
          {mode === 'edit' && formData.id && (
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'details'
                      ? 'border-b-2 border-brand-primary text-brand-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('ratings')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'ratings'
                      ? 'border-b-2 border-brand-primary text-brand-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ratings
                  {formData.total_ratings ? (
                    <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {formData.total_ratings}
                    </span>
                  ) : null}
                </button>
              </nav>
            </div>
          )}

          {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-5">
              <label htmlFor="title" className="block text-sm font-medium text-brand-dark mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>

            <div className="mb-5">
              <label htmlFor="description" className="block text-sm font-medium text-brand-dark mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  Platforms
                </label>
                <div className="space-y-2 mt-1">
                  {PLATFORM_OPTIONS.map(platform => (
                    <div key={platform} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`platform-${platform}`}
                        checked={Array.isArray(formData.platform) && formData.platform.includes(platform)}
                        onChange={() => handlePlatformChange(platform)}
                        className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary focus:ring-2"
                      />
                      <label htmlFor={`platform-${platform}`} className="ml-2 block text-sm text-gray-700">
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-brand-dark mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  required
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="department" className="block text-sm font-medium text-brand-dark mb-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department || ''}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">Select a department (optional)</option>
                {DEPARTMENT_OPTIONS.map(department => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-brand-medium">
                Tag this content with a specific business department
              </p>
            </div>

            <div className="mb-5">
              <label htmlFor="target_date" className="block text-sm font-medium text-brand-dark mb-1">
                Target Date
              </label>
              <input
                type="date"
                id="target_date"
                name="target_date"
                value={formData.target_date || ''}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              />
              <p className="mt-1 text-xs text-brand-medium">
                Set a target planning or publication date
              </p>
            </div>

            {formData.status === 'Done' && (
              <>
                <div className="mb-5">
                  <label htmlFor="post_date" className="block text-sm font-medium text-brand-dark mb-1">
                    Post Date
                  </label>
                  <input
                    type="date"
                    id="post_date"
                    name="post_date"
                    value={formData.post_date || ''}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  />
                  <p className="mt-1 text-xs text-brand-medium">
                    The date when this content was posted
                  </p>
                </div>
                
                <div className="mb-5">
                  <label htmlFor="post_url" className="block text-sm font-medium text-brand-dark mb-1">
                    Post URL
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="url"
                      id="post_url"
                      name="post_url"
                      value={formData.post_url || ''}
                      onChange={handleChange}
                      className={`w-full p-2.5 border ${urlError ? 'border-red-500 pr-10' : 'border-gray-300'} rounded-md focus:ring-brand-primary focus:border-brand-primary`}
                      placeholder="https://example.com/post"
                    />
                    {urlError ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : formData.post_url ? (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                  {urlError && (
                    <p className="mt-1 text-sm text-red-600">{urlError}</p>
                  )}
                  <p className="mt-1 text-xs text-brand-medium">
                    Add the full URL where this content is published
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-between space-x-3 mt-6 pt-4 border-t border-gray-100">
              {/* Show delete button only in edit mode */}
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`px-4 py-2 ${
                    confirmDelete 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
                >
                  {confirmDelete ? 'Confirm Delete' : 'Delete'}
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                  disabled={!!urlError}
                >
                  {mode === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
          ) : (
            <div className="p-6">
              {formData.id && (
                <RatingDisplay contentItem={formData as ContentItem} userId={userId} />
              )}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}; 