import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ContentItem } from '@/lib/database.types';

// Helper to validate content item data
function validateContentItem(data: Partial<ContentItem>): string[] {
  const errors: string[] = [];
  
  if (!data.title) errors.push('Title is required');
  if (!data.description) errors.push('Description is required');
  
  if (!data.platform || !['LinkedIn', 'Website'].includes(data.platform)) {
    errors.push('Platform must be one of: LinkedIn, Website');
  }
  
  if (!data.status || !['Inbox', 'PendingReview', 'Scheduled', 'Done'].includes(data.status)) {
    errors.push('Status must be one of: Inbox, PendingReview, Scheduled, Done');
  }
  
  return errors;
}

// Helper to check if a UUID is valid
function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// GET /api/content-items/[id] - Retrieve a specific content item
export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const id = params.id;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// PUT /api/content-items/[id] - Update a specific content item
export async function PUT(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const id = params.id;
    const contentItem = await request.json();
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Validate input data
    const validationErrors = validateContentItem(contentItem);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }
    
    // Sanitize input data by only allowing specific fields
    const sanitizedItem = {
      title: contentItem.title,
      description: contentItem.description,
      platform: contentItem.platform,
      status: contentItem.status,
      post_url: contentItem.post_url || null,
      suggested_post_time: contentItem.suggested_post_time || null,
      post_date: contentItem.post_date || null,
      target_date: contentItem.target_date || null
    };
    
    // Update the content item
    const { data, error } = await supabase
      .from('content_items')
      .update(sanitizedItem)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
      }
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE /api/content-items/[id] - Delete a specific content item
export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const id = params.id;
    
    // Validate UUID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    // Check if the item exists first
    const { error: checkError } = await supabase
      .from('content_items')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }
    
    // Delete the item
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Content item deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 