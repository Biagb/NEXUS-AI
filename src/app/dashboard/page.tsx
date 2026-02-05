import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatsCard, RecentCampaigns } from '@/components/dashboard';
import { Button } from '@/components/ui';
import { Megaphone, Users, Mail, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

// Prevent static generation - requires runtime for Supabase
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Check if onboarding is complete
  if (!profile?.company_name) {
    redirect('/onboarding');
  }

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch subscriber count
  const { count: subscriberCount } = await supabase
    .from('subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Fetch campaign stats
  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: sentCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'sent');

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile.company_name}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s what&apos;s happening with your marketing
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Campaigns"
          value={totalCampaigns || 0}
          icon={Megaphone}
          description="All time"
        />
        <StatsCard
          title="Sent Campaigns"
          value={sentCampaigns || 0}
          icon={Mail}
          description="Successfully delivered"
        />
        <StatsCard
          title="Total Subscribers"
          value={subscriberCount || 0}
          icon={Users}
          description="Active contacts"
        />
        <StatsCard
          title="Engagement Rate"
          value="--"
          icon={TrendingUp}
          description="Coming soon"
        />
      </div>

      {/* Recent Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentCampaigns campaigns={campaigns || []} />
        
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Ready to grow?</h3>
          <p className="text-blue-100 mb-6">
            Create AI-powered marketing campaigns in seconds. Our AI generates
            compelling content tailored to your brand.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard/campaigns/new" className="block">
              <Button variant="secondary" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Create Email Campaign
              </Button>
            </Link>
            <Link href="/dashboard/subscribers" className="block">
              <Button variant="outline" className="w-full justify-start bg-transparent border-white/30 text-white hover:bg-white/10">
                <Users className="h-4 w-4 mr-2" />
                Manage Subscribers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
