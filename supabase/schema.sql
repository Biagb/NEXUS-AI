-- =============================================
-- AI Marketing Autopilot - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    description TEXT,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#1E40AF"}'::jsonb,
    tone_of_voice TEXT DEFAULT 'Professional',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- SUBSCRIBERS TABLE (CRM)
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    tags TEXT[] DEFAULT '{}',
    subscribed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
CREATE POLICY "Users can view their own subscribers" 
    ON public.subscribers FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscribers" 
    ON public.subscribers FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscribers" 
    ON public.subscribers FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscribers" 
    ON public.subscribers FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    topic TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
    campaign_type TEXT DEFAULT 'email' CHECK (campaign_type IN ('email', 'sms', 'banner')),
    subject_line TEXT,
    generated_text TEXT,
    generated_image_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on campaigns
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can view their own campaigns" 
    ON public.campaigns FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" 
    ON public.campaigns FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
    ON public.campaigns FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
    ON public.campaigns FOR DELETE 
    USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- =============================================
-- CAMPAIGN ANALYTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    opens INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on campaign_analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics policies (through campaign ownership)
CREATE POLICY "Users can view analytics for their campaigns" 
    ON public.campaign_analytics FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_analytics.campaign_id 
            AND campaigns.user_id = auth.uid()
        )
    );

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create branding bucket for logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Create campaigns bucket for generated images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaigns', 'campaigns', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for branding bucket
CREATE POLICY "Users can upload their own branding assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'branding' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own branding assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'branding' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own branding assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'branding' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Branding assets are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'branding');

-- Storage policies for campaigns bucket
CREATE POLICY "Users can upload campaign assets"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'campaigns' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their campaign assets"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'campaigns' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their campaign assets"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'campaigns' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Campaign assets are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'campaigns');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
    BEFORE UPDATE ON public.subscribers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_analytics_updated_at
    BEFORE UPDATE ON public.campaign_analytics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
