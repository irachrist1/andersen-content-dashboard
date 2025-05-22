import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
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

    // Direct queries to create table (without needing RPC)
    // const _tableExistsQuery = `
    //   SELECT EXISTS (
    //     SELECT FROM information_schema.tables 
    //     WHERE table_schema = 'public'
    //     AND table_name = 'content_items'
    //   );
    // `;

    // Check if table exists first
    // const { data: _tableCheck, error: _checkError } = await supabaseAdmin
    //   .from('_content_items_check')
    //   .select('*')
    //   .limit(1)
    //   .catch(() => ({ data: null, error: null }));

    // Because we don't have direct SQL execution without RPC, let's create the table using data API
    // Step 1: Create the table if it doesn't exist
    const { error: initialInsertError } = await supabaseAdmin
      .from('content_items')
      .insert([{ 
        title: 'Setup Row', 
        description: 'This is a setup row that will be replaced', 
        platform: 'Blog', 
        status: 'Idea' 
      }])
      .select()
      .limit(1);

    if (initialInsertError) {
      // Log the error, but proceed, as the table might still be created by this attempt
      // or subsequent operations will handle it.
      console.warn('Initial setup row insert failed (table might not exist yet):', initialInsertError.message);
    }

    // Sample data
    const sampleData = [
      {
        title: 'How to Start a Blog',
        description: 'A comprehensive guide for beginners on starting their first blog.',
        platform: 'Blog',
        status: 'Idea',
      },
      {
        title: '10 Tips for Better Photography',
        description: 'Essential tips to improve your Instagram photography skills.',
        platform: 'Instagram',
        status: 'Idea',
      },
      {
        title: 'Trending Tech News',
        description: 'A roundup of the latest technology news and updates.',
        platform: 'Twitter',
        status: 'Idea',
      },
      {
        title: 'Social Media Marketing Trends 2023',
        description: 'Analysis of the top social media marketing trends for 2023.',
        platform: 'Blog',
        status: 'InProgress',
      },
      {
        title: 'Behind the Scenes Office Tour',
        description: 'A walkthrough of our office space and team.',
        platform: 'TikTok',
        status: 'InProgress',
      },
      {
        title: 'Product Launch Announcement',
        description: 'Teaser for our upcoming product launch next month.',
        platform: 'Instagram',
        status: 'InProgress',
      },
      {
        title: 'Summer Fashion Lookbook',
        description: 'Showcasing our summer fashion collection with styling tips.',
        platform: 'YouTube',
        status: 'Review',
      },
      {
        title: 'Customer Success Stories',
        description: 'Interviews with customers about their success with our products.',
        platform: 'Blog',
        status: 'Review',
      },
      {
        title: 'Quick Tutorial: New Features',
        description: 'A quick tutorial on how to use our newest features.',
        platform: 'TikTok',
        status: 'Review',
      },
      {
        title: 'Annual Industry Report',
        description: 'Complete breakdown of industry statistics and trends for the past year.',
        platform: 'Blog',
        status: 'Done',
        post_url: 'https://example.com/blog/annual-industry-report',
      },
      {
        title: 'Holiday Gift Guide',
        description: 'Curated selection of holiday gift ideas for different budgets.',
        platform: 'Instagram',
        status: 'Done',
        post_url: 'https://instagram.com/p/example-holiday-gift-guide',
      },
      {
        title: 'Product Demo Video',
        description: 'Detailed demonstration of our flagship product.',
        platform: 'YouTube',
        status: 'Done',
        post_url: 'https://youtube.com/watch?v=example-product-demo',
      },
    ];

    // Insert sample data
    let dataInserted = false;
    const { error: insertError } = await supabaseAdmin.from('content_items').insert(sampleData);
    if (!insertError) {
      dataInserted = true;
    }

    // Check if we can query the table now
    const { data: confirmData, error: confirmError } = await supabaseAdmin
      .from('content_items')
      .select('count(*)')
      .limit(1);

    return NextResponse.json({
      status: confirmError ? 'error' : 'success',
      message: confirmError 
        ? 'Failed to create database table. Please run the SQL manually in Supabase SQL Editor.' 
        : 'Database created and sample data loaded! Please reload the main page to see the content.',
      tableExists: !confirmError,
      dataInserted,
      error: confirmError ? confirmError.message : null,
      data: confirmData,
      setupUrl: 'https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh/sql'
    });
  } catch (error) {
    console.error('Direct setup error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to set up database',
      error: error instanceof Error ? error.message : String(error),
      setupUrl: 'https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh/sql'
    }, { status: 500 });
  }
} 