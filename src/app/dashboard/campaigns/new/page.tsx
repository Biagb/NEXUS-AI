'use client';

import { CampaignGenerator } from '@/components/campaigns';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NewCampaignPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4">
        <Link href="/dashboard/campaigns" className="w-fit">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
            <Sparkles className="h-3.5 w-3.5" />
            AI Campaign Studio
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Create New Campaign</h1>
          <p className="mt-2 text-[#64748B]">
            Describe your goal and generate campaign-ready content in seconds.
          </p>
        </div>
      </div>

      <CampaignGenerator />
    </div>
  );
}
