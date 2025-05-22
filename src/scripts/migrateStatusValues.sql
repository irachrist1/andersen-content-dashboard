-- First, drop the existing status constraint
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_status_check;

-- Add post_date column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'content_items' AND column_name = 'post_date'
    ) THEN
        ALTER TABLE content_items ADD COLUMN post_date DATE;
    END IF;
END $$;

-- Update existing status values
UPDATE content_items SET status = 'Inbox' WHERE status = 'Idea';
UPDATE content_items SET status = 'PendingReview' WHERE status = 'InProgress';
UPDATE content_items SET status = 'Scheduled' WHERE status = 'Review';

-- Add the new status constraint
ALTER TABLE content_items ADD CONSTRAINT content_items_status_check 
    CHECK (status IN ('Inbox', 'PendingReview', 'Scheduled', 'Done'));

-- Empty the existing data (if needed)
-- TRUNCATE TABLE content_items; 