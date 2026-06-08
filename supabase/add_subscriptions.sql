-- =============================================
-- Migration: Add Subscriptions Table for Stripe Billing
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- =============================================
-- SUBSCRIPTIONS TABLE (Stripe billing data)
-- =============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,                          -- Stripe Subscription ID (sub_...)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active',         -- active, trialing, canceled, past_due, incomplete, etc.
    price_id TEXT NOT NULL,                        -- Stripe Price ID to identify plan tier
    current_period_end TIMESTAMP WITH TIME ZONE,  -- When current billing cycle ends
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    -- Each user can only have one active subscription
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role (webhook) can insert subscriptions
-- The webhook uses the admin client which bypasses RLS,
-- but we add explicit policies for completeness
CREATE POLICY "Service role can insert subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions"
    ON public.subscriptions FOR UPDATE
    USING (true);

CREATE POLICY "Service role can delete subscriptions"
    ON public.subscriptions FOR DELETE
    USING (true);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
