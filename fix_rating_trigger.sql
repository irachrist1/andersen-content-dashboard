-- Fix the rating trigger to handle DELETE operations properly
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