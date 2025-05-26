"use client";

import React, { useState, useEffect, memo, useCallback } from 'react';
import { StatusColumn } from './StatusColumn';
import { ContentCard } from '../content/ContentCard';
import { ContentModal } from '../content/ContentModal';
import { DepartmentFilter } from './DepartmentFilter';
import { ContentItem, Status, Department } from '@/lib/database.types';
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
  DragOverEvent,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
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
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([]);

  // Configure DnD sensors with optimized settings for responsiveness
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Reduce movement required to start dragging for faster response
      activationConstraint: {
        distance: 3, // Reduced from 5px to 3px for faster activation
      },
    }),
    useSensor(TouchSensor, {
      // Reduce delay for faster touch response
      activationConstraint: {
        delay: 50, // Reduced from 100ms to 50ms for faster touch activation
        tolerance: 3, // Reduced tolerance for more precision
      },
    }),
    useSensor(PointerSensor, {
      // Fallback for devices supporting pointer events
      activationConstraint: {
        distance: 3, // Reduced from 5px to 3px
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

  // Filter content items by status and department - memoized with useCallback
  const getItemsByStatus = useCallback((status: Status) => {
    let filteredItems = contentItems.filter(item => item.status === status);

    // Apply department filter
    if (selectedDepartments.length > 0) {
      filteredItems = filteredItems.filter(item => 
        item.department && selectedDepartments.includes(item.department)
      );
    }

    if (status === 'Done') {
      return filteredItems.sort((a, b) => {
        // Sort by post_date descending (newest first)
        if (a.post_date && b.post_date) {
          const dateA = new Date(a.post_date).getTime();
          const dateB = new Date(b.post_date).getTime();
          if (dateA !== dateB) return dateB - dateA;
        } else if (a.post_date) {
          return -1; // a has date, b does not, a comes first (newer)
        } else if (b.post_date) {
          return 1;  // b has date, a does not, b comes first (newer)
        }
        // Fallback to sort_order if dates are the same or both null
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    }

    // For other statuses, sort by sort_order.
    return filteredItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [contentItems, selectedDepartments]);

  // Handle department filter change
  const handleDepartmentChange = useCallback((departments: Department[]) => {
    setSelectedDepartments(departments);
  }, []);

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
          console.error('Server error response:', errorData);
          throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const updatedItem = await response.json();
        console.log('Updated item:', updatedItem);
        setContentItems(prev => prev.map(existingItem => 
          existingItem.id === updatedItem.id ? updatedItem : existingItem
        ));
        toast.success('Content item updated successfully');
      }
      
      setModalOpen(false);
      setCurrentItem(undefined);
    } catch (error) {
      console.error('Error saving content item:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error(modalMode === 'add' ? 'Failed to create content item' : 'Failed to update content item');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/content-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      setContentItems(prev => prev.filter(item => item.id !== id));
      setModalOpen(false);
      setCurrentItem(undefined);
      toast.success('Content item deleted successfully');
    } catch (error) {
      console.error('Error deleting content item:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to delete content item');
    }
  };

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Add a class to body to disable scroll during drag
    document.body.classList.add('is-dragging');
  }, []);

  // Handle reorder within same column
  const handleReorder = async (items: ContentItem[]) => {
    // Calculate new sort orders with larger gaps to allow for future insertions
    const reorderData = items.map((item, index) => ({
      id: item.id,
      sort_order: (index + 1) * 1000 // Use larger intervals for sort_order
    }));

    // Optimistically update the UI immediately
    setContentItems(prev => {
      // Create a map for quick lookup of new sort_orders for items in the reordered column
      const newSortOrders = new Map<string, number>();
      items.forEach((item, index) => {
        newSortOrders.set(item.id, (index + 1) * 1000);
      });

      const updatedGlobalItems = prev.map(globalItem => {
        if (newSortOrders.has(globalItem.id)) {
          // This item was part of the reordered column, update its sort_order
          return { ...globalItem, sort_order: newSortOrders.get(globalItem.id)! };
        }
        return globalItem; // Item was not in the reordered column, keep its existing sort_order
      });

      // Now, sort the entire global list by the (potentially updated) sort_order
      // This ensures that getItemsByStatus receives a consistently sorted list
      return updatedGlobalItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    });

    // Make API call in background without blocking UI
    try {
      const response = await fetch('/api/content-items/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: reorderData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item order');
      }

      toast.success('Items reordered', { duration: 1500 });
    } catch (error) {
      console.error('Error reordering items:', error);
      
      // Revert optimistic update on error
      setContentItems(prev => {
        // When reverting, we need to reconstruct the original state of sort_orders
        // The 'items' parameter here is the reordered list *before* the failed API call,
        // which contains the items from the specific column that was attempted to be reordered.
        // The `prev` state is the optimistically updated state.
        // We need to find the original sort_orders for `items` from a stable source if possible,
        // or revert to a full fetch if it becomes too complex.
        // For now, a simple revert based on the `items` list (which holds pre-API call sort orders for *that column*)
        // and the `reorderData` (which holds the *intended* sort orders) might be insufficient.
        // A safer revert strategy might be to refetch or use a snapshot taken before optimistic update.
        // However, the current revert logic tries to find the 'originalItem' from the 'items' list.
        // 'items' here refers to the argument of handleReorder, which is the locally reordered list for the specific column.
        // This might not be correct, as `originalItem.sort_order` would be its order *within that column operation*, not globally.

        // Let's simplify the revert: if the API call fails, we should ideally revert to the state *before* this specific handleReorder call.
        // This is hard without storing a snapshot.
        // The current revert logic is:
        // setContentItems(prev => prev.map(item => {
        //   const originalItem = items.find(i => i.id === item.id); // 'items' is the reordered list for the specific column
        //   return originalItem ? { ...item, sort_order: originalItem.sort_order } : item;
        // }));
        // This tries to restore sort_order for items within the affected column using their order before the reorderData mapping.
        // This is probably the best we can do without a full snapshot/refetch.
        // For now, let's keep the existing revert logic structure but acknowledge its potential limitations.
        const originalSortOrdersSnapshot = new Map<string, number | null>();
        // We need a snapshot of sort orders *before* the optimistic update for items involved in `reorderData`.
        // This is tricky. The current `items.find` based rollback might be the most straightforward.
        // The `items` in `catch` refers to `items` passed to `handleReorder`.

        // To be robust, on error, we should refetch or rollback to a snapshot.
        // The provided rollback is:
        // setContentItems(prev => prev.map(item => {
        // const originalItem = items.find(i => i.id === item.id); // 'items' is the reordered list for specific column
        // return originalItem ? { ...item, sort_order: originalItem.sort_order } : item;
        // }));
        // This existing logic is attempting to use the sort_order from the `items` array passed to `handleReorder`.
        // This `items` array *is* the representation of the column *after* local drag but *before* new sort_orders were calculated by `reorderData`.
        // So each `item` in `items` still has its `sort_order` from *before* the current `handleReorder` operation modified it.
        // This seems to be a reasonable local rollback for the involved items.

        // Let's refine the rollback to be consistent with the optimistic update structure
        return prev.map(prevItem => {
          const itemInFailedReorder = items.find(i => i.id === prevItem.id);
          if (itemInFailedReorder) {
            // Revert to its sort_order as it was when passed to handleReorder
            return { ...prevItem, sort_order: itemInFailedReorder.sort_order };
          }
          return prevItem;
        }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)); // Also re-sort after rollback
      });
      
      toast.error('Failed to save new order. Reverted changes.');
    }
  };

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Remove dragging class from body
    document.body.classList.remove('is-dragging');
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const draggedItem = contentItems.find(item => item.id === activeId);
    
    if (!draggedItem) {
      setActiveId(null);
      return;
    }
    
    // Check if this is a status change (inter-column drag)
    const statusValues: Status[] = ['Inbox', 'PendingReview', 'Scheduled', 'Done'];
    const isStatusChange = statusValues.includes(overId as Status);

    if (isStatusChange) {
      // Handle status change (moving between columns)
      const newStatus = overId as Status;
      
    if (draggedItem.status === newStatus) {
      setActiveId(null);
      return;
    }
    
      // Optimistically update the UI before making API call
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
    } else {
      // Handle reordering within the same column (intra-column drag)
      const overItem = contentItems.find(item => item.id === overId);
      
      if (!overItem || draggedItem.id === overItem.id) {
        setActiveId(null);
        return;
      }
      
      // Only reorder if both items are in the same status column
      if (draggedItem.status === overItem.status) {
        const statusItems = getItemsByStatus(draggedItem.status);
        const reorderedItems = [...statusItems];
        
        // Find indices within the status column
        const oldIndex = reorderedItems.findIndex(item => item.id === draggedItem.id);
        const newIndex = reorderedItems.findIndex(item => item.id === overItem.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // Remove item from old position
          reorderedItems.splice(oldIndex, 1);
          // Insert at new position
          reorderedItems.splice(newIndex, 0, draggedItem);
          
          // Update the order
          handleReorder(reorderedItems);
        }
      }
      
      setActiveId(null);
    }
  }, [contentItems, getItemsByStatus]);

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
        <>
          {/* Department Filter */}
          <div className="px-4">
            <DepartmentFilter
              selectedDepartments={selectedDepartments}
              onDepartmentChange={handleDepartmentChange}
            />
          </div>

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
        </>
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