'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Textarea, Select, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, useToast, Spinner } from '@/components/ui';
import { Sparkles, Mail, MessageSquare, Image } from 'lucide-react';
import { GenerateCampaignRequest, GenerateCampaignResponse, ApiResponse } from '@/types';

const campaignTypes = [
  { value: 'email', label: 'Email Campaign', icon: Mail },
  { value: 'sms', label: 'SMS Campaign', icon: MessageSquare },
  { value: 'banner', label: 'Banner Only', icon: Image },
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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          AI Campaign Generator
        </CardTitle>
        <CardDescription>
          Describe your campaign idea and let AI create compelling marketing content
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleGenerate}>
        <CardContent className="space-y-6">
          {/* Campaign Type Selection */}
          <div>
            <Label required>Campaign Type</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {campaignTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setCampaignType(type.value as typeof campaignType)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    campaignType === type.value
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <type.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Campaign Topic */}
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
            <p className="mt-1 text-sm text-gray-500">
              What is your campaign about?
            </p>
          </div>

          {/* Target Audience (optional) */}
          <div>
            <Label htmlFor="targetAudience">
              Target Audience (optional)
            </Label>
            <Input
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Young professionals, Parents, Tech enthusiasts"
              className="mt-1"
            />
          </div>

          {/* Additional Context (optional) */}
          <div>
            <Label htmlFor="additionalContext">
              Additional Context (optional)
            </Label>
            <Textarea
              id="additionalContext"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Any specific details, offers, or key messages you want to include..."
              className="mt-1"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            isLoading={isGenerating}
            disabled={!topic.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Campaign
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
