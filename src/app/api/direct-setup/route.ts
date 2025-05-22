import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define the expected structure of a post in sample-size.json
interface SamplePostContent {
  text: string;
  link?: string;
  hashtags?: string[]; // Added to reflect actual data structure
  images?: string[];   // Added to reflect actual data structure
  // other fields like hashtags, images can be ignored for ContentItem
}

interface SamplePost {
  date: string;
  type?: string; // E.g., "repost"
  content: SamplePostContent | SamplePostContent[]; // Can be single object or array
  // other fields like mentions can be ignored for ContentItem
}

interface SampleSizeData {
  posts: SamplePost[];
  // company_links and company_description can be ignored
}

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

    // Data from src/sample-size.json
    const sampleSizeJsonData: SampleSizeData = {
  "posts": [
    {
      "date": "2025-05-19",
      "type": "repost",
      "content": {
        "text": "Honored to have hosted such an inspiring cohort here in Kigali! 🇷🇼\n\nThank you to our colleagues at Andersen in Nigeria for capturing the spirit of the Andersen New Managers School so well. It was a privilege for us to welcome delegates from across Africa for a week of growth, collaboration, and leadership development.\n\nTogether, we're building the future of leadership on the continent. 🌍",
        "hashtags": [
          "#AndersenRwanda",
          "#AndersenNigeria", 
          "#AndersenGlobal",
          "#NewManagersSchool",
          "#LeadershipDevelopment",
          "#AfricaLeadership",
          "#TeamAndersen",
          "#KigaliRwanda",
          "#DelegatesExperience"
        ],
        "images": ["Team from Andersen in Nigeria in Kigali"]
      }
    },
    {
      "date": "2025-05-14",
      "content": {
        "text": "Huge congrats to our very own Divine Utuza and Uwiringiyimana Ruth for smashing their ACCA exams! 🎉\n\nWe know the incredible journey and dedication it takes to reach this milestone. So proud to have you both on our Andersen team, showcasing such commitment and skill. Congratulations, you've truly earned this!",
        "hashtags": [
          "#AndersenRwanda",
          "#ACCASuccess",
          "#TeamAchievement"
        ],
        "images": ["Images of the two ladies"]
      }
    },
    {
      "date": "2025-05-13",
      "content": {
        "text": "Yesterday, our office was filled with joy, laughter, and love as we came together to celebrate Mother's Day with the incredible women who inspire us every day. From heartfelt moments to shared smiles, it was a beautiful reminder of the strength, grace, and warmth mothers bring into our lives—both at home and at work.\n\nA huge thank you to everyone who joined us and helped make the day so memorable. We're proud to honor and celebrate the amazing mothers in our Andersen family. 💐",
        "hashtags": [
          "#HappyMothersDay",
          "#AndersenRwanda"
        ]
      }
    },
    {
      "date": "2025-05-08",
      "content": [
        {
          "text": "Earlier Today we kicked off our Andersen Africa New Managers School in Kigali, bringing together professionals from our member firms across the continent.\n\nThis practical development program focuses on building essential skills in management, communication, team leadership, and business development.\nParticipants are sharing knowledge and insights to help create value for our clients across Africa.\n\nLooking forward to the connections and growth that will come from this collaborative experience!",
          "mentions": [
            "Andersen in Kenya",
            "Andersen in Nigeria", 
            "Andersen in Mauritius",
            "Andersen in Morocco",
            "Andersen in South Africa"
          ],
          "hashtags": [
            "#AndersenAfrica",
            "#AndersenManagersSchool",
            "#LeadershipDevelopment",
            "#AndersenRwanda"
          ]
        },
        {
          "text": "Yesterday, the Andersen Africa Regional Board sat down with the CEO of Kigali International Financial Centre (KIFC), Nick Barigye, for a strategic roundtable discussion. The conversation focused on \"What KIFC Offers to Africa and the World,\" exploring Rwanda's rise as a competitive financial hub and the opportunities this creates across the continent. Our sincere appreciation to KIFC for the thoughtful exchange and valuable insights.",
          "mentions": [
            "Kigali International Financial Centre",
            "Andersen in Nigeria",
            "Andersen in Kenya",
            "Andersen in Mauritius", 
            "Andersen in Morocco",
            "Andersen in South Africa"
          ]
        }
      ]
    },
    {
      "date": "2025-05-06",
      "content": {
        "text": "ACOA 2025 officially kicked off today in Kigali, and the energy has been extraordinary! Hundreds of accounting professionals gathered around the theme \"Creating Value for Africa,\" and it's been inspiring to engage with so many brilliant minds.\n\nA big thank you to everyone who stopped by Andersen's booth—we loved connecting with you and sharing ideas. We're excited to keep the momentum going tomorrow!",
        "hashtags": [
          "#ACOA2025",
          "#AndersenRwanda",
          "#Andersen",
          "#CreatingValueForAfrica",
          "#ProfessionalServices"
        ]
      }
    },
    {
      "date": "2025-05-05",
      "content": [
        {
          "text": "Meet the Andersen Team at ACOA 2025!\n\nOur Directors James Muigai and Timothy Gatonye, along with Ishimwe Claude and Vanessa Semugaza, will represent Andersen at ACOA 2025. The team looks forward to sharing insights and discussing industry developments throughout the congress.\n\nVisit our booth to learn how our tax, legal, and advisory services can benefit your organization.",
          "hashtags": [
            "#ACOA2025",
            "#Andersen",
            "#AndersenRwanda",
            "#ProfessionalServices",
            "#MeetTheTeam"
          ]
        },
        {
          "text": "Creating Value for Africa! Andersen is honored to be a Valued Participating Sponsor at the Africa Congress of Accountants (ACOA) 2025 in Kigali. Join us May 6-9 as we discuss the future of accounting and finance on the continent.",
          "hashtags": [
            "#ACOA2025",
            "#AndersenRwanda",
            "#AndersenAfrica",
            "#Kigali"
          ]
        }
      ]
    },
    {
      "date": "2025-05-01",
      "content": {
        "text": "As we celebrate Labor Day, here's to the team that brings passion, dedication, and a whole lot of energy to everything we do! Together we don't just work—we create, innovate, and occasionally raise our hands in perfect unison! 💪🎉\n\nFrom all of us at Andersen Rwanda, wishing you a day filled with well-deserved rest and celebration. Your hard work moves mountains!",
        "hashtags": [
          "#HappyLaborDay",
          "#TeamAndersen",
          "#May1st2025"
        ]
      }
    },
    {
      "date": "2025-04-30",
      "content": {
        "text": "During our visit to the Nyanza Genocide Memorial, we experienced something beyond words. The memorial doesn't just present history—it envelops you in truth that cannot be denied.\n\nIn the quiet halls, among preserved memories, we felt the profound absence of tens of thousands whose futures were stolen. Time seemed to stand still as we confronted both tremendous loss and remarkable human resilience.\n\nOur team walked away transformed, understanding that remembrance carries purpose. It compels us to bear witness, to acknowledge painful truths, and to participate actively in building a future where such atrocities cannot happen again.\n\nRwanda's journey shows us how a nation can confront darkness and still choose light—how remembrance becomes not just retrospection but a foundation for renewal. We honor this legacy by committing ourselves to the values of unity, truth, and collective healing.\n\nRemember. Unite. Renew.",
        "hashtags": [
          "#Kwibuka31",
          "#NeverAgain",
          "#RwandaRemembers",
          "#AndersenRemembers"
        ]
      }
    },
    {
      "date": "2025-04-29",
      "content": {
        "text": "Rwanda has introduced comprehensive VAT exemptions for financial and insurance services through a new Ministerial Order, aligning with global best practices and strengthening its position as an emerging financial hub. Jean Claude Nshimiyimana, Corporate Services Lead at Andersen in Rwanda, explains how these changes will benefit banks, insurers, fintechs, and investors through reduced operational costs and improved profit margins.\n\nKey highlights include:\n• Exemptions covering core banking, insurance, capital markets, and forex transactions\n• Reduced VAT burdens enabling expanded lending capacity\n• Lower insurance premium costs facilitating rural market expansion\n• Higher net yields for investors due to tax-exempt financial returns\n\nThis Ministerial Order on VAT-Exempt Financial and Insurance Services exhibits Rwanda's allegiance to creating a competitive financial ecosystem in East Africa and presents significant opportunities for businesses and investors in the region.",
        "link": "https://lnkd.in/d-_8WiWG",
        "hashtags": [
          "#RwandaFinance",
          "#VATExemption",
          "#AfricanInvestment",
          "#FinancialServices",
          "#InsuranceSector",
          "#EmergingMarkets",
          "#FinTech",
          "#EastAfrica",
          "#RwandaBusiness",
          "#AndersenGlobal"
        ]
      }
    },
    {
      "date": "2025-04-23",
      "content": {
        "text": "Our Head of international tax Timothy Gatonye will join other seasoned experts on an important webinar on harnessing AfCFTA for business growth across Africa. See below for more details."
      }
    }
  ],
  "company_links": {
    "linkedin_posts": [
      "https://www.linkedin.com/company/104377961/admin/page-posts/published/",
      "https://www.linkedin.com/company/andersen-in-rwanda/posts/"
    ]
  },
  "company_description": "Andersen in Rwanda delivers customized tax and business advisory services to local and international companies. With a team of experienced professionals, the firm provides tailored solutions and exceptional results, ensuring clients stay ahead in a dynamic business environment while meeting both strategic objectives and compliance requirements."
};

    // Transform the sample data
    const sampleData = sampleSizeJsonData.posts.map(post => {
      const firstContent = Array.isArray(post.content) ? post.content[0] : post.content;
      const title = firstContent.text.substring(0, 50) + (firstContent.text.length > 50 ? '...' : ''); // Simple title generation
      
      return {
        title: title,
        description: firstContent.text,
        platform: 'LinkedIn', // Assuming all are LinkedIn for now
        status: 'Done', // Assuming all are Done
        post_date: post.date, // This is the original post date
        post_url: firstContent.link || null,
        suggested_post_time: null, // Not available in this JSON
      };
    });
    
    // Step 1: Delete all existing items to avoid duplicates and ensure clean slate
    const { error: deleteError } = await supabaseAdmin
      .from('content_items')
      .delete()
      .not('id', 'is', null); // Deletes all rows

    if (deleteError) {
      console.warn('Could not delete existing items:', deleteError.message);
      // Decide if you want to stop or proceed. For a setup script, proceeding might be okay.
    }
    
    // Step 2: Insert the transformed sample data
    let dataInserted = false;
    const { error: insertError } = await supabaseAdmin.from('content_items').insert(sampleData);
    if (!insertError) {
      dataInserted = true;
    } else {
      console.error("Error inserting sample data:", insertError);
    }

    // Check if we can query the table now
    const { data: confirmData, error: confirmError } = await supabaseAdmin
      .from('content_items')
      .select('id', { count: 'exact', head: true }); // More efficient count

    return NextResponse.json({
      status: confirmError || insertError ? 'error' : 'success',
      message: confirmError || insertError
        ? 'Failed to load all sample data. Some data might be missing or table setup failed.' 
        : 'Database reset and sample data from sample-size.json loaded! Please reload the main page.',
      tableExists: !confirmError,
      dataInserted,
      error: confirmError ? confirmError.message : (insertError ? insertError.message : null),
      itemsProcessed: sampleData.length,
      itemsInserted: confirmData ? (confirmData as any).count : 0, // Supabase returns count on head request
      setupUrl: 'https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh/sql'
    });
  } catch (error) {
    console.error('Direct setup error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to set up database with sample-size.json data',
      error: error instanceof Error ? error.message : String(error),
      setupUrl: 'https://supabase.com/dashboard/project/cqkiwwwskfiuwajmdcqh/sql'
    }, { status: 500 });
  }
} 