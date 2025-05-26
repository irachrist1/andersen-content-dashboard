import { NextRequest, NextResponse } from 'next/server';
import { RatingService } from '@/lib/ratingService';

/**
 * DELETE /api/ratings/[id]
 * Delete a rating
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Rating ID is required' }, { status: 400 });
    }

    await RatingService.deleteRating(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 