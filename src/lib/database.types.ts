export type Platform = 'LinkedIn' | 'Website';
export type Platforms = Platform[];
export type Status = 'Inbox' | 'PendingReview' | 'Scheduled' | 'Done';
export type Department = 'BSS' | 'Tax Advisory' | 'Management Consulting' | 'Operations' | 'Technology';

export interface ContentItem {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  platform: Platforms;
  status: Status;
  post_url?: string | null;
  suggested_post_time?: string | null;
  post_date?: string | null;
  target_date?: string | null;
  department?: Department | null;
  sort_order?: number | null;
  // Rating-related fields
  average_rating?: number | null;
  total_ratings?: number | null;
  publication_eligible?: boolean | null;
}

export interface ContentRating {
  id: string;
  content_item_id: string;
  user_identifier: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
  week_year: number;
}

export interface Database {
  public: {
    Tables: {
      content_items: {
        Row: ContentItem;
        Insert: Omit<ContentItem, 'id' | 'created_at' | 'updated_at' | 'average_rating' | 'total_ratings' | 'publication_eligible'>;
        Update: Partial<Omit<ContentItem, 'id' | 'created_at' | 'average_rating' | 'total_ratings' | 'publication_eligible'>>;
      };
      content_ratings: {
        Row: ContentRating;
        Insert: Omit<ContentRating, 'id' | 'created_at' | 'updated_at' | 'week_year'>;
        Update: Partial<Omit<ContentRating, 'id' | 'created_at' | 'week_year'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
  };
} 