-- Drop triggers first
DROP TRIGGER IF EXISTS update_content_item_ratings_trigger ON content_ratings;
DROP TRIGGER IF EXISTS handle_rating_deletion_trigger ON content_ratings;

-- Drop functions
DROP FUNCTION IF EXISTS update_content_item_ratings();
DROP FUNCTION IF EXISTS handle_rating_deletion();

-- Drop indexes
DROP INDEX IF EXISTS idx_content_ratings_week;
DROP INDEX IF EXISTS idx_content_ratings_content_item;

-- Drop the content_ratings table
DROP TABLE IF EXISTS content_ratings;

-- Remove rating fields from content_items table
ALTER TABLE content_items DROP COLUMN IF EXISTS average_rating;
ALTER TABLE content_items DROP COLUMN IF EXISTS total_ratings;
ALTER TABLE content_items DROP COLUMN IF EXISTS publication_eligible; 