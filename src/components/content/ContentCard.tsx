"use client";

import React, { useState } from 'react';
import { ContentItem } from '@/lib/database.types';
import { useDraggable } from '@dnd-kit/core';
import { PreviewModal } from './PreviewModal';
import { PlatformBadge } from './PlatformBadge';
import { DepartmentBadge } from './DepartmentBadge';

interface ContentCardProps {
  item: ContentItem;
  onEdit: (id: string) => void;
  draggable?: boolean;
  isDragging?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  item, 
  onEdit, 
  draggable = true,
  isDragging = false 
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  // Set up draggable with custom activation
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    disabled: !draggable,
  });

  // Optimize transform for smoother motion with GPU acceleration
  const style = transform && !isDragging ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition: 'none',
    zIndex: 999,
    position: 'relative' as const,
    willChange: 'transform',
  } : undefined;

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewOpen(true);
  };

  return (
    <>
      <div 
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-2
          ${isDragging ? 'opacity-0' : 'hover:shadow-md'} 
          ${draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
          touch-none will-change-transform transition-all duration-200`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-brand-dark line-clamp-2 text-sm sm:text-base">{item.title}</h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(item.id);
            }}
            className="text-brand-medium hover:text-brand-dark transition-colors ml-2 flex-shrink-0 p-1 sm:p-0"
            aria-label="Edit content"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        
        <p className="text-xs sm:text-sm text-brand-medium mb-4 line-clamp-3">{item.description}</p>
        
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={item.platform} />
            {item.department && (
              <DepartmentBadge department={item.department} variant="compact" />
            )}
          </div>
          
          {item.status === 'Done' && (
            <div className="flex items-center text-xs text-brand-medium">
              {item.post_date && (
                <span className="mr-2 bg-brand-lightest px-2 py-0.5 rounded">
                  {new Date(item.post_date).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {item.status === 'Done' && item.post_url && (
        <div className="flex gap-2 mt-1 mb-3 justify-end">
          <button
            onClick={handlePreviewClick}
            className="text-brand-primary hover:text-brand-secondary text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors p-1 sm:p-0"
            aria-label="Preview post"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
          <a 
            href={item.post_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors p-1 sm:p-0"
            onClick={(e) => e.stopPropagation()}
          >
            View →
          </a>
        </div>
      )}

      {previewOpen && (
        <PreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          item={item}
        />
      )}
    </>
  );
}; 