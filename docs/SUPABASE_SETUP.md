# Supabase Setup for ContentFlow

This guide provides instructions for setting up Supabase for the ContentFlow application.

## Step 1: Environment Variables Setup

Create a `.env.local` file at the root of your project with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=https://cqkiwwwskfiuwajmdcqh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2l3d3dza2ZpdXdham1kY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTQzMzIsImV4cCI6MjA2MzQ5MDMzMn0.3-Q629wobpjOn_mQlRPwMPxHWMBs6EkE0v_Nt-mqslM
```

## Step 2: Database Table Setup

Use the SQL Editor in the Supabase dashboard to execute the following SQL script to create the required table:

```sql
-- Create content_items table
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
```

## Step 3: Load Sample Data (Optional)

After creating the table, you can load some sample content items using this SQL script:

```sql
-- Sample data for content_items table
INSERT INTO content_items (title, description, platform, status)
VALUES 
  ('How to Start a Blog', 'A comprehensive guide for beginners on starting their first blog.', 'Blog', 'Idea'),
  ('10 Tips for Better Photography', 'Essential tips to improve your Instagram photography skills.', 'Instagram', 'Idea'),
  ('Trending Tech News', 'A roundup of the latest technology news and updates.', 'Twitter', 'Idea'),
  
  ('Social Media Marketing Trends 2023', 'Analysis of the top social media marketing trends for 2023.', 'Blog', 'InProgress'),
  ('Behind the Scenes Office Tour', 'A walkthrough of our office space and team.', 'TikTok', 'InProgress'),
  ('Product Launch Announcement', 'Teaser for our upcoming product launch next month.', 'Instagram', 'InProgress'),
  
  ('Summer Fashion Lookbook', 'Showcasing our summer fashion collection with styling tips.', 'YouTube', 'Review'),
  ('Customer Success Stories', 'Interviews with customers about their success with our products.', 'Blog', 'Review'),
  ('Quick Tutorial: New Features', 'A quick tutorial on how to use our newest features.', 'TikTok', 'Review'),
  
  ('Annual Industry Report', 'Complete breakdown of industry statistics and trends for the past year.', 'Blog', 'Done'),
  ('Holiday Gift Guide', 'Curated selection of holiday gift ideas for different budgets.', 'Instagram', 'Done'),
  ('Product Demo Video', 'Detailed demonstration of our flagship product.', 'YouTube', 'Done');

-- Add URLs to "Done" items
UPDATE content_items 
SET post_url = 'https://example.com/blog/annual-industry-report'
WHERE title = 'Annual Industry Report';

UPDATE content_items 
SET post_url = 'https://instagram.com/p/example-holiday-gift-guide'
WHERE title = 'Holiday Gift Guide';

UPDATE content_items 
SET post_url = 'https://youtube.com/watch?v=example-product-demo'
WHERE title = 'Product Demo Video';
```

## Step 4: How to Run the SQL Scripts

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh)
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the SQL scripts from either Step 2 (to create the table) or Step 3 (to load sample data)
5. Click "Run" to execute the script

## Step 5: Test the Setup

To test if your Supabase setup is working:

1. Run the application: `pnpm dev`
2. Check if sample content items appear in the respective columns (if you loaded sample data)
3. Create a new content item via the "Add Content" button
4. Verify in the Supabase dashboard that the data was saved properly in the `content_items` table

## Troubleshooting

If you encounter any issues:

1. Make sure your `.env.local` file is correctly set up with the Supabase URL and anon key
2. Check that the `content_items` table exists in your Supabase database
3. Verify that Row Level Security policies are correctly configured
4. Look at the browser console or server logs for any specific error messages
5. Make sure you've executed the SQL scripts correctly in the Supabase SQL Editor

For further assistance, refer to the [Supabase documentation](https://supabase.com/docs/guides/getting-started). 