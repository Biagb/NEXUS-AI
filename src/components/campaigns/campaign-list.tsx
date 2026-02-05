import Link from 'next/link';
import { Campaign } from '@/types';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { Mail, MessageSquare, Image, Plus, Search } from 'lucide-react';

interface CampaignListProps {
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

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first AI-powered marketing campaign
            </p>
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const Icon = campaignTypeIcons[campaign.campaign_type];
        return (
          <Link
            key={campaign.id}
            href={`/dashboard/campaigns/${campaign.id}`}
            className="block"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">
                          {formatDate(campaign.created_at)}
                        </span>
                        {campaign.recipient_count > 0 && (
                          <span className="text-sm text-gray-500">
                            • {campaign.recipient_count} recipients
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusColors[campaign.status]}>
                    {campaign.status}
                  </Badge>
                </div>
                {campaign.subject_line && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-1 pl-16">
                    Subject: {campaign.subject_line}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
