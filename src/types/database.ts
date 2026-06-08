// =============================================
// Database Types for AI Marketing Autopilot
// =============================================

// Brand colors JSON structure
export interface BrandColors {
  primary: string;
  secondary: string;
}

// =============================================
// PROFILES
// =============================================
export interface Profile {
  id: string;
  company_name: string | null;
  description: string | null;
  logo_url: string | null;
  brand_colors: BrandColors;
  tone_of_voice: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  company_name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  brand_colors?: BrandColors;
  tone_of_voice?: string | null;
}

export interface ProfileUpdate {
  company_name?: string | null;
  description?: string | null;
  logo_url?: string | null;
  brand_colors?: BrandColors;
  tone_of_voice?: string | null;
}

// =============================================
// SUBSCRIBERS
// =============================================
export interface Subscriber {
  id: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  tags: string[];
  subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriberInsert {
  user_id: string;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  tags?: string[];
  subscribed?: boolean;
}

export interface SubscriberUpdate {
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  tags?: string[];
  subscribed?: boolean;
}

// =============================================
// CAMPAIGNS
// =============================================
export type CampaignStatus = 'draft' | 'scheduled' | 'sent';
export type CampaignType = 'email' | 'sms' | 'banner';

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  topic: string | null;
  status: CampaignStatus;
  campaign_type: CampaignType;
  subject_line: string | null;
  generated_text: string | null;
  generated_image_url: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignInsert {
  user_id: string;
  title: string;
  topic?: string | null;
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  subject_line?: string | null;
  generated_text?: string | null;
  generated_image_url?: string | null;
  scheduled_at?: string | null;
  recipient_count?: number;
}

export interface CampaignUpdate {
  title?: string;
  topic?: string | null;
  status?: CampaignStatus;
  campaign_type?: CampaignType;
  subject_line?: string | null;
  generated_text?: string | null;
  generated_image_url?: string | null;
  scheduled_at?: string | null;
  sent_at?: string | null;
  recipient_count?: number;
}

// =============================================
// CAMPAIGN ANALYTICS
// =============================================
export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  opens: number;
  clicks: number;
  bounces: number;
  unsubscribes: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// SUBSCRIPTIONS (Stripe Billing)
// =============================================
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused';

export interface Subscription {
  id: string;              // Stripe Subscription ID (sub_...)
  user_id: string;
  status: SubscriptionStatus;
  price_id: string;        // Stripe Price ID to identify plan tier
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      subscribers: {
        Row: Subscriber;
        Insert: SubscriberInsert;
        Update: SubscriberUpdate;
      };
      campaigns: {
        Row: Campaign;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
      };
      campaign_analytics: {
        Row: CampaignAnalytics;
        Insert: Omit<CampaignAnalytics, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CampaignAnalytics, 'id' | 'campaign_id' | 'created_at' | 'updated_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
