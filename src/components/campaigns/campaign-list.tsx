import Link from 'next/link';
import { Campaign } from '@/types';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { Mail, MessageSquare, Image, Plus, Sparkles, CalendarDays, Users, ArrowUpRight } from 'lucide-react';

interface CampaignListProps {
  campaigns: Campaign[];
}

const campaignTypeIcons = {
  email: Mail,
  sms: MessageSquare,
  banner: Image,
};

const campaignTypeLabels = {
  email: 'Email',
  sms: 'SMS',
  banner: 'Banner',
};

const statusColors = {
  draft: 'secondary',
  scheduled: 'warning',
  sent: 'success',
} as const;

export function CampaignList({ campaigns }: CampaignListProps) {
  const draftCount = campaigns.filter((campaign) => campaign.status === 'draft').length;
  const sentCount = campaigns.filter((campaign) => campaign.status === 'sent').length;
  const totalRecipients = campaigns.reduce((sum, campaign) => sum + campaign.recipient_count, 0);

  if (campaigns.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF]">
            <Sparkles className="h-6 w-6 text-[#4F46E5]" />
          </div>
          <CardTitle>No campaigns yet</CardTitle>
          <CardDescription>
            Start with your first AI-generated campaign and launch it in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8 pt-0 text-center">
          <Link href="/dashboard/campaigns/new">
            <Button variant="gradient">
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#64748B]">Total Campaigns</p>
            <p className="mt-2 text-2xl font-semibold text-[#1E293B]">{campaigns.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#64748B]">Drafts</p>
            <p className="mt-2 text-2xl font-semibold text-[#1E293B]">{draftCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-[#64748B]">Total Recipients</p>
            <p className="mt-2 text-2xl font-semibold text-[#1E293B]">{totalRecipients}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {campaigns.map((campaign) => {
          const Icon = campaignTypeIcons[campaign.campaign_type];

          return (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="block"
            >
              <Card className="h-full hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <h3 className="line-clamp-1 text-base font-semibold text-[#1E293B]">
                        {campaign.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <Icon className="h-3.5 w-3.5" />
                          {campaignTypeLabels[campaign.campaign_type]}
                        </Badge>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(campaign.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {campaign.recipient_count} recipients
                    </span>
                  </div>

                  {campaign.subject_line && (
                    <p className="line-clamp-1 rounded-lg bg-[#F8FAFC] px-3 py-2 text-sm text-[#475569]">
                      Subject: {campaign.subject_line}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {sentCount > 0 && (
        <p className="text-sm text-[#64748B]">
          {sentCount} campaign{sentCount > 1 ? 's' : ''} already delivered.
        </p>
      )}
    </div>
  );
}
