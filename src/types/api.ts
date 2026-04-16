// =============================================
// API Types for AI Marketing Autopilot
// =============================================

// =============================================
// API Response Types
// =============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================
// AI Generation Types
// =============================================
export interface GenerateCampaignRequest {
  topic: string;
  campaignType: 'email' | 'sms' | 'banner';
  targetAudience?: string;
  additionalContext?: string;
}

export interface AIGeneratedContent {
  subject: string;
  body: string;
  imagePrompt: string;
  callToAction: string;
}

export interface GenerateCampaignResponse {
  campaignId: string;
  content: AIGeneratedContent;
  imageUrl: string | null;
}

// =============================================
// OpenAI Types
// =============================================
export interface OpenAIMarketingResponse {
  subject: string;
  body: string;
  image_prompt: string;
  call_to_action: string;
}

// =============================================
// OpenAI Image Generation Types
// =============================================
export interface OpenAIImageGenerationInput {
  prompt: string;
  model?: 'gpt-image-1';
  n?: number;
  size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'auto';
}

export interface OpenAIImageResponse {
  created: number;
  data: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
}

// =============================================
// Email Service Types (Resend)
// =============================================
export interface SendEmailRequest {
  campaignId: string;
  subscriberIds?: string[];
  tags?: string[];
}

export interface SendEmailResponse {
  sent: number;
  failed: number;
  errors?: string[];
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// =============================================
// SMS Service Types (Twilio)
// =============================================
export interface SendSMSRequest {
  campaignId: string;
  subscriberIds?: string[];
  tags?: string[];
}

export interface SendSMSResponse {
  sent: number;
  failed: number;
  errors?: string[];
}

// =============================================
// Dashboard Stats Types
// =============================================
export interface DashboardStats {
  totalCampaigns: number;
  sentCampaigns: number;
  draftCampaigns: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalOpens: number;
  totalClicks: number;
  openRate: number;
  clickRate: number;
}

// =============================================
// Onboarding Types
// =============================================
export interface OnboardingData {
  companyName: string;
  description: string;
  logoFile?: File;
  brandColors: {
    primary: string;
    secondary: string;
  };
  toneOfVoice: string;
}

export const TONE_OPTIONS = [
  'Professional',
  'Friendly',
  'Casual',
  'Formal',
  'Playful',
  'Authoritative',
  'Inspirational',
  'Conversational',
] as const;

export type ToneOfVoice = typeof TONE_OPTIONS[number];
