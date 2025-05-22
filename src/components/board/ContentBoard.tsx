"use client";

import React, { useState, useEffect } from 'react';
import { StatusColumn } from './StatusColumn';
import { ContentCard } from '../content/ContentCard';
import { ContentModal } from '../content/ContentModal';
import { ContentItem, Status } from '@/lib/database.types';

export const ContentBoard: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ContentItem> | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  // Fetch content items on component mount
  useEffect(() => {
    const fetchContentItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/content-items');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched content items:', data);
        setContentItems(data || []);
      } catch (error) {
        console.error('Error fetching content items:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentItems();
  }, []);

  // Set up event listener for the add content button
  useEffect(() => {
    const handleAddContent = () => {
      setCurrentItem(undefined);
      setModalMode('add');
      setModalOpen(true);
    };
    
    // Add event listener
    window.addEventListener('addContent', handleAddContent);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('addContent', handleAddContent);
    };
  }, []);

  // Filter content items by status
  const getItemsByStatus = (status: Status) => {
    return contentItems.filter(item => item.status === status);
  };

  // Handle edit button click
  const handleEditItem = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/content-items/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }
      
      const item = await response.json();
      setCurrentItem(item);
      setModalMode('edit');
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching content item for edit:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal save
  const handleSaveItem = async (item: Partial<ContentItem>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (modalMode === 'add') {
        // Create new item
        const response = await fetch('/api/content-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const newItem = await response.json();
        console.log('Created new item:', newItem);
        setContentItems(prev => [...prev, newItem]);
      } else {
        // Update existing item
        const response = await fetch(`/api/content-items/${item.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const updatedItem = await response.json();
        console.log('Updated item:', updatedItem);
        setContentItems(prev => 
          prev.map(i => (i.id === updatedItem.id ? updatedItem : i))
        );
      }
      
      // Close modal and reset current item
      setModalOpen(false);
      setCurrentItem(undefined);
    } catch (error) {
      console.error('Error saving content item:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mx-auto max-w-7xl p-4 mb-4 bg-red-50 border border-red-300 text-red-700 rounded">
          <h3 className="font-medium">Error:</h3> 
          <p>{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
          >
            Dismiss
          </button>
        </div>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto h-full">
        <StatusColumn status="Idea" title="Idea">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            getItemsByStatus('Idea').map(item => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onEdit={handleEditItem} 
              />
            ))
          )}
        </StatusColumn>
        
        <StatusColumn status="InProgress" title="In Progress">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            getItemsByStatus('InProgress').map(item => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onEdit={handleEditItem} 
              />
            ))
          )}
        </StatusColumn>
        
        <StatusColumn status="Review" title="Review">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            getItemsByStatus('Review').map(item => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onEdit={handleEditItem} 
              />
            ))
          )}
        </StatusColumn>
        
        <StatusColumn status="Done" title="Done">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            getItemsByStatus('Done').map(item => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onEdit={handleEditItem} 
              />
            ))
          )}
        </StatusColumn>
      </div>

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
        initialData={currentItem}
        mode={modalMode}
      />
    </>
  );
};