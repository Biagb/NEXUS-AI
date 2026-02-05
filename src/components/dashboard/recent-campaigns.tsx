import Link from 'next/link';
import { Campaign } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { Mail, MessageSquare, Image, ArrowRight } from 'lucide-react';

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
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No campaigns yet</p>
            <Link
              href="/dashboard/campaigns/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Create your first campaign →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Campaigns</CardTitle>
        <Link
          href="/dashboard/campaigns"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const Icon = campaignTypeIcons[campaign.campaign_type];
            return (
              <Link
                key={campaign.id}
                href={`/dashboard/campaigns/${campaign.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{campaign.title}</p>
                    <p className="text-sm text-gray-500">
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
