import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Create direct Supabase client with admin rights
    const supabaseAdmin = createClient(
      'https://cqkiwwwskfiuwajmdcqh.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2l3d3dza2ZpdXdham1kY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTQzMzIsImV4cCI6MjA2MzQ5MDMzMn0.3-Q629wobpjOn_mQlRPwMPxHWMBs6EkE0v_Nt-mqslM',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Starting department field migration...');

    // Test if we can add a department field by doing a safe update first
    try {
      // Try to select from content_items with department field to check if it exists
      const { data, error } = await supabaseAdmin
        .from('content_items')
        .select('department')
        .limit(1);

      if (!error) {
        console.log('Department column already exists, skipping migration');
        return NextResponse.json({ 
          message: 'Department field already exists, migration skipped',
          success: true 
        });
      }
    } catch (err) {
      // Column doesn't exist, continue with migration
      console.log('Department column does not exist, proceeding with migration...');
    }

    // Since we can't use DDL directly through Supabase client, 
    // we'll create a test entry to verify the field exists
    console.log('Note: Database schema changes need to be applied manually.');
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log(`
-- Add department column to content_items table
ALTER TABLE content_items ADD COLUMN department TEXT;

-- Add constraint for valid department values
ALTER TABLE content_items ADD CONSTRAINT content_items_department_check 
  CHECK (department IN ('BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'));

-- Create index for efficient department filtering
CREATE INDEX idx_content_items_department ON content_items(department);
    `);

    return NextResponse.json({ 
      message: 'Department field migration instructions provided',
      success: true,
      action_required: 'Please run the provided SQL script in your Supabase SQL editor',
      sql_script: `
-- Add department column to content_items table
ALTER TABLE content_items ADD COLUMN department TEXT;

-- Add constraint for valid department values
ALTER TABLE content_items ADD CONSTRAINT content_items_department_check 
  CHECK (department IN ('BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'));

-- Create index for efficient department filtering
CREATE INDEX idx_content_items_department ON content_items(department);
      `
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 