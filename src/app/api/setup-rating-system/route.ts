import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Fix the rating trigger to handle DELETE operations properly
    const triggerSQL = `
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
    `;

    // Execute the trigger fix
    const { error: triggerError } = await supabase.rpc('pgsl_sql', { query: triggerSQL });
    
    if (triggerError) {
      console.error('Error updating trigger:', triggerError);
    }

    // Now recalculate all existing ratings
    const recalculateSQL = `
      -- Recalculate all content item ratings
      UPDATE content_items 
      SET 
        average_rating = subq.avg_rating,
        total_ratings = subq.total_count,
        publication_eligible = (subq.avg_rating >= 4.0 AND subq.total_count >= 3)
      FROM (
        SELECT 
          ci.id,
          COALESCE(AVG(cr.rating)::DECIMAL(3,2), 0) as avg_rating,
          COUNT(cr.rating) as total_count
        FROM content_items ci
        LEFT JOIN content_ratings cr ON ci.id = cr.content_item_id
        GROUP BY ci.id
      ) as subq
      WHERE content_items.id = subq.id;
    `;

    const { error: recalcError } = await supabase.rpc('pgsl_sql', { query: recalculateSQL });
    
    if (recalcError) {
      console.error('Error recalculating ratings:', recalcError);
    }

    return NextResponse.json({ 
      message: 'Rating system trigger fixed and ratings recalculated successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}