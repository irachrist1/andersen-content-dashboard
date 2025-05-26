import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/aiService';
import { AICacheService } from '@/lib/aiCache';
import { AIUsageTracker } from '@/lib/aiUsageTracker';
import { Platform } from '@/lib/database.types';

export async function POST(request: NextRequest) {
  try {
    // Check rate limits before proceeding
    const { isLimited, reason } = await AIUsageTracker.checkRateLimit();
    if (isLimited) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', reason },
        { status: 429 }
      );
    }
    
    const data = await request.json();
    const { content, platform } = data;
    
    // Validate inputs
    if (!content || !platform) {
      return NextResponse.json(
        { error: 'Invalid request. Required fields: content, platform' },
        { status: 400 }
      );
    }
    
    // Check if platform is valid
    const validPlatforms: Platform[] = ['LinkedIn', 'Website'];
    if (!validPlatforms.includes(platform as Platform)) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
        { status: 400 }
      );
    }
    
    // Generate a cache key from the request data
    const cacheKey = JSON.stringify({ content, platform, operation: 'optimize-platform' });
    
    // Try to get cached response first
    const cachedResponse = await AICacheService.getCachedResponse(cacheKey);
    if (cachedResponse) {
      return NextResponse.json({ optimizedContent: cachedResponse, cached: true });
    }
    
    // Get optimized content from AI service
    const optimizedContent = await AIService.optimizeForPlatform(content, platform as Platform);
    
    // Cache the response for future use
    // Estimate token count based on input and output length (very rough estimate)
    const inputTokens = content.length / 4;
    const outputTokens = optimizedContent.length / 4;
    await AICacheService.cacheResponse(
      cacheKey,
      optimizedContent,
      outputTokens
    );
    
    // Track usage
    await AIUsageTracker.trackUsage(
      inputTokens,
      outputTokens,
      'optimize-platform'
    );
    
    return NextResponse.json({ optimizedContent, cached: false });
  } catch (error) {
    console.error('Error optimizing content for platform:', error);
    return NextResponse.json(
      { error: 'Failed to optimize content for platform' },
      { status: 500 }
    );
  }
} 