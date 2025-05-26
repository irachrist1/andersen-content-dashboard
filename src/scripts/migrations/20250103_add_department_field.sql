-- Migration: Add department field to content_items table
-- Date: 2025-01-03
-- Description: Add department tagging system to categorize content by business unit

-- Add department column to content_items table
ALTER TABLE content_items ADD COLUMN department TEXT;

-- Add constraint for valid department values
ALTER TABLE content_items ADD CONSTRAINT content_items_department_check 
  CHECK (department IN ('BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'));

-- Create index for efficient department filtering
CREATE INDEX idx_content_items_department ON content_items(department);

-- Update existing items with a default department (optional - can be removed if not needed)
-- UPDATE content_items SET department = 'Operations' WHERE department IS NULL; 