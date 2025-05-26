import { NextRequest, NextResponse } from 'next/server';
import { AIService, EnhancedContent } from '@/lib/aiService';
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
    const { title, description, platforms } = data;
    
    // Validate inputs
    if (!title || !description || !platforms || !Array.isArray(platforms)) {
      return NextResponse.json(
        { error: 'Invalid request. Required fields: title, description, platforms' },
        { status: 400 }
      );
    }
    
    console.log(`Processing enhance content request for platforms: ${platforms.join(', ')}`);
    
    // Generate a cache key from the request data
    const cacheKey = JSON.stringify({ title, description, platforms, operation: 'enhance-content' });
    
    // Try to get cached response first
    const cachedResponse = await AICacheService.getCachedResponse(cacheKey);
    if (cachedResponse) {
      try {
        console.log('Cache hit: Using cached response');
        const enhancedContent = JSON.parse(cachedResponse) as EnhancedContent;
        return NextResponse.json({ enhancedContent, cached: true });
      } catch (error) {
        console.error('Error parsing cached response:', error);
        // Continue to generate new response if cache parsing fails
      }
    }
    
    console.log('Cache miss: Generating new AI response');
    
    // Get enhanced content from AI service
    const enhancedContent = await AIService.enhancePostContent(
      title,
      description,
      platforms as Platform[]
    );
    
    console.log('Successfully generated enhanced content');
    
    // Cache the response for future use
    // Estimate token count based on input and output length (very rough estimate)
    const inputTokens = (title.length + description.length) / 4;
    const outputTokens = JSON.stringify(enhancedContent).length / 4;
    await AICacheService.cacheResponse(
      cacheKey,
      JSON.stringify(enhancedContent),
      outputTokens
    );
    
    // Track usage
    await AIUsageTracker.trackUsage(
      inputTokens,
      outputTokens,
      'enhance-content'
    );
    
    return NextResponse.json({ enhancedContent, cached: false });
  } catch (error) {
    console.error('Error enhancing content:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to enhance content', details: errorMessage },
      { status: 500 }
    );
  }
} 