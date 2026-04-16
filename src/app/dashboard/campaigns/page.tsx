import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CampaignList } from '@/components/campaigns';
import { Button } from '@/components/ui';
import { Plus, Sparkles } from 'lucide-react';
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
            <Sparkles className="h-3.5 w-3.5" />
            Campaign Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Campaigns</h1>
          <p className="mt-2 text-[#64748B]">
            Design, review, and launch all your AI-powered campaigns from one place.
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button variant="gradient">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      <CampaignList campaigns={campaigns || []} />
    </div>
  );
}
