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