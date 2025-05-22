-- Clear existing data
TRUNCATE TABLE content_items;

-- Populate "Pending Review" items
INSERT INTO content_items (title, description, platform, status)
VALUES 
  ('Claude''s IFRS piece', 'Detailed analysis of International Financial Reporting Standards relevant to the Rwanda market.', 'LinkedIn', 'PendingReview'),
  ('Ruth''s IFRS piece', 'Exploration of IFRS implementation challenges and solutions for businesses in East Africa.', 'LinkedIn', 'PendingReview'),
  ('Norman''s IFRS piece', 'Overview of recent changes to IFRS standards and their impact on Rwandan companies.', 'LinkedIn', 'PendingReview'),
  ('Hajara''s article', 'Upcoming article on finance and accounting trends in Rwanda - topic to be confirmed.', 'LinkedIn', 'PendingReview');

-- Populate "Scheduled" items
INSERT INTO content_items (title, description, platform, status, suggested_post_time)
VALUES 
  ('May Office Highlights Post', 'Feature images/mentions of: pottery coffee visit, Andersen Africa New Managers School hosted in Kigali, talk with KIFC & Andersen Africa, ACOA sponsorship.', 'LinkedIn', 'Scheduled', 'Late May 2025');

-- Populate "Done" items with past LinkedIn posts
INSERT INTO content_items (title, description, platform, status, post_date)
VALUES 
  ('Celebrating Our Team Members', 'Congratulations to Norman, Leonard and Sandra who are now ACCA qualified! To more qualifications and professional growth.', 'LinkedIn', 'Done', '2025-05-19'),
  
  ('2024 ACOA Conference', 'We are a proud sponsor of this year''s Africa Congress of Accountants (ACOA) happening May 15th-17th. Meet us at our booth to learn more about our services.', 'LinkedIn', 'Done', '2025-05-14'),
  
  ('SPURT Hub Partnership', 'We are excited to partner with SPURT Hub to support the growth of small businesses in Rwanda through tailored accounting and advisory services.', 'LinkedIn', 'Done', '2025-05-10'),
  
  ('Best Places to Work Award', 'We are honored to be named one of the Best Places to Work in Rwanda for the second consecutive year!', 'LinkedIn', 'Done', '2025-05-07'),
  
  ('Leadership Team Retreat', 'Our leadership team recently completed a strategic planning retreat to set our vision for the next five years. Exciting developments coming soon!', 'LinkedIn', 'Done', '2025-05-03'),
  
  ('Kigali Financial Center Collaboration', 'We are thrilled to announce our new collaboration with the Kigali International Financial Center to strengthen Rwanda''s position as a leading financial hub in Africa.', 'LinkedIn', 'Done', '2025-04-29'),
  
  ('Tax Season Tips', 'As tax filing deadlines approach, our experts share top five tips to ensure compliance and optimize your tax position.', 'LinkedIn', 'Done', '2025-04-26'),
  
  ('New Office Tour', 'Take a virtual tour of our newly expanded office space in Kigali, designed to foster collaboration and innovation.', 'LinkedIn', 'Done', '2025-04-23');

-- Update post_url for the April 29 post (example URL)
UPDATE content_items 
SET post_url = 'https://www.linkedin.com/posts/andersen-rwanda_kigali-financial-center-collaboration-activity-7012345678901234567-abcd'
WHERE title = 'Kigali Financial Center Collaboration'; 