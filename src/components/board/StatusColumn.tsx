import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ContentItem, Status } from '@/lib/database.types';
import { SortableContentCard } from './SortableContentCard';
import { EmptyState } from './EmptyState';

interface StatusColumnProps {
  title: string;
  status: Status;
  items: ContentItem[];
  onEdit: (id: string) => void;
  activeId: string | null;
  id?: string;
}

export const StatusColumn: React.FC<StatusColumnProps> = ({ title, status, items, onEdit, activeId, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Sort items by sort_order, with fallback to created_at
  const sortedItems = [...items].sort((a, b) => {
    // If both have sort_order, use that
    if (a.sort_order !== null && b.sort_order !== null) {
      return (a.sort_order as number) - (b.sort_order as number);
    }
    // If only one has sort_order, prioritize it
    if (a.sort_order !== null) return -1;
    if (b.sort_order !== null) return 1;
    // Fallback to created_at
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const itemIds = sortedItems.map(item => item.id);

  return (
    <div 
      id={id}
      className={`w-full lg:w-72 flex-shrink-0 lg:flex-1 p-3 bg-gray-50 rounded-lg lg:mx-2 mb-6 lg:mb-0 first:lg:ml-0 last:lg:mr-0 scroll-mt-32
        ${isOver ? 'ring-2 ring-brand-primary ring-opacity-70 bg-brand-lightest bg-opacity-50' : ''}
        transition-colors duration-200 relative overflow-hidden`}
    >
      {/* Desktop-only sticky header with gradient */}
      <div className="hidden lg:block sticky top-4 pt-1 -mt-1 -mx-3 px-3 pb-4 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 from-70% via-gray-50 to-transparent z-10"></div>
        <h2 className="font-semibold text-brand-dark py-2 px-3 mb-4 border-b border-gray-200 bg-gray-50 relative z-20">
          {title}
          <span className="ml-2 bg-gray-100 text-brand-medium px-2 py-0.5 rounded-full text-xs">
            {items.length}
          </span>
        </h2>
      </div>
      
      {/* Mobile non-sticky plain header */}
      <div className="lg:hidden -mx-3 px-3 pb-4">
        <div className="py-2 px-3 mb-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-brand-dark">
            {title}
            <span className="ml-2 bg-gray-100 text-brand-medium px-2 py-0.5 rounded-full text-xs">
              {items.length}
            </span>
          </h2>
        </div>
      </div>

      <div ref={setNodeRef} className="space-y-3">
        {sortedItems.length === 0 ? (
          <EmptyState 
            message="No content items" 
            subMessage="Drag items here or add new content" 
          />
        ) : (
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {sortedItems.map((item) => (
              <SortableContentCard 
                key={item.id} 
                item={item} 
                onEdit={onEdit} 
                isDragging={activeId === item.id}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}; 