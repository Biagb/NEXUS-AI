'use client';

import { CampaignGenerator } from '@/components/campaigns';

export default function NewCampaignPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
        <p className="text-gray-500 mt-1">
          Let AI generate compelling marketing content for you
        </p>
      </div>

      {/* Campaign Generator */}
      <CampaignGenerator />
    </div>
  );
}
