import { NextResponse } from 'next/server';
import { AIUsageTracker } from '@/lib/aiUsageTracker';

export async function GET(request: Request) {
  try {
    // Extract days query parameter, default to 7 days
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    
    // Get detailed usage stats for the specified number of days
    const detailedStats = await AIUsageTracker.getDetailedUsageStats(days);
    
    return NextResponse.json(detailedStats);
  } catch (error) {
    console.error('Error in detailed AI usage stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detailed AI usage statistics' },
      { status: 500 }
    );
  }
} 