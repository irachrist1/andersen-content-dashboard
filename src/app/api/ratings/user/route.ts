import { NextRequest, NextResponse } from 'next/server';
import { RatingService } from '@/lib/ratingService';

/**
 * GET /api/ratings/user?contentId=123&userId=456
 * Get a user's rating for a specific content item
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');
    const userId = searchParams.get('userId');

    if (!contentId || !userId) {
      return NextResponse.json(
        { error: 'Content ID and user ID are required' },
        { status: 400 }
      );
    }

    const rating = await RatingService.getUserRatingForContent(contentId, userId);
    return NextResponse.json(rating || { exists: false });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 