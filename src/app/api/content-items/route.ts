import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper function to validate content item data
function validateContentItem(data: any) {
  const errors = [];
  
  if (!data.title) errors.push('Title is required');
  if (!data.description) errors.push('Description is required');
  
  if (!data.platform || !['Blog', 'Instagram', 'Twitter', 'TikTok', 'YouTube'].includes(data.platform)) {
    errors.push('Platform must be one of: Blog, Instagram, Twitter, TikTok, YouTube');
  }
  
  if (!data.status || !['Idea', 'InProgress', 'Review', 'Done'].includes(data.status)) {
    errors.push('Status must be one of: Idea, InProgress, Review, Done');
  }
  
  return errors;
}

// GET handler to fetch all content items
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST handler to create a new content item
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const contentItem = await request.json();
    
    // Validate input
    const validationErrors = validateContentItem(contentItem);
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }
    
    // Sanitize input by only including allowed fields
    const sanitizedItem = {
      title: contentItem.title,
      description: contentItem.description,
      platform: contentItem.platform,
      status: contentItem.status,
      post_url: contentItem.post_url || null,
      suggested_post_time: contentItem.suggested_post_time || null
    };
    
    // Insert data
    const { data, error } = await supabase
      .from('content_items')
      .insert([sanitizedItem])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 