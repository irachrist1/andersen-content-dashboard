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
}

export interface Database {
  public: {
    Tables: {
      content_items: {
        Row: ContentItem;
        Insert: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ContentItem, 'id' | 'created_at'>>;
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