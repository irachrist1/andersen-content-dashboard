-- Rollback script for sort_order field migration
-- Run this if you need to revert the sort_order changes

-- Drop the index
DROP INDEX IF EXISTS idx_content_items_sort_order;

-- Remove the sort_order column
ALTER TABLE content_items DROP COLUMN IF EXISTS sort_order; 