'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Campaign } from '@/types';
import { Button, Textarea, Badge, Card, CardHeader, CardTitle, CardContent, useToast, Spinner } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { Mail, MessageSquare, Send, Edit2, Save, X, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
            <p className="text-gray-500 mt-1">
              Created {formatDateTime(campaign.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusColors[campaign.status]}>{campaign.status}</Badge>
          {campaign.campaign_type === 'email' && <Mail className="h-5 w-5 text-gray-400" />}
          {campaign.campaign_type === 'sms' && <MessageSquare className="h-5 w-5 text-gray-400" />}
        </div>
      </div>

      {/* Generated Image */}
      {campaign.generated_image_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Generated Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
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

      {/* Subject Line (for emails) */}
      {campaign.campaign_type === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Line</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <input
                type="text"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-lg font-medium">{campaign.subject_line || 'No subject'}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Content</CardTitle>
          {campaign.status === 'draft' && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={10}
                className="font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} isLoading={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-lg">
                {campaign.generated_text || 'No content'}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {campaign.status === 'draft' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1"
                onClick={handleSend}
                isLoading={isSending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Campaign
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Sending will deliver this campaign to all your active subscribers
              {campaign.campaign_type === 'email' ? ' via email' : ' via SMS'}.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sent Info */}
      {campaign.status === 'sent' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-green-800 font-medium">
                ✓ Campaign sent on {campaign.sent_at && formatDateTime(campaign.sent_at)}
              </p>
              <p className="text-green-600 text-sm mt-1">
                Delivered to {campaign.recipient_count} recipients
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
