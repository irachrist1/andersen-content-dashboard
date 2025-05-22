import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test connection
    const { data, error } = await supabase.from('content_items').select('count(*)');
    
    if (error) {
      if (error.code === '42P01') {
        // Table does not exist error
        return NextResponse.json({
          status: 'error',
          message: 'The content_items table does not exist in your Supabase database.',
          error: error.message,
          setup_instructions: {
            step1: 'Go to your Supabase project dashboard',
            step2: 'Click on "SQL Editor" in the left sidebar',
            step3: 'Create a new query',
            step4: 'Copy and paste the SQL script from src/scripts/createTable.sql',
            step5: 'Click "Run" to execute the script',
            step6: 'Create another query with the content from src/scripts/seedData.sql to load sample data',
          }
        }, { status: 500 });
      }
      
      // Other error
      return NextResponse.json({
        status: 'error',
        message: 'Error connecting to Supabase',
        error: error.message,
        details: error
      }, { status: 500 });
    }
    
    // Connection successful
    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to Supabase!',
      supabaseUrl: 'https://cqkiwwwskfiuwajmdcqh.supabase.co',
      tableExists: true,
      data
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error when connecting to Supabase',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
} 