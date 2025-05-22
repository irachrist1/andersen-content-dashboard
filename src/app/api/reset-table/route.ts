import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Sample data - same as in other routes
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

    // Step 1: Delete all content items if the table exists
    const { error: _deleteError } = await supabase
      .from('content_items')
      .delete()
      .not('id', 'is', null); // This will delete all rows
    
    // Step 2: Insert the sample data
    const { data: insertData, error: insertError } = await supabase
      .from('content_items')
      .insert(sampleData)
      .select();
    
    if (insertError) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not reset table data. Table may not exist.',
        error: insertError.message,
        instructions: 'Go to https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh/sql and run the SQL from src/scripts/createTable.sql'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Table reset successfully! Sample data inserted.',
      data: {
        rowsInserted: insertData?.length || 0
      }
    });
  } catch (error) {
    console.error('Reset table error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to reset table',
      error: error instanceof Error ? error.message : String(error),
      setupUrl: 'https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh/sql'
    }, { status: 500 });
  }
} 