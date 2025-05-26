-- Add rating fields to ContentItem table
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS publication_eligible BOOLEAN DEFAULT FALSE;

-- Create ratings table
CREATE TABLE IF NOT EXISTS content_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  week_year INTEGER,
  UNIQUE(content_item_id, user_identifier, week_year)
);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_content_ratings_content_item ON content_ratings(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_ratings_week_year ON content_ratings(week_year);

-- Update week_year for existing rows
UPDATE content_ratings SET week_year = EXTRACT(WEEK FROM created_at)::INTEGER WHERE week_year IS NULL;

-- Create trigger function to update week_year on insert/update
CREATE OR REPLACE FUNCTION update_content_rating_week_year()
RETURNS TRIGGER AS $$
BEGIN
  NEW.week_year = EXTRACT(WEEK FROM NEW.created_at)::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_content_rating_week_year ON content_ratings;
CREATE TRIGGER set_content_rating_week_year
BEFORE INSERT OR UPDATE ON content_ratings
FOR EACH ROW
EXECUTE FUNCTION update_content_rating_week_year();

-- Create function to recalculate average rating for a content item
CREATE OR REPLACE FUNCTION recalculate_content_item_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_count INTEGER;
  affected_content_id UUID;
BEGIN
  -- Determine which content item was affected
  IF TG_OP = 'DELETE' THEN
    affected_content_id = OLD.content_item_id;
  ELSE
    affected_content_id = NEW.content_item_id;
  END IF;
  
  -- Calculate new average and count
  SELECT 
    COALESCE(AVG(rating)::DECIMAL(3,2), 0),
    COUNT(*)
  INTO 
    avg_rating,
    total_count
  FROM content_ratings
  WHERE content_item_id = affected_content_id;
  
  -- Update the content item
  UPDATE content_items 
  SET 
    average_rating = avg_rating,
    total_ratings = total_count,
    publication_eligible = (avg_rating >= 4.0 AND total_count >= 3)
  WHERE id = affected_content_id;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS update_content_item_rating ON content_ratings;
CREATE TRIGGER update_content_item_rating
AFTER INSERT OR UPDATE OR DELETE ON content_ratings
FOR EACH ROW
EXECUTE FUNCTION recalculate_content_item_rating(); 