'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Textarea, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast } from '@/components/ui';
import { Sparkles, Mail, MessageSquare, Image, Wand2 } from 'lucide-react';
import { GenerateCampaignRequest, GenerateCampaignResponse, ApiResponse } from '@/types';

const campaignTypes = [
  {
    value: 'email',
    label: 'Email Campaign',
    description: 'Subject line and long-form body tailored for inbox delivery.',
    icon: Mail,
  },
  {
    value: 'sms',
    label: 'SMS Campaign',
    description: 'Short and direct message optimized for mobile audiences.',
    icon: MessageSquare,
  },
  {
    value: 'banner',
    label: 'Banner Only',
    description: 'Visual-first campaign with generated banner creative.',
    icon: Image,
  },
];

export function CampaignGenerator() {
  const router = useRouter();
  const { addToast } = useToast();

  const [topic, setTopic] = useState('');
  const [campaignType, setCampaignType] = useState<'email' | 'sms' | 'banner'>('email');
  const [targetAudience, setTargetAudience] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      addToast('error', 'Please enter a campaign topic');
      return;
    }

    setIsGenerating(true);

    try {
      const payload: GenerateCampaignRequest = {
        topic,
        campaignType,
        targetAudience: targetAudience || undefined,
        additionalContext: additionalContext || undefined,
      };

      const response = await fetch('/api/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<GenerateCampaignResponse> = await response.json();

      if (!data.success || !data.data) {
        addToast('error', data.error || 'Failed to generate campaign');
        return;
      }

      addToast('success', 'Campaign generated successfully!');
      router.push(`/dashboard/campaigns/${data.data.campaignId}`);
    } catch (error) {
      console.error('Generation error:', error);
      addToast('error', 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader className="space-y-4 border-b border-[#E2E8F0]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Campaign Builder</Badge>
        </div>
        <div>
          <CardTitle className="flex items-center gap-2">
            Create Your Next Campaign
          </CardTitle>
          <CardDescription className="mt-2">
            Pick a format, describe the campaign intent, and generate polished content in one click.
          </CardDescription>
        </div>
      </CardHeader>
      <form onSubmit={handleGenerate}>
        <CardContent className="space-y-6">
          <div>
            <Label required>Campaign Type</Label>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {campaignTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setCampaignType(type.value as typeof campaignType)}
                  className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    campaignType === type.value
                      ? 'border-[#3B82F6] bg-[#EFF6FF]'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${campaignType === type.value ? 'bg-[#DBEAFE]' : 'bg-[#F8FAFC]'}`}>
                      <type.icon className={`h-5 w-5 ${campaignType === type.value ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#1E293B]">{type.label}</p>
                      <p className="text-xs text-[#64748B]">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="topic" required>
              Campaign Topic
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Black Friday Sale, New Product Launch, Summer Collection"
              className="mt-1"
            />
            <p className="mt-1 text-sm text-[#64748B]">What is the campaign about?</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="targetAudience">Target Audience (optional)</Label>
              <Input
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Young professionals, Parents, Tech enthusiasts"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="additionalContext">Additional Context (optional)</Label>
              <Textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Offers, deadlines, tone, or key points to include"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="justify-end border-t border-[#E2E8F0] pt-6">
          <Button
            type="submit"
            variant="gradient"
            isLoading={isGenerating}
            disabled={!topic.trim() || isGenerating}
          >
            {isGenerating ? 'Generating with AI...' : 'Generate Campaign'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
