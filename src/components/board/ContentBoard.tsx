"use client";

import React, { useState, useEffect, memo, useCallback } from 'react';
import { StatusColumn } from './StatusColumn';
import { ContentCard } from '../content/ContentCard';
import { ContentModal } from '../content/ContentModal';
import { ContentItem, Status } from '@/lib/database.types';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { toast, Toaster } from 'react-hot-toast';

// Memoized ContentCard for better performance
const MemoizedContentCard = memo(ContentCard);

export const ContentBoard: React.FC = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<ContentItem> | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Configure DnD sensors with optimized settings
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require a more deliberate movement to start dragging
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      // Require press delay to avoid accidental drags on touch devices
      activationConstraint: {
        delay: 100, // Short delay for initiating drag on touch
        tolerance: 5, // Allow 5px movement during delay
      },
    }),
    useSensor(PointerSensor, {
      // Fallback for devices supporting pointer events
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  // Custom drop animation options for smoother transitions
  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

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
        setContentItems(data || []);
      } catch (error) {
        console.error('Error fetching content items:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        toast.error('Failed to load content items');
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
    
    window.addEventListener('addContent', handleAddContent);
    
    return () => {
      window.removeEventListener('addContent', handleAddContent);
    };
  }, []);

  // Filter content items by status - memoized with useCallback
  const getItemsByStatus = useCallback((status: Status) => {
    const filteredItems = contentItems.filter(item => item.status === status);

    if (status === 'Done') {
      return filteredItems.sort((a, b) => {
        if (!a.post_date && !b.post_date) return 0; // both null, keep order
        if (!a.post_date) return 1; // a is null, b is not, so a is considered older/lesser
        if (!b.post_date) return -1; // b is null, a is not, so b is considered older/lesser
        return new Date(b.post_date).getTime() - new Date(a.post_date).getTime(); // Sort by date descending (newest first)
      });
    }

    // For other statuses, or if you want a default sort (e.g., by created_at or title)
    // you can add more conditions here. For now, it returns them as filtered.
    return filteredItems;
  }, [contentItems]);

  // Handle edit button click
  const handleEditItem = async (id: string) => {
    try {
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
      toast.error('Failed to load item for editing');
    }
  };

  // Handle modal save
  const handleSaveItem = async (item: Partial<ContentItem>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean up URL if present but empty
      if (item.post_url === '') {
        item.post_url = null;
      }
      
      // Add https:// to URL if it doesn't have a protocol
      if (item.post_url && !item.post_url.startsWith('http') && !item.post_url.startsWith('https')) {
        item.post_url = `https://${item.post_url}`;
      }

      // Ensure post_date is null if empty
      if (item.post_date === '') {
        item.post_date = null;
      }
      // Ensure target_date is null if empty
      if (item.target_date === '') {
        item.target_date = null;
      }
      
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
        toast.success('Content item created successfully');
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
          console.error('Server error response (PUT):', errorData);
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const updatedItem = await response.json();
        console.log('Updated item:', updatedItem);
        setContentItems(prev => 
          prev.map(i => (i.id === updatedItem.id ? updatedItem : i))
        );
        toast.success('Content item updated successfully');
      }
      
      // Close modal and reset current item
      setModalOpen(false);
      setCurrentItem(undefined);
    } catch (error) {
      console.error('Error saving content item:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error(error instanceof Error ? error.message : 'Failed to save content item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/content-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response (DELETE):', errorData);
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      // Remove the item from the state
      setContentItems(prev => prev.filter(item => item.id !== id));
      
      // Close modal and reset current item
      setModalOpen(false);
      setCurrentItem(undefined);
      
      toast.success('Content item deleted successfully');
    } catch (error) {
      console.error('Error deleting content item:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error(error instanceof Error ? error.message : 'Failed to delete content item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag start - optimized
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    // Add a class to the body to indicate dragging for global styling
    document.body.classList.add('is-dragging');
  }, []);

  // Handle drag end - optimized
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Remove dragging class
    document.body.classList.remove('is-dragging');
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id as string;
    const newStatus = over.id as Status;
    
    // Find the item that was dragged
    const draggedItem = contentItems.find(item => item.id === activeId);
    if (!draggedItem) {
      setActiveId(null);
      return;
    }
    
    // If the status is the same, do nothing
    if (draggedItem.status === newStatus) {
      setActiveId(null);
      return;
    }
    
    // Optimistically update the UI
    setContentItems(prev => prev.map(item => 
      item.id === activeId ? { ...item, status: newStatus } : item
    ));
    
    // Update the status in the backend
    try {
      setIsUpdatingStatus(true);
      
      const response = await fetch(`/api/content-items/${activeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...draggedItem,
          status: newStatus
        }),
      });
      
      if (!response.ok) {
        // Revert the optimistic update if the API call fails
        setContentItems(prev => prev.map(item => 
          item.id === activeId ? { ...item, status: draggedItem.status } : item
        ));
        
        throw new Error('Failed to update item status');
      }
      
      const updatedItem = await response.json();
      toast.success(`Moved to ${newStatus.replace(/([A-Z])/g, ' $1').trim()}`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    } finally {
      setActiveId(null);
      setIsUpdatingStatus(false);
    }
  }, [contentItems]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    // Reset active id and clean up
    setActiveId(null);
    document.body.classList.remove('is-dragging');
  }, []);

  // Get the active item for the drag overlay
  const activeItem = activeId 
    ? contentItems.find(item => item.id === activeId) 
    : null;

  // Render content items for each column - memoized for performance
  const renderItems = useCallback((status: Status) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500">Loading...</p>
        </div>
      );
    }
    
    const items = getItemsByStatus(status);
    
    return items.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-32 text-gray-400">
        <p>No content items</p>
      </div>
    ) : (
      items.map(item => (
        <MemoizedContentCard 
          key={item.id} 
          item={item} 
          onEdit={handleEditItem} 
          draggable={!isUpdatingStatus}
          isDragging={activeId === item.id}
        />
      ))
    );
  }, [isLoading, getItemsByStatus, handleEditItem, isUpdatingStatus, activeId]);

  // Render the board
  return (
    <div className="flex flex-col w-full pt-2 md:pt-3 mb-20">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-white shadow-md border border-gray-100 px-3 py-3 rounded-lg',
          duration: 3000,
          style: {
            maxWidth: '420px',
          },
          success: {
            iconTheme: {
              primary: '#AB0E1E',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#AB0E1E',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      
      {/* Mobile column navigation - fixed at the top */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-30 bg-white border-b border-gray-200 py-3 px-4 flex justify-between overflow-x-auto shadow-sm">
        <a href="#inbox" className="px-3 py-1.5 text-sm rounded-md whitespace-nowrap bg-gray-50 shadow-sm border border-gray-200 text-brand-dark font-medium">Inbox</a>
        <a href="#pending" className="px-3 py-1.5 text-sm rounded-md whitespace-nowrap bg-gray-50 shadow-sm border border-gray-200 text-brand-dark font-medium">Pending</a>
        <a href="#scheduled" className="px-3 py-1.5 text-sm rounded-md whitespace-nowrap bg-gray-50 shadow-sm border border-gray-200 text-brand-dark font-medium">Scheduled</a>
        <a href="#done" className="px-3 py-1.5 text-sm rounded-md whitespace-nowrap bg-gray-50 shadow-sm border border-gray-200 text-brand-dark font-medium">Done</a>
      </div>
      
      {/* Spacer for mobile to account for fixed navigation */}
      <div className="md:hidden h-16"></div>
      
      {isLoading && !contentItems.length ? (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-5rem)] p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-brand-medium">Loading content items...</p>
        </div>
      ) : error && !contentItems.length ? (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-5rem)] p-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 max-w-lg">
            <h3 className="font-medium mb-2">Error loading content</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-col lg:flex-row gap-4 p-4 pb-12">
            <StatusColumn 
              title="Inbox" 
              status="Inbox"
              items={getItemsByStatus('Inbox')}
              onEdit={handleEditItem}
              activeId={activeId}
              id="inbox"
            />
            <StatusColumn 
              title="Pending Review" 
              status="PendingReview"
              items={getItemsByStatus('PendingReview')}
              onEdit={handleEditItem}
              activeId={activeId}
              id="pending"
            />
            <StatusColumn 
              title="Scheduled" 
              status="Scheduled"
              items={getItemsByStatus('Scheduled')}
              onEdit={handleEditItem}
              activeId={activeId}
              id="scheduled"
            />
            <StatusColumn 
              title="Done" 
              status="Done"
              items={getItemsByStatus('Done')}
              onEdit={handleEditItem}
              activeId={activeId}
              id="done"
            />
          </div>

          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeId ? (
              <ContentCard 
                item={contentItems.find(item => item.id === activeId) as ContentItem} 
                onEdit={() => {}}
                draggable={false}
                isDragging={true}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        initialData={currentItem}
        mode={modalMode}
      />
    </div>
  );
};