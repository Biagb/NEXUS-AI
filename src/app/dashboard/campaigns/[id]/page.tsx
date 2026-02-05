import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { CampaignDetail } from '@/components/campaigns';

// Prevent static generation - requires runtime for Supabase
export const dynamic = 'force-dynamic';

interface CampaignPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !campaign) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-8">
      <CampaignDetail campaign={campaign} />
    </div>
  );
}
