import { getSupabase } from './supabase';

// One hour cache expiration by default
const DEFAULT_CACHE_EXPIRY_HOURS = 24;

interface CacheEntry {
  id: string;
  prompt: string;
  response: string;
  created_at: string;
  expires_at: string;
  token_count: number;
}

export class AICacheService {
  /**
   * Get a cached response for a given prompt if available
   */
  static async getCachedResponse(prompt: string): Promise<string | null> {
    try {
      const supabase = getSupabase();
      const promptHash = await this.hashPrompt(prompt);
      
      // Get cache entry if it exists and is not expired
      const { data, error } = await supabase
        .from('ai_cache')
        .select('*')
        .eq('prompt_hash', promptHash)
        .gt('expires_at', new Date().toISOString())
        .single();
        
      if (error || !data) {
        return null;
      }
      
      return data.response;
    } catch (error) {
      console.error('Error retrieving from AI cache:', error);
      return null; // On error, return null and let the caller generate a new response
    }
  }
  
  /**
   * Cache an AI response for a given prompt
   */
  static async cacheResponse(
    prompt: string, 
    response: string, 
    tokenCount: number = 0,
    expiryHours: number = DEFAULT_CACHE_EXPIRY_HOURS
  ): Promise<void> {
    try {
      const supabase = getSupabase();
      const promptHash = await this.hashPrompt(prompt);
      
      // Calculate expiry time
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(now.getHours() + expiryHours);
      
      // Insert or update cache entry
      const { error } = await supabase
        .from('ai_cache')
        .upsert({
          prompt_hash: promptHash,
          prompt: prompt,
          response: response,
          token_count: tokenCount,
          expires_at: expiresAt.toISOString(),
        });
        
      if (error) {
        console.error('Error updating AI cache:', error);
      }
    } catch (error) {
      console.error('Error caching AI response:', error);
      // Don't throw, just log - failure to cache shouldn't break the app
    }
  }
  
  /**
   * Clear expired cache entries to keep the database clean
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      const supabase = getSupabase();
      
      const { error } = await supabase
        .from('ai_cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
        
      if (error) {
        console.error('Error clearing expired AI cache:', error);
      }
    } catch (error) {
      console.error('Error clearing expired AI cache:', error);
    }
  }
  
  /**
   * Create a hash of the prompt for efficient lookup
   */
  private static async hashPrompt(prompt: string): Promise<string> {
    // Create a SHA-256 hash of the prompt
    const msgUint8 = new TextEncoder().encode(prompt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
} 