import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Credentials for Supabase connection
const supabaseUrl = 'https://cqkiwwwskfiuwajmdcqh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxa2l3d3dza2ZpdXdham1kY3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTQzMzIsImV4cCI6MjA2MzQ5MDMzMn0.3-Q629wobpjOn_mQlRPwMPxHWMBs6EkE0v_Nt-mqslM';

// In production, prefer environment variables for security
if (process.env.NODE_ENV === 'production' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Warning: Using hardcoded Supabase credentials in production. Consider using environment variables.');
}

// Create a Supabase client with error handling
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true, // Keep user logged in after page refresh
      autoRefreshToken: true, // Refresh auth token when needed
    },
    global: {
      // Custom error handling for global events
      headers: { 'x-application-name': 'ContentFlow' },
    },
  }
);

// Function to safely get Supabase client for API routes
export const getSupabase = () => {
  try {
    // Verify the client is properly instantiated before returning
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    return supabase;
  } catch (error) {
    console.error('Error getting Supabase client:', error);
    throw error;
  }
}; 