import { NextRequest, NextResponse } from 'next/server';
import { RatingService } from '@/lib/ratingService';

/**
 * GET /api/ratings?contentId=123
 * Get ratings for a specific content item
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'Content ID is required' }, { status: 400 });
    }

    const ratings = await RatingService.getRatingsForContent(contentId);
    return NextResponse.json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings
 * Submit a new rating or update an existing one
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.contentId || !body.rating || !body.userId) {
      return NextResponse.json(
        { error: 'Content ID, rating, and user ID are required' },
        { status: 400 }
      );
    }

    // Validate rating value
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const rating = await RatingService.submitRating(
      body.contentId,
      body.rating,
      body.userId,
      body.comment
    );

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 