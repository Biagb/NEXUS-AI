'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, BrandColors, Subscription } from '@/types';
import {
  Button, Input, Label, Textarea, Select, Badge,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  useToast, LoadingScreen,
} from '@/components/ui';
import { TONE_OPTIONS } from '@/types';
import {
  Save, Upload, User, CreditCard, Check, Sparkles,
  Crown, Zap, ArrowRight, ExternalLink, CalendarClock, Shield, Mail,
} from 'lucide-react';
import Image from 'next/image';

// ─── Plan Configuration ─────────────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    description: 'Perfect for getting started',
    icon: Zap,
    popular: false,
    features: [
      'Up to 100 subscribers',
      '3 campaigns per month',
      'Basic AI text generation',
      'Email support',
    ],
    gradient: 'from-[#64748B] to-[#475569]',
    glowColor: 'rgba(100, 116, 139, 0.15)',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 10,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    description: 'For growing businesses',
    icon: Sparkles,
    popular: true,
    features: [
      'Up to 5,000 subscribers',
      'Unlimited campaigns',
      'Advanced AI with GPT-5',
      'AI image generation',
      'SMS campaigns',
      'Priority support',
    ],
    gradient: 'from-[#3B82F6] to-[#8B5CF6]',
    glowColor: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 30,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
    description: 'For scaling teams',
    icon: Crown,
    popular: false,
    features: [
      'Unlimited subscribers',
      'Unlimited campaigns',
      'Advanced AI with GPT-5',
      'AI image generation',
      'SMS + Email campaigns',
      'Custom branding',
      'API access',
      'Dedicated account manager',
    ],
    gradient: 'from-[#F59E0B] to-[#EF4444]',
    glowColor: 'rgba(245, 158, 11, 0.15)',
  },
] as const;

// ─── Tab type ────────────────────────────────────────────────────────
type SettingsTab = 'profile' | 'billing';

// ─── Helper: determine current plan from subscription ────────────────
function getCurrentPlan(subscription: Subscription | null): string {
  if (!subscription || subscription.status === 'canceled') return 'free';

  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '';
  const enterprisePriceId = process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '';

  if (subscription.price_id === proPriceId) return 'pro';
  if (subscription.price_id === enterprisePriceId) return 'enterprise';

  // If price_id doesn't match our known plans but subscription is active,
  // it's some paid plan — default to showing as "pro"
  if (['active', 'trialing'].includes(subscription.status)) return 'pro';

  return 'free';
}

export default function SettingsPage() {
  const supabase = createClient();
  const { addToast } = useToast();

  // ─── State ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    brandColors: { primary: '#3B82F6', secondary: '#1E40AF' } as BrandColors,
    toneOfVoice: 'Professional',
  });

  // ─── Read tab from URL search params ──────────────────────────────
  useEffect(() => {
    const handleBillingReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'billing') setActiveTab('billing');

      const sessionId = params.get('session_id');
      if (sessionId) {
        try {
          const client = createClient();
          const response = await fetch('/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Failed to confirm checkout session');
          }

          const { data: { user } } = await client.auth.getUser();
          if (user) {
            const { data: subData } = await client
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (subData) {
              setSubscription(subData as Subscription);
            }
          }

          addToast('success', 'Subscription upgraded successfully!');
        } catch (error) {
          console.error('Checkout confirmation error:', error);
          addToast('error', error instanceof Error ? error.message : 'Failed to sync subscription');
        } finally {
          window.history.replaceState({}, '', '/dashboard/settings?tab=billing');
        }
      }

      const canceled = params.get('canceled');
      if (canceled) {
        addToast('info', 'Checkout was canceled');
        window.history.replaceState({}, '', '/dashboard/settings?tab=billing');
      }
    };

    handleBillingReturn();
  }, [addToast]);

  // ─── Fetch profile + subscription data ────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserEmail(user.email || '');

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setFormData({
          companyName: profileData.company_name || '',
          description: profileData.description || '',
          brandColors: profileData.brand_colors || { primary: '#3B82F6', secondary: '#1E40AF' },
          toneOfVoice: profileData.tone_of_voice || 'Professional',
        });
        setLogoPreview(profileData.logo_url);

        // Fetch subscription
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subData) {
          setSubscription(subData as Subscription);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('error', 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, addToast]);

  // ─── Profile form handlers ────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast('error', 'You must be logged in');
        return;
      }

      let logoUrl = profile?.logo_url;

      // Upload new logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${user.id}/logo.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('branding')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          addToast('error', 'Failed to upload logo');
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('branding')
            .getPublicUrl(fileName);
          logoUrl = publicUrl;
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          company_name: formData.companyName,
          description: formData.description,
          logo_url: logoUrl,
          brand_colors: formData.brandColors,
          tone_of_voice: formData.toneOfVoice,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      addToast('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      addToast('error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Billing handlers ─────────────────────────────────────────────
  const handleCheckout = useCallback(async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  }, [addToast]);

  const handleManageBilling = useCallback(async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      addToast('error', error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  }, [addToast]);

  // ─── Loading state ────────────────────────────────────────────────
  if (isLoading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  const currentPlan = getCurrentPlan(subscription);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#1E293B]">Settings</h1>
        <p className="text-[#64748B] mt-1">
          Manage your profile, branding, and subscription
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 animate-fade-in-up delay-100">
        <div className="flex gap-1 p-1 bg-[#F1F5F9] rounded-xl w-fit">
          <button
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            id="tab-billing"
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Billing & Subscription
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PROFILE TAB                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="animate-fade-in-up delay-150">
          {/* Account Info Banner */}
          <div className="mb-6 flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#3B82F6]/5 to-[#8B5CF6]/5 border border-[#3B82F6]/10">
            <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-ai text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1E293B]">Signed in as</p>
              <p className="text-sm text-[#64748B]">{userEmail}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  This information is used to personalize your marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName" required>Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>
                  Customize your brand appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div>
                  <Label>Company Logo</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E2E8F0]">
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[#CBD5E1] flex items-center justify-center">
                        <Upload className="w-8 h-8 text-[#94A3B8]" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="logo"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <label htmlFor="logo">
                        <span className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-[#CBD5E1] bg-white shadow-sm hover:bg-[#F8FAFC] hover:text-[#1E293B] h-9 px-4 py-2 cursor-pointer">
                          {logoPreview ? 'Change Logo' : 'Upload Logo'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={formData.brandColors.primary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, primary: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer border border-[#E2E8F0]"
                      />
                      <Input
                        value={formData.brandColors.primary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, primary: e.target.value },
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={formData.brandColors.secondary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, secondary: e.target.value },
                          })
                        }
                        className="w-10 h-10 rounded cursor-pointer border border-[#E2E8F0]"
                      />
                      <Input
                        value={formData.brandColors.secondary}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            brandColors: { ...formData.brandColors, secondary: e.target.value },
                          })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tone of Voice */}
            <Card>
              <CardHeader>
                <CardTitle>Communication Style</CardTitle>
                <CardDescription>
                  Define how AI should write your marketing content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="toneOfVoice">Tone of Voice</Label>
                  <Select
                    id="toneOfVoice"
                    value={formData.toneOfVoice}
                    onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                    options={TONE_OPTIONS.map((tone) => ({ value: tone, label: tone }))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button type="submit" isLoading={isSaving} className="w-full gradient-ai text-white border-0 shadow-md shadow-blue-500/25">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BILLING TAB                                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'billing' && (
        <div className="animate-fade-in-up delay-150 space-y-8">

          {/* Active Subscription Details (if paid) */}
          {subscription && ['active', 'trialing'].includes(subscription.status) && (
            <Card className="border-[#3B82F6]/20 bg-gradient-to-r from-[#3B82F6]/[0.03] to-[#8B5CF6]/[0.03]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-ai text-white">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1E293B]">Current billing period</p>
                      <p className="text-sm text-[#64748B]">
                        Renews on{' '}
                        <span className="font-medium text-[#1E293B]">
                          {subscription.current_period_end
                            ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="success" className="px-3 py-1">
                      {subscription.status === 'trialing' ? 'Trial' : 'Active'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageBilling}
                      isLoading={portalLoading}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                      Manage Billing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Grid */}
          <div>
            <h2 className="text-lg font-semibold text-[#1E293B] mb-1">Choose your plan</h2>
            <p className="text-sm text-[#64748B] mb-6">Select the plan that best fits your needs. Upgrade or downgrade at any time.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan, index) => {
                const isCurrentPlan = currentPlan === plan.id;
                const isPaid = plan.price > 0;
                const Icon = plan.icon;

                return (
                  <Card
                    key={plan.id}
                    id={`plan-${plan.id}`}
                    className={`relative overflow-hidden transition-all duration-300 ${
                      isCurrentPlan
                        ? 'ring-2 ring-[#3B82F6] shadow-lg shadow-blue-500/10'
                        : 'hover:shadow-lg hover:shadow-[#1E293B]/5 hover:-translate-y-1'
                    }`}
                    style={{
                      animationDelay: `${index * 100 + 200}ms`,
                    }}
                  >
                    {/* Popular badge */}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute top-0 right-0">
                        <div className="gradient-ai text-white text-xs font-semibold px-3 py-1 rounded-bl-xl">
                          Most Popular
                        </div>
                      </div>
                    )}

                    {/* Current plan badge */}
                    {isCurrentPlan && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-[#10B981] text-white text-xs font-semibold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Current Plan
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription className="text-xs">{plan.description}</CardDescription>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-4xl font-bold text-[#1E293B]">
                          ${plan.price}
                        </span>
                        <span className="text-sm text-[#64748B]">/month</span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-4">
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-[#475569]">
                            <Check className={`h-4 w-4 mt-0.5 shrink-0 ${
                              isCurrentPlan ? 'text-[#10B981]' : 'text-[#94A3B8]'
                            }`} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-2">
                      {isCurrentPlan ? (
                        isPaid ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleManageBilling}
                            isLoading={portalLoading}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Manage Billing
                          </Button>
                        ) : (
                          <div className="w-full text-center py-2.5 rounded-xl bg-[#F1F5F9] text-[#64748B] text-sm font-medium">
                            Your current plan
                          </div>
                        )
                      ) : isPaid ? (
                        <Button
                          className={`w-full border-0 text-white shadow-md ${
                            plan.id === 'pro'
                              ? 'gradient-ai shadow-blue-500/25 hover:shadow-blue-500/40'
                              : 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444] shadow-orange-500/25 hover:shadow-orange-500/40'
                          }`}
                          onClick={() => plan.priceId && handleCheckout(plan.priceId)}
                          isLoading={checkoutLoading === plan.priceId}
                          disabled={!plan.priceId || checkoutLoading !== null}
                        >
                          Upgrade to {plan.name}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        // Downgrade to free isn't handled via Stripe checkout
                        // Users should cancel from Manage Billing
                        <div className="w-full text-center py-2.5 rounded-xl bg-[#F1F5F9] text-[#64748B] text-sm font-medium">
                          Free forever
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ / Info */}
          <div className="mt-4 p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#1E293B] mb-3">Frequently asked questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-[#1E293B] mb-1">Can I cancel anytime?</p>
                <p className="text-[#64748B]">
                  Yes, you can cancel your subscription at any time. You&apos;ll retain access until the end of your billing period.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#1E293B] mb-1">How does upgrading work?</p>
                <p className="text-[#64748B]">
                  When you upgrade, you&apos;ll be charged a prorated amount for the remainder of your current billing period.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#1E293B] mb-1">What payment methods are accepted?</p>
                <p className="text-[#64748B]">
                  We accept all major credit cards through Stripe&apos;s secure payment processing.
                </p>
              </div>
              <div>
                <p className="font-medium text-[#1E293B] mb-1">Is my data secure?</p>
                <p className="text-[#64748B]">
                  Absolutely. All payments are processed through Stripe with bank-level encryption. We never store your card details.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
