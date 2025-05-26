-- Migration to add sort_order field for custom ordering within columns
-- Run this in your Supabase SQL Editor

-- Add sort_order column
ALTER TABLE content_items ADD COLUMN sort_order INTEGER;

-- Create index on sort_order for better performance when ordering
CREATE INDEX idx_content_items_sort_order ON content_items(status, sort_order);

-- Optional: Set initial sort_order values based on created_at
UPDATE content_items 
SET sort_order = subquery.row_num - 1
FROM (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) as row_num
  FROM content_items
) subquery
WHERE content_items.id = subquery.id; 