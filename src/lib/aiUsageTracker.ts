import { getSupabase } from './supabase';

// Define the rate limit thresholds (per day)
const DAILY_REQUEST_LIMIT = 1000;
const DAILY_TOKEN_LIMIT = 500000; // 500k tokens per day

// Approximate token pricing (per 1M tokens)
const INPUT_TOKEN_COST_PER_MILLION = 0.125; // $0.125 per 1M input tokens for Gemini Pro
const OUTPUT_TOKEN_COST_PER_MILLION = 0.375; // $0.375 per 1M output tokens for Gemini Pro

interface UsageRecord {
  id: string;
  date: string;
  request_count: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
}

export class AIUsageTracker {
  /**
   * Log usage of the AI service
   */
  static async trackUsage(
    inputTokens: number = 0,
    outputTokens: number = 0,
    operation: string = 'default'
  ): Promise<void> {
    try {
      const supabase = getSupabase();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Calculate estimated cost
      const inputCost = (inputTokens / 1000000) * INPUT_TOKEN_COST_PER_MILLION;
      const outputCost = (outputTokens / 1000000) * OUTPUT_TOKEN_COST_PER_MILLION;
      const totalCost = inputCost + outputCost;
      
      // Try to get today's record
      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('date', today)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching AI usage:', error);
        return;
      }
      
      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('ai_usage')
          .update({
            request_count: data.request_count + 1,
            input_tokens: data.input_tokens + inputTokens,
            output_tokens: data.output_tokens + outputTokens,
            estimated_cost: data.estimated_cost + totalCost,
          })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Error updating AI usage:', updateError);
        }
      } else {
        // Insert new record for today
        const { error: insertError } = await supabase
          .from('ai_usage')
          .insert({
            date: today,
            request_count: 1,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated_cost: totalCost,
          });
          
        if (insertError) {
          console.error('Error inserting AI usage:', insertError);
        }
      }
      
      // Also log detailed usage by operation
      await this.trackDetailedUsage(operation, inputTokens, outputTokens, totalCost);
      
    } catch (error) {
      console.error('Error tracking AI usage:', error);
    }
  }
  
  /**
   * Track detailed usage by operation type
   */
  private static async trackDetailedUsage(
    operation: string,
    inputTokens: number,
    outputTokens: number,
    cost: number
  ): Promise<void> {
    try {
      const supabase = getSupabase();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Try to get today's record for this operation
      const { data, error } = await supabase
        .from('ai_usage_details')
        .select('*')
        .eq('date', today)
        .eq('operation', operation)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching AI usage details:', error);
        return;
      }
      
      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('ai_usage_details')
          .update({
            request_count: data.request_count + 1,
            input_tokens: data.input_tokens + inputTokens,
            output_tokens: data.output_tokens + outputTokens,
            estimated_cost: data.estimated_cost + cost,
          })
          .eq('id', data.id);
          
        if (updateError) {
          console.error('Error updating AI usage details:', updateError);
        }
      } else {
        // Insert new record for today
        const { error: insertError } = await supabase
          .from('ai_usage_details')
          .insert({
            date: today,
            operation: operation,
            request_count: 1,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            estimated_cost: cost,
          });
          
        if (insertError) {
          console.error('Error inserting AI usage details:', insertError);
        }
      }
    } catch (error) {
      console.error('Error tracking detailed AI usage:', error);
    }
  }
  
  /**
   * Check if we're over the rate limit
   */
  static async checkRateLimit(): Promise<{ isLimited: boolean, reason?: string }> {
    try {
      const supabase = getSupabase();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('date', today)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking rate limit:', error);
        // Default to not limited if we can't check
        return { isLimited: false };
      }
      
      if (!data) {
        // No usage today yet
        return { isLimited: false };
      }
      
      // Check request limit
      if (data.request_count >= DAILY_REQUEST_LIMIT) {
        return { 
          isLimited: true, 
          reason: `Daily request limit of ${DAILY_REQUEST_LIMIT} reached` 
        };
      }
      
      // Check token limit
      const totalTokens = data.input_tokens + data.output_tokens;
      if (totalTokens >= DAILY_TOKEN_LIMIT) {
        return { 
          isLimited: true, 
          reason: `Daily token limit of ${DAILY_TOKEN_LIMIT} reached` 
        };
      }
      
      return { isLimited: false };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Default to not limited if we can't check
      return { isLimited: false };
    }
  }
  
  /**
   * Get usage statistics
   */
  static async getUsageStats(days: number = 30): Promise<any> {
    try {
      const supabase = getSupabase();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching AI usage stats:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return [];
    }
  }
  
  /**
   * Get detailed usage statistics by operation
   */
  static async getDetailedUsageStats(days: number = 30): Promise<any> {
    try {
      const supabase = getSupabase();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('ai_usage_details')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching detailed AI usage stats:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting detailed usage stats:', error);
      return [];
    }
  }
} 