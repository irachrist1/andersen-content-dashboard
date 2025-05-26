import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ReorderRequest {
  items: Array<{
    id: string;
    sort_order: number;
  }>;
}

export async function PATCH(request: NextRequest) {
  try {
    const { items }: ReorderRequest = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    // Validate that all items have required fields
    for (const item of items) {
      if (!item.id || typeof item.sort_order !== 'number') {
        return NextResponse.json({ 
          error: 'Each item must have id and sort_order' 
        }, { status: 400 });
      }
    }

    // Update sort_order for all items in parallel for better performance
    const updatePromises = items.map(item => 
      supabase
        .from('content_items')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
        .select()
    );

    const results = await Promise.all(updatePromises);
    
    // Check for any errors
    for (const result of results) {
      if (result.error) {
        console.error('Supabase error during reorder:', result.error);
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }
    }

    const updatedItems = results
      .filter(result => result.data && result.data.length > 0)
      .map(result => result.data![0]);

    return NextResponse.json({ 
      message: 'Items reordered successfully',
      updated_items: updatedItems 
    });

  } catch (error) {
    console.error('Error reordering items:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
} 