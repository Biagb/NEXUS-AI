'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Campaign } from '@/types';
import { Button, Input, Textarea, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent, useToast } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { Mail, MessageSquare, Send, Edit2, Save, X, Trash2, ArrowLeft, Image as ImageIcon, CalendarDays, Users } from 'lucide-react';

interface CampaignDetailProps {
  campaign: Campaign;
}

const statusColors = {
  draft: 'secondary',
  scheduled: 'warning',
  sent: 'success',
} as const;

export function CampaignDetail({ campaign: initialCampaign }: CampaignDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  const [campaign, setCampaign] = useState(initialCampaign);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(campaign.generated_text || '');
  const [editedSubject, setEditedSubject] = useState(campaign.subject_line || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          generated_text: editedText,
          subject_line: editedSubject,
        })
        .eq('id', campaign.id);

      if (error) throw error;

      setCampaign({ ...campaign, generated_text: editedText, subject_line: editedSubject });
      setIsEditing(false);
      addToast('success', 'Campaign updated successfully');
    } catch (error) {
      console.error('Save error:', error);
      addToast('error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const endpoint = campaign.campaign_type === 'sms' ? '/api/send-sms' : '/api/send-email';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      });

      const data = await response.json();

      if (!data.success) {
        addToast('error', data.error || 'Failed to send campaign');
        return;
      }

      setCampaign({ ...campaign, status: 'sent', sent_at: new Date().toISOString() });
      addToast('success', data.message || 'Campaign sent successfully!');
    } catch (error) {
      console.error('Send error:', error);
      addToast('error', 'Failed to send campaign');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      addToast('success', 'Campaign deleted');
      router.push('/dashboard/campaigns');
    } catch (error) {
      console.error('Delete error:', error);
      addToast('error', 'Failed to delete campaign');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelEdit = () => {
    setEditedText(campaign.generated_text || '');
    setEditedSubject(campaign.subject_line || '');
    setIsEditing(false);
  };

  const campaignTypeLabel = campaign.campaign_type === 'email' ? 'Email' : campaign.campaign_type === 'sms' ? 'SMS' : 'Banner';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" onClick={() => router.push('/dashboard/campaigns')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">{campaign.title}</h1>
            <p className="mt-1 text-[#64748B]">Created {formatDateTime(campaign.created_at)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
          <Badge variant="outline">{campaignTypeLabel}</Badge>

          {campaign.status === 'draft' && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

          {campaign.status === 'draft' && (
            <Button variant="gradient" size="sm" onClick={handleSend} isLoading={isSending}>
              <Send className="mr-2 h-4 w-4" />
              Send Campaign
            </Button>
          )}

          {campaign.status === 'draft' && (
            <Button variant="destructive" size="sm" onClick={handleDelete} isLoading={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          {campaign.generated_image_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generated Banner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#F1F5F9]">
                  <Image
                    src={campaign.generated_image_url}
                    alt="Campaign banner"
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {campaign.campaign_type === 'email' && (
            <Card>
              <CardHeader>
                <CardTitle>Subject Line</CardTitle>
                <CardDescription>This line appears in your recipient inbox.</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={editedSubject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    placeholder="Enter campaign subject"
                  />
                ) : (
                  <p className="rounded-lg bg-[#F8FAFC] px-3 py-2 text-base text-[#1E293B]">
                    {campaign.subject_line || 'No subject line'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Campaign Content</CardTitle>
                <CardDescription>Review and refine the generated content before sending.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={12}
                    className="font-mono"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap rounded-xl bg-[#F8FAFC] p-4 font-sans text-[#334155]">
                  {campaign.generated_text || 'No content generated for this campaign.'}
                </pre>
              )}
            </CardContent>
          </Card>

          {campaign.status === 'sent' && (
            <Card className="border-[#10B981]/20 bg-[#10B981]/5">
              <CardContent className="pt-6">
                <p className="font-medium text-[#059669]">
                  Campaign sent on {campaign.sent_at ? formatDateTime(campaign.sent_at) : 'N/A'}
                </p>
                <p className="mt-1 text-sm text-[#10B981]">
                  Delivered to {campaign.recipient_count} recipients
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B]">Type</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#1E293B]">
                  {campaign.campaign_type === 'email' && <Mail className="h-4 w-4" />}
                  {campaign.campaign_type === 'sms' && <MessageSquare className="h-4 w-4" />}
                  {campaignTypeLabel}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B]">Created</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#1E293B]">
                  <CalendarDays className="h-4 w-4 text-[#94A3B8]" />
                  {formatDateTime(campaign.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748B]">Recipients</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-[#1E293B]">
                  <Users className="h-4 w-4 text-[#94A3B8]" />
                  {campaign.recipient_count}
                </span>
              </div>
              {campaign.sent_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#64748B]">Sent</span>
                  <span className="font-medium text-[#1E293B]">{formatDateTime(campaign.sent_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign.status === 'draft' && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Notice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#64748B]">
                  Sending will deliver this campaign to all active subscribers
                  {campaign.campaign_type === 'email' ? ' via email.' : ' via SMS.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
