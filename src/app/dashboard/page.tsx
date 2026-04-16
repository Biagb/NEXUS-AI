import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { Campaign } from '@/types';
import {
  Megaphone,
  Users,
  Mail,
  TrendingUp,
  MessageSquare,
  Image,
  Plus,
  FileText,
  Send,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
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

  const safeCampaigns: Campaign[] = (campaigns || []) as Campaign[];
  const totalCount = totalCampaigns || 0;
  const sentCount = sentCampaigns || 0;
  const subscribersCount = subscriberCount || 0;
  const deliveryRate = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0;

  const statusStyles = {
    draft: 'secondary',
    scheduled: 'warning',
    sent: 'success',
  } as const;

  const typeIcon = {
    email: Mail,
    sms: MessageSquare,
    banner: Image,
  } as const;

  const statCards = [
    {
      title: 'Total Campaigns',
      value: totalCount.toString(),
      subtitle: 'All campaigns',
      trend: totalCount > 0 ? `+${Math.min(totalCount * 4, 99)}%` : '0%',
      trendPositive: true,
      icon: Megaphone,
    },
    {
      title: 'Sent Campaigns',
      value: sentCount.toString(),
      subtitle: 'Successfully delivered',
      trend: sentCount > 0 ? `+${Math.min(sentCount * 5, 99)}%` : '0%',
      trendPositive: true,
      icon: Send,
    },
    {
      title: 'Subscribers',
      value: subscribersCount.toString(),
      subtitle: 'Reachable audience',
      trend: subscribersCount > 0 ? `+${Math.min(subscribersCount * 3, 99)}%` : '0%',
      trendPositive: true,
      icon: Users,
    },
    {
      title: 'Delivery Rate',
      value: `${deliveryRate}%`,
      subtitle: 'Campaign success',
      trend: `${Math.max(100 - deliveryRate, 0)}%`,
      trendPositive: deliveryRate >= 50,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="max-w-[1400px] p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold tracking-tight text-[#1E293B]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#64748B]">Welcome back! Here&apos;s an overview of your business.</p>
      </div>

      <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.title} className="rounded-xl border-[#E2E8F0] bg-white">
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-sm font-medium text-[#64748B]">{item.title}</p>
                <item.icon className="h-4 w-4 text-[#64748B]" />
              </div>
              <p className="mb-1 text-[30px] font-bold leading-none tracking-tight text-[#1E293B]">{item.value}</p>
              <p className="mb-2 text-xs text-[#94A3B8]">{item.subtitle}</p>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={item.trendPositive ? 'inline-flex items-center gap-1 font-semibold text-[#10B981]' : 'inline-flex items-center gap-1 font-semibold text-red-500'}>
                  {item.trendPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {item.trend}
                </span>
                <span className="text-[#94A3B8]">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2 rounded-xl border-[#E2E8F0] bg-white">
          <CardContent className="p-5">
            <div className="mb-4">
              <h2 className="text-[22px] font-bold tracking-tight text-[#1E293B]">Recent Campaigns</h2>
              <p className="mt-1 text-sm text-[#64748B]">
                You have {safeCampaigns.length} recent campaign{safeCampaigns.length === 1 ? '' : 's'}.
              </p>
            </div>

            <div className="space-y-2.5">
              {safeCampaigns.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center">
                  <p className="mb-4 text-sm text-[#64748B]">No campaigns yet</p>
                  <Link href="/dashboard/campaigns/new">
                    <Button variant="gradient" className="h-9 rounded-lg">Create your first campaign</Button>
                  </Link>
                </div>
              ) : (
                safeCampaigns.map((campaign) => {
                  const Icon = typeIcon[campaign.campaign_type];
                  return (
                    <Link
                      key={campaign.id}
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-3 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#475569]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1E293B] truncate">{campaign.title}</p>
                          <p className="text-sm text-[#64748B] truncate">
                            {campaign.subject_line || campaign.topic || formatDate(campaign.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <Badge variant={statusStyles[campaign.status]}>{campaign.status}</Badge>
                        <span className="text-xs font-semibold text-[#1E293B]">{campaign.campaign_type.toUpperCase()}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E2E8F0] bg-white">
          <CardContent className="p-5">
            <div className="mb-4">
              <h3 className="text-[20px] font-bold tracking-tight text-[#1E293B]">Quick Actions</h3>
              <p className="mt-1 text-sm text-[#64748B]">Frequently used actions for quick access.</p>
            </div>

            <div className="mb-5 space-y-2">
              <Link href="/dashboard/campaigns/new" className="block">
                <Button variant="gradient" className="h-10 w-full justify-start rounded-lg shadow-none">
                  <Plus className="h-4 w-4 mr-2.5" />
                  New Campaign
                </Button>
              </Link>
              <Link href="/dashboard/campaigns" className="block">
                <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-[#E2E8F0] text-[#1E293B]">
                  <FileText className="h-4 w-4 mr-2.5" />
                  Create Report
                </Button>
              </Link>
              <Link href="/dashboard/subscribers" className="block">
                <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-[#E2E8F0] text-[#1E293B]">
                  <Send className="h-4 w-4 mr-2.5 text-[#10B981]" />
                  Send Campaign
                </Button>
              </Link>
              <Link href="/dashboard/settings" className="block">
                <Button variant="outline" className="h-10 w-full justify-start rounded-lg border-[#E2E8F0] text-[#1E293B]">
                  <Calendar className="h-4 w-4 mr-2.5" />
                  Schedule Campaign
                </Button>
              </Link>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-[#475569]">Campaign Delivery</p>
                <p className="text-sm font-semibold text-[#1E293B]">{deliveryRate}%</p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className="h-full bg-[#1E293B]"
                  style={{ width: `${deliveryRate}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[#64748B]">
                {sentCount} of {totalCount} campaigns sent
              </p>
              <p className="mt-1 text-xs font-medium text-[#10B981]">System stable and ready</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="mt-3 flex justify-end">
        <Link href="/dashboard/campaigns" className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium">
          View all campaigns →
        </Link>
      </div>
    </div>
  );
}
