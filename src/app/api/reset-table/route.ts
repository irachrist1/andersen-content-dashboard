import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Sample data for Andersen in Rwanda
    const sampleData = [
      // Pending Review items
      {
        title: 'Claude\'s IFRS piece',
        description: 'Detailed analysis of International Financial Reporting Standards relevant to the Rwanda market.',
        platform: 'LinkedIn',
        status: 'PendingReview',
      },
      {
        title: 'Ruth\'s IFRS piece',
        description: 'Exploration of IFRS implementation challenges and solutions for businesses in East Africa.',
        platform: 'LinkedIn',
        status: 'PendingReview',
      },
      {
        title: 'Norman\'s IFRS piece',
        description: 'Overview of recent changes to IFRS standards and their impact on Rwandan companies.',
        platform: 'LinkedIn',
        status: 'PendingReview',
      },
      {
        title: 'Hajara\'s article',
        description: 'Upcoming article on finance and accounting trends in Rwanda - topic to be confirmed.',
        platform: 'LinkedIn',
        status: 'PendingReview',
      },
      
      // Scheduled item
      {
        title: 'May Office Highlights Post',
        description: 'Feature images/mentions of: pottery coffee visit, Andersen Africa New Managers School hosted in Kigali, talk with KIFC & Andersen Africa, ACOA sponsorship.',
        platform: 'LinkedIn',
        status: 'Scheduled',
        suggested_post_time: 'Late May 2025',
      },
      
      // Done items with past LinkedIn posts
      {
        title: 'Celebrating Our Team Members',
        description: 'Congratulations to Norman, Leonard and Sandra who are now ACCA qualified! To more qualifications and professional growth.',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-05-19',
      },
      {
        title: '2024 ACOA Conference',
        description: 'We are a proud sponsor of this year\'s Africa Congress of Accountants (ACOA) happening May 15th-17th. Meet us at our booth to learn more about our services.',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-05-14',
      },
      {
        title: 'SPURT Hub Partnership',
        description: 'We are excited to partner with SPURT Hub to support the growth of small businesses in Rwanda through tailored accounting and advisory services.',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-05-10',
      },
      {
        title: 'Best Places to Work Award',
        description: 'We are honored to be named one of the Best Places to Work in Rwanda for the second consecutive year!',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-05-07',
      },
      {
        title: 'Leadership Team Retreat',
        description: 'Our leadership team recently completed a strategic planning retreat to set our vision for the next five years. Exciting developments coming soon!',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-05-03',
      },
      {
        title: 'Kigali Financial Center Collaboration',
        description: 'We are thrilled to announce our new collaboration with the Kigali International Financial Center to strengthen Rwanda\'s position as a leading financial hub in Africa.',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-04-29',
        post_url: 'https://www.linkedin.com/posts/andersen-rwanda_kigali-financial-center-collaboration-activity-7012345678901234567-abcd',
      },
      {
        title: 'Tax Season Tips',
        description: 'As tax filing deadlines approach, our experts share top five tips to ensure compliance and optimize your tax position.',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-04-26',
      },
      {
        title: 'New Office Tour',
        description: 'Take a virtual tour of our newly expanded office space in Kigali, designed to foster collaboration and innovation.',
        platform: 'LinkedIn',
        status: 'Done',
        post_date: '2025-04-23',
      },
    ];

    // Step 1: Delete all content items if the table exists
    await supabase
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