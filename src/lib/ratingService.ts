import { supabase } from './supabase';
import { ContentItem, ContentRating } from './database.types';

export class RatingService {
  /**
   * Submit a new rating or update an existing one
   */
  static async submitRating(
    contentId: string, 
    rating: number, 
    userId: string, 
    comment?: string
  ): Promise<ContentRating> {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user has already rated this content item this week
    const { data: existingRating, error: findError } = await supabase
      .from('content_ratings')
      .select('*')
      .eq('content_item_id', contentId)
      .eq('user_identifier', userId)
      .eq('week_year', this.getCurrentWeekNumber())
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error checking for existing rating:', findError);
      throw new Error('Failed to check for existing rating');
    }

    if (existingRating) {
      // Update existing rating
      const { data: updatedRating, error: updateError } = await supabase
        .from('content_ratings')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating rating:', updateError);
        throw new Error('Failed to update rating');
      }

      return updatedRating;
    } else {
      // Create new rating
      const { data: newRating, error: insertError } = await supabase
        .from('content_ratings')
        .insert({
          content_item_id: contentId,
          user_identifier: userId,
          rating,
          comment
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error submitting rating:', insertError);
        throw new Error('Failed to submit rating');
      }

      return newRating;
    }
  }

  /**
   * Get ratings for a specific content item
   */
  static async getRatingsForContent(contentId: string): Promise<ContentRating[]> {
    const { data, error } = await supabase
      .from('content_ratings')
      .select('*')
      .eq('content_item_id', contentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      throw new Error('Failed to fetch ratings');
    }

    return data || [];
  }

  /**
   * Get user's rating for a specific content item in the current week
   */
  static async getUserRatingForContent(contentId: string, userId: string): Promise<ContentRating | null> {
    const { data, error } = await supabase
      .from('content_ratings')
      .select('*')
      .eq('content_item_id', contentId)
      .eq('user_identifier', userId)
      .eq('week_year', this.getCurrentWeekNumber())
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // "No rows returned" error
        return null;
      }
      console.error('Error fetching user rating:', error);
      throw new Error('Failed to fetch user rating');
    }

    return data;
  }

  /**
   * Delete a rating
   */
  static async deleteRating(ratingId: string): Promise<void> {
    const { error } = await supabase
      .from('content_ratings')
      .delete()
      .eq('id', ratingId);

    if (error) {
      console.error('Error deleting rating:', error);
      throw new Error('Failed to delete rating');
    }
  }

  /**
   * Calculate weekly averages and update publication eligibility
   * This would typically be run by a scheduled job
   */
  static async calculateWeeklyAverages(): Promise<void> {
    // This is handled automatically by the database triggers
    // But we could add additional business logic here if needed
    console.log('Weekly rating averages calculated automatically by database triggers');
  }

  /**
   * Get content items eligible for publication
   */
  static async getPublicationQueue(): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('publication_eligible', true)
      .eq('status', 'PendingReview')
      .order('average_rating', { ascending: false });

    if (error) {
      console.error('Error fetching publication queue:', error);
      throw new Error('Failed to fetch publication queue');
    }

    return data || [];
  }

  /**
   * Mark a content item for publication (move to Scheduled)
   */
  static async markForPublication(contentId: string): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .update({
        status: 'Scheduled'
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      console.error('Error marking for publication:', error);
      throw new Error('Failed to mark for publication');
    }

    return data;
  }

  /**
   * Get the current ISO week number
   */
  private static getCurrentWeekNumber(): number {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  }
} 