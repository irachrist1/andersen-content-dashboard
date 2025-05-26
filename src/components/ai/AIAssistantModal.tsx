"use client";

import React, { useState, useEffect } from 'react';
import { ContentItem, Department, Platform } from '@/lib/database.types';
import { EnhancedContent } from '@/lib/aiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: Partial<ContentItem>;
  onContentGenerated: (content: Partial<ContentItem>) => void;
}

type AIAction = 'enhance' | 'ideas' | 'optimize' | 'hashtags';

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  initialContent,
  onContentGenerated,
}) => {
  const [activeAction, setActiveAction] = useState<AIAction>('enhance');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Results states
  const [enhancedContent, setEnhancedContent] = useState<EnhancedContent | null>(null);
  const [postIdeas, setPostIdeas] = useState<string[]>([]);
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('LinkedIn');

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveAction('enhance');
      setLoading(false);
      setError(null);
      setEnhancedContent(null);
      setPostIdeas([]);
      setOptimizedContent(null);
      setHashtags([]);
    }
  }, [isOpen]);

  const handleEnhanceContent = async () => {
    if (!initialContent.title || !initialContent.description) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending enhance content request...');
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: initialContent.title,
          description: initialContent.description,
          platforms: initialContent.platform || ['LinkedIn'],
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to enhance content';
        console.error('Error response from API:', data);
        
        // Check if it's a rate limit error
        if (errorMessage.includes('quota') || errorMessage.includes('Too Many Requests') || response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again in a few minutes.');
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('Received successful response from enhance content API');
      setEnhancedContent(data.enhancedContent);
    } catch (error) {
      console.error('Error enhancing content:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!initialContent.department) {
      setError('Department is required to generate ideas');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: initialContent.department,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ideas');
      }
      
      const data = await response.json();
      setPostIdeas(data.ideas);
    } catch (error) {
      console.error('Error generating ideas:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeContent = async () => {
    if (!initialContent.description) {
      setError('Description is required to optimize content');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/optimize-platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: initialContent.description,
          platform: selectedPlatform,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize content');
      }
      
      const data = await response.json();
      setOptimizedContent(data.optimizedContent);
    } catch (error) {
      console.error('Error optimizing content:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!initialContent.description) {
      setError('Description is required to generate hashtags');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: initialContent.description,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate hashtags');
      }
      
      const data = await response.json();
      setHashtags(data.hashtags);
    } catch (error) {
      console.error('Error generating hashtags:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyEnhancedContent = () => {
    if (!enhancedContent) return;
    
    const updatedContent: Partial<ContentItem> = {
      ...initialContent,
      title: enhancedContent.title,
      description: enhancedContent.description,
    };
    
    onContentGenerated(updatedContent);
    onClose();
  };

  const applyPostIdea = (idea: string) => {
    const updatedContent: Partial<ContentItem> = {
      ...initialContent,
      title: idea,
    };
    
    onContentGenerated(updatedContent);
    onClose();
  };

  const applyOptimizedContent = () => {
    if (!optimizedContent) return;
    
    const updatedContent: Partial<ContentItem> = {
      ...initialContent,
      description: optimizedContent,
    };
    
    onContentGenerated(updatedContent);
    onClose();
  };

  const applyHashtags = () => {
    if (!hashtags.length) return;
    
    // Append hashtags to the description
    const hashtagsText = hashtags.join(' ');
    const updatedDescription = initialContent.description + '\n\n' + hashtagsText;
    
    const updatedContent: Partial<ContentItem> = {
      ...initialContent,
      description: updatedDescription,
    };
    
    onContentGenerated(updatedContent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-brand-dark">
            AI Content Assistant <span className="text-xs font-normal bg-green-100 text-green-800 px-2 py-0.5 rounded-full ml-2">Gemini 2.5</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-4 border-b border-gray-200">
          <button
            onClick={() => setActiveAction('enhance')}
            className={`px-4 py-3 text-sm font-medium ${
              activeAction === 'enhance'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Enhance Content
          </button>
          <button
            onClick={() => setActiveAction('ideas')}
            className={`px-4 py-3 text-sm font-medium ${
              activeAction === 'ideas'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Ideas
          </button>
          <button
            onClick={() => setActiveAction('optimize')}
            className={`px-4 py-3 text-sm font-medium ${
              activeAction === 'optimize'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Optimize for Platform
          </button>
          <button
            onClick={() => setActiveAction('hashtags')}
            className={`px-4 py-3 text-sm font-medium ${
              activeAction === 'hashtags'
                ? 'border-b-2 border-brand-primary text-brand-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Hashtags
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Enhance Content Section */}
          {activeAction === 'enhance' && (
            <div>
              <p className="mb-4 text-gray-600">
                Enhance your content with AI suggestions. This will improve your title and description while keeping the original meaning.
              </p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Current Content:</h3>
                <div className="bg-gray-50 p-3 rounded-md mb-3">
                  <p className="font-medium">{initialContent.title}</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{initialContent.description}</p>
                </div>

                {!loading && !enhancedContent && (
                  <>
                    <button
                      onClick={handleEnhanceContent}
                      className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Enhance Content'}
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      Powered by Gemini 2.5 Flash. This API has rate limits - if you encounter errors, please try again in a few minutes.
                    </p>
                  </>
                )}
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
                </div>
              )}

              {enhancedContent && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Enhanced Content:</h3>
                  <div className="mb-3">
                    <p className="font-medium">{enhancedContent.title}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{enhancedContent.description}</p>
                  </div>
                  
                  {enhancedContent.hashtags && enhancedContent.hashtags.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Suggested Hashtags:</p>
                      <div className="flex flex-wrap gap-1">
                        {enhancedContent.hashtags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={applyEnhancedContent}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                  >
                    Apply Enhanced Content
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Generate Ideas Section */}
          {activeAction === 'ideas' && (
            <div>
              <p className="mb-4 text-gray-600">
                Generate new content ideas based on your department. These can be used as starting points for new posts.
              </p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Department:</h3>
                <p className="bg-gray-50 p-3 rounded-md mb-3">
                  {initialContent.department || 'No department selected'}
                </p>

                {!loading && postIdeas.length === 0 && (
                  <button
                    onClick={handleGenerateIdeas}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                    disabled={loading || !initialContent.department}
                  >
                    {loading ? 'Processing...' : 'Generate Ideas'}
                  </button>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Powered by Gemini 2.5 Flash. This API has rate limits - if you encounter errors, please try again in a few minutes.
                </p>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
                </div>
              )}

              {postIdeas.length > 0 && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Ideas:</h3>
                  <ul className="space-y-2">
                    {postIdeas.map((idea, index) => (
                      <li key={index} className="flex justify-between items-center p-2 hover:bg-green-100 rounded-md">
                        <span>{idea}</span>
                        <button
                          onClick={() => applyPostIdea(idea)}
                          className="ml-2 text-xs px-2 py-1 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                        >
                          Use
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Optimize for Platform Section */}
          {activeAction === 'optimize' && (
            <div>
              <p className="mb-4 text-gray-600">
                Optimize your content for a specific platform, considering character limits and best practices.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Platform:
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Website">Website</option>
                </select>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Current Content:</h3>
                <div className="bg-gray-50 p-3 rounded-md mb-3 whitespace-pre-wrap">
                  {initialContent.description || 'No content to optimize'}
                </div>

                {!loading && !optimizedContent && (
                  <button
                    onClick={handleOptimizeContent}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                    disabled={loading || !initialContent.description}
                  >
                    {loading ? 'Processing...' : 'Optimize for ' + selectedPlatform}
                  </button>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Powered by Gemini 2.5 Flash. This API has rate limits - if you encounter errors, please try again in a few minutes.
                </p>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
                </div>
              )}

              {optimizedContent && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Optimized for {selectedPlatform}:</h3>
                  <div className="mb-3 whitespace-pre-wrap">
                    {optimizedContent}
                  </div>
                  
                  <button
                    onClick={applyOptimizedContent}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                  >
                    Apply Optimized Content
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Generate Hashtags Section */}
          {activeAction === 'hashtags' && (
            <div>
              <p className="mb-4 text-gray-600">
                Generate relevant hashtags for your content to increase visibility.
              </p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Content for Hashtags:</h3>
                <div className="bg-gray-50 p-3 rounded-md mb-3 whitespace-pre-wrap">
                  {initialContent.description || 'No content to generate hashtags from'}
                </div>

                {!loading && hashtags.length === 0 && (
                  <button
                    onClick={handleGenerateHashtags}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                    disabled={loading || !initialContent.description}
                  >
                    {loading ? 'Processing...' : 'Generate Hashtags'}
                  </button>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Powered by Gemini 2.5 Flash. This API has rate limits - if you encounter errors, please try again in a few minutes.
                </p>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
                </div>
              )}

              {hashtags.length > 0 && (
                <div className="bg-green-50 p-4 rounded-md mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Generated Hashtags:</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hashtags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={applyHashtags}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors"
                  >
                    Add Hashtags to Content
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}; 