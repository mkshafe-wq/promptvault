export interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[] | null;
  folder_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete' | null;
  plan: 'free' | 'pro' | null;
  current_period_end: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: Prompt;
        Insert: Omit<Prompt, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string | null; updated_at?: string | null; };
        Update: Partial<Omit<Prompt, 'id' | 'user_id'>>;
      };
      folders: {
        Row: Folder;
        Insert: Omit<Folder, 'id' | 'created_at'> & { id?: string; created_at?: string | null; };
        Update: Partial<Omit<Folder, 'id' | 'user_id'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string | null; updated_at?: string | null; };
        Update: Partial<Omit<Subscription, 'id' | 'user_id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface ApiResponse<T> { data?: T; error?: string; }
export interface PromptsResponse { prompts: Prompt[]; }
export interface PromptResponse { prompt: Prompt; }
export interface CheckoutResponse { url: string; }
export interface PromptFormData { title: string; content: string; tags: string[]; folder_id: string | null; }
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete' | null;
