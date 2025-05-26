import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/aiService';
import { AICacheService } from '@/lib/aiCache';
import { AIUsageTracker } from '@/lib/aiUsageTracker';

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
    const { content } = data;
    
    // Validate inputs
    if (!content) {
      return NextResponse.json(
        { error: 'Invalid request. Required field: content' },
        { status: 400 }
      );
    }
    
    // Generate a cache key from the request data
    const cacheKey = JSON.stringify({ content, operation: 'generate-hashtags' });
    
    // Try to get cached response first
    const cachedResponse = await AICacheService.getCachedResponse(cacheKey);
    if (cachedResponse) {
      try {
        const hashtags = JSON.parse(cachedResponse) as string[];
        return NextResponse.json({ hashtags, cached: true });
      } catch (error) {
        console.error('Error parsing cached response:', error);
        // Continue to generate new response if cache parsing fails
      }
    }
    
    // Get hashtags from AI service
    const hashtags = await AIService.generateHashtags(content);
    
    // Cache the response for future use
    // Estimate token count based on input and output length (very rough estimate)
    const inputTokens = content.length / 4;
    const outputTokens = JSON.stringify(hashtags).length / 4;
    await AICacheService.cacheResponse(
      cacheKey,
      JSON.stringify(hashtags),
      outputTokens
    );
    
    // Track usage
    await AIUsageTracker.trackUsage(
      inputTokens,
      outputTokens,
      'generate-hashtags'
    );
    
    return NextResponse.json({ hashtags, cached: false });
  } catch (error) {
    console.error('Error generating hashtags:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashtags' },
      { status: 500 }
    );
  }
} 