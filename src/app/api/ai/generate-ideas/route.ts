import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/aiService';
import { AICacheService } from '@/lib/aiCache';
import { AIUsageTracker } from '@/lib/aiUsageTracker';
import { Department } from '@/lib/database.types';

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
    const { department } = data;
    
    // Validate inputs
    if (!department) {
      return NextResponse.json(
        { error: 'Invalid request. Required field: department' },
        { status: 400 }
      );
    }
    
    // Check if department is valid
    const validDepartments: Department[] = ['BSS', 'Tax Advisory', 'Management Consulting', 'Operations', 'Technology'];
    if (!validDepartments.includes(department as Department)) {
      return NextResponse.json(
        { error: 'Invalid department. Must be one of: ' + validDepartments.join(', ') },
        { status: 400 }
      );
    }
    
    // Generate a cache key from the request data
    const cacheKey = JSON.stringify({ department, operation: 'generate-ideas' });
    
    // Try to get cached response first
    const cachedResponse = await AICacheService.getCachedResponse(cacheKey);
    if (cachedResponse) {
      try {
        const ideas = JSON.parse(cachedResponse) as string[];
        return NextResponse.json({ ideas, cached: true });
      } catch (error) {
        console.error('Error parsing cached response:', error);
        // Continue to generate new response if cache parsing fails
      }
    }
    
    // Get ideas from AI service
    const ideas = await AIService.generatePostIdeas(department as Department);
    
    // Cache the response for future use
    // Estimate token count based on input and output length (very rough estimate)
    const inputTokens = department.length * 2;
    const outputTokens = JSON.stringify(ideas).length / 4;
    await AICacheService.cacheResponse(
      cacheKey,
      JSON.stringify(ideas),
      outputTokens
    );
    
    // Track usage
    await AIUsageTracker.trackUsage(
      inputTokens,
      outputTokens,
      'generate-ideas'
    );
    
    return NextResponse.json({ ideas, cached: false });
  } catch (error) {
    console.error('Error generating post ideas:', error);
    return NextResponse.json(
      { error: 'Failed to generate post ideas' },
      { status: 500 }
    );
  }
} 