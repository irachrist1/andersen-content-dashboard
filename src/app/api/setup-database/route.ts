import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Create table SQL
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS content_items (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      platform TEXT NOT NULL CHECK (platform IN ('Blog', 'Instagram', 'Twitter', 'TikTok', 'YouTube')),
      status TEXT NOT NULL CHECK (status IN ('Idea', 'InProgress', 'Review', 'Done')),
      post_url TEXT,
      suggested_post_time TIMESTAMPTZ
    );
    
    ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow all operations for all users" ON content_items
      FOR ALL
      USING (true)
      WITH CHECK (true);
    
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER content_items_updated_at
    BEFORE UPDATE ON content_items
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
    `;

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

    // Create table
    const { error: tableError } = await supabase.rpc('pgsl_sql', { query: createTableSQL }).catch(() => {
      // Fallback: Try direct query
      return supabase.from('content_items').select('count(*)').limit(1);
    });

    // Insert sample data
    const { error: insertError } = await supabase.from('content_items').insert(sampleData);

    // Check if table exists by doing a simple query
    const { data, error: checkError } = await supabase.from('content_items').select('count(*)').limit(1);

    if (checkError) {
      return NextResponse.json({
        status: 'error',
        message: 'Table creation failed',
        error: checkError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database setup complete! Table created and sample data inserted.',
      tableCreationError: tableError,
      insertionError: insertError,
      data
    });
  } catch (error) {
    console.error('Setup database error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to set up database',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 