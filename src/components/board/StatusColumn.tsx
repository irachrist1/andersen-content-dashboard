import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ContentItem, Status } from '@/lib/database.types';
import { ContentCard } from '../content/ContentCard';
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

  return (
    <div 
      id={id}
      className={`w-full lg:w-72 flex-shrink-0 lg:flex-1 min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-8rem)] p-3 bg-gray-50 rounded-lg lg:mx-2 mb-6 lg:mb-0 first:lg:ml-0 last:lg:mr-0 scroll-mt-28
        ${isOver ? 'ring-2 ring-brand-primary ring-opacity-70 bg-brand-lightest bg-opacity-50' : ''}
        transition-colors duration-200 relative`}
    >
      <div className="sticky top-0 pt-1 -mt-1 -mx-3 px-3 pb-4 z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent z-10"></div>
        <h2 className="font-semibold text-brand-dark py-2 px-3 mb-4 border-b border-gray-200 bg-gray-50 relative z-20">
          {title}
          <span className="ml-2 bg-gray-100 text-brand-medium px-2 py-0.5 rounded-full text-xs">
            {items.length}
          </span>
        </h2>
      </div>

      <div ref={setNodeRef} className="space-y-3">
        {items.length === 0 ? (
          <EmptyState 
            message="No content items" 
            subMessage="Drag items here or add new content" 
          />
        ) : (
          <>
            {items.map((item) => (
              <ContentCard 
                key={item.id} 
                item={item} 
                onEdit={onEdit} 
                isDragging={activeId === item.id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}; 