import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CampaignList } from '@/components/campaigns';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// Prevent static generation - requires runtime for Supabase
export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 mt-1">
            Create and manage your AI-powered marketing campaigns
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Campaign List */}
      <CampaignList campaigns={campaigns || []} />
    </div>
  );
}
