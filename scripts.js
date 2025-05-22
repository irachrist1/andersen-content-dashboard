/**
 * This script creates the content_items table and loads sample data in Supabase
 * Run with: node scripts.js
 */

const { createClient } = require('@supabase/supabase-js');

// Credentials
const supabaseUrl = 'https://cqkiwwwskfiuwajmdcqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2l3d3dza2ZpdXdham1kY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTQzMzIsImV4cCI6MjA2MzQ5MDMzMn0.3-Q629wobpjOn_mQlRPwMPxHWMBs6EkE0v_Nt-mqslM';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL to create table
const createTableSql = `
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

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations for all users" ON content_items
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update the updated_at column
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

// Main function
async function setupDatabase() {
  try {
    console.log('Starting database setup...');
    
    // Step 1: Run SQL to create table
    console.log('Creating content_items table...');
    const { error: sqlError } = await supabase.rpc('pgsl_sql', { query: createTableSql });
    
    if (sqlError) {
      console.error('Error creating table:', sqlError);
      
      // Fallback: Try to directly insert data even if table creation fails
      // This might work if the table already exists but is empty
      console.log('Attempting to insert data even if table creation failed...');
    } else {
      console.log('Table created successfully!');
    }
    
    // Step 2: Insert sample data
    console.log('Inserting sample data...');
    const { data, error: insertError } = await supabase
      .from('content_items')
      .insert(sampleData)
      .select();
    
    if (insertError) {
      console.error('Error inserting sample data:', insertError);
      console.log('\n=========================================');
      console.log('IMPORTANT: You need to create the table manually.');
      console.log('Please go to the Supabase SQL Editor and run the SQL scripts from:');
      console.log('- src/scripts/createTable.sql');
      console.log('- src/scripts/seedData.sql');
      console.log('=========================================\n');
    } else {
      console.log('Sample data inserted successfully!');
      console.log(`Inserted ${data.length} content items.`);
    }
    
    console.log('Setup complete!');
  } catch (error) {
    console.error('Unexpected error during setup:', error.message);
  }
}

// Run the setup
setupDatabase(); 