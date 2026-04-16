import Link from 'next/link';
import { Campaign } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { Mail, MessageSquare, Image, ArrowRight, Megaphone } from 'lucide-react';

interface RecentCampaignsProps {
  campaigns: Campaign[];
}

const campaignTypeIcons = {
  email: Mail,
  sms: MessageSquare,
  banner: Image,
};

const statusColors = {
  draft: 'secondary',
  scheduled: 'warning',
  sent: 'success',
} as const;

export function RecentCampaigns({ campaigns }: RecentCampaignsProps) {
  if (campaigns.length === 0) {
    return (
      <Card className="border-[#E2E8F0]/80 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1E293B]">Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-5 w-5 text-[#94A3B8]" />
            </div>
            <p className="text-[#64748B] mb-3 text-sm">No campaigns yet</p>
            <Link
              href="/dashboard/campaigns/new"
              className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium inline-flex items-center gap-1 transition-colors"
            >
              Create your first campaign
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E2E8F0]/80 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg text-[#1E293B]">Recent Campaigns</CardTitle>
        <Link
          href="/dashboard/campaigns"
          className="text-sm text-[#3B82F6] hover:text-[#2563EB] flex items-center gap-1 font-medium transition-colors"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {campaigns.map((campaign) => {
            const Icon = campaignTypeIcons[campaign.campaign_type];
            return (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-[#E2E8F0]/70 bg-[#F8FAFC]/60 hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-[#E2E8F0]/80 rounded-xl group-hover:border-[#CBD5E1] transition-colors duration-200">
                    <Icon className="h-[18px] w-[18px] text-[#475569]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1E293B]">{campaign.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {formatDate(campaign.created_at)}
                    </p>
                  </div>
                </div>
                <Badge variant={statusColors[campaign.status]}>
                  {campaign.status}
                </Badge>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
