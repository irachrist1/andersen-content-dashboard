import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ContentItem, Platform } from '@/lib/database.types';

// Helper function to validate content item data
function validateContentItem(data: Partial<ContentItem>): string[] {
  const errors: string[] = [];
  
  if (!data.title) errors.push('Title is required');
  if (!data.description) errors.push('Description is required');
  
  // Validate platform as an array
  if (!data.platform || !Array.isArray(data.platform) || data.platform.length === 0) {
    errors.push('At least one platform must be selected');
  } else {
    // Check if all selected platforms are valid
    const validPlatforms: Platform[] = ['LinkedIn', 'Website'];
    const invalidPlatforms = data.platform.filter(p => !validPlatforms.includes(p as Platform));
    if (invalidPlatforms.length > 0) {
      errors.push(`Invalid platform(s): ${invalidPlatforms.join(', ')}. Valid options are: LinkedIn, Website`);
    }
  }
  
  if (!data.status || !['Inbox', 'PendingReview', 'Scheduled', 'Done'].includes(data.status)) {
    errors.push('Status must be one of: Inbox, PendingReview, Scheduled, Done');
  }
  
  return errors;
}

// GET handler to fetch all content items
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
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
      suggested_post_time: contentItem.suggested_post_time || null,
      post_date: contentItem.post_date || null,
      target_date: contentItem.target_date || null
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