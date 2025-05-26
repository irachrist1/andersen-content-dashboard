import { NextResponse } from 'next/server';
import { AIUsageTracker } from '@/lib/aiUsageTracker';

export async function GET(request: Request) {
  try {
    // Extract days query parameter, default to 7 days
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);
    
    // Get usage stats for the specified number of days
    const usageStats = await AIUsageTracker.getUsageStats(days);
    
    return NextResponse.json(usageStats);
  } catch (error) {
    console.error('Error in AI usage stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI usage statistics' },
      { status: 500 }
    );
  }
} 