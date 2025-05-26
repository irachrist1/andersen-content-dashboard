"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContentItem } from '@/lib/database.types';
import { ContentCard } from '../content/ContentCard';

interface SortableContentCardProps {
  item: ContentItem;
  onEdit: (id: string) => void;
  isDragging?: boolean;
}

export const SortableContentCard: React.FC<SortableContentCardProps> = ({ 
  item, 
  onEdit, 
  isDragging = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    opacity: isDragging || isSortableDragging ? 0.8 : 1,
    zIndex: isDragging || isSortableDragging ? 999 : 1,
    position: 'relative' as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative
        ${isDragging || isSortableDragging 
          ? 'cursor-grabbing shadow-lg scale-[1.02] bg-white ring-2 ring-brand-red/20' 
          : 'cursor-grab hover:shadow-md hover:scale-[1.01]'
        } 
        transition-all duration-200 ease-out
        before:absolute before:inset-0 before:z-[-1] before:bg-white before:rounded-lg
        ${isDragging || isSortableDragging ? 'before:shadow-xl' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <ContentCard 
        item={item} 
        onEdit={onEdit} 
        draggable={false}
        isDragging={isDragging || isSortableDragging}
      />
    </div>
  );
}; 