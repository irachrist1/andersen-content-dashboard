-- Rollback: Remove department field from content_items table
-- Date: 2025-01-03
-- Description: Rollback department tagging system

-- Drop the index
DROP INDEX IF EXISTS idx_content_items_department;

-- Drop the constraint
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_department_check;

-- Drop the department column
ALTER TABLE content_items DROP COLUMN IF EXISTS department; 