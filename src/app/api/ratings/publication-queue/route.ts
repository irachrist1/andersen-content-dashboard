import { NextRequest, NextResponse } from 'next/server';
import { RatingService } from '@/lib/ratingService';

/**
 * GET /api/ratings/publication-queue
 * Get content items eligible for publication
 */
export async function GET(request: NextRequest) {
  try {
    const queue = await RatingService.getPublicationQueue();
    return NextResponse.json(queue);
  } catch (error) {
    console.error('Error fetching publication queue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings/publication-queue
 * Mark a content item for publication (move to Scheduled)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const updatedItem = await RatingService.markForPublication(body.contentId);
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error marking for publication:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 