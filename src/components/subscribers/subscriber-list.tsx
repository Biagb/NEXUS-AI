'use client';

import { useState } from 'react';
import { Subscriber } from '@/types';
import { Badge, Button, Card, CardContent, useToast } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { User, Mail, Phone, Tag, Trash2, UserPlus, Search, X } from 'lucide-react';
import { AddSubscriberModal } from './index';

interface SubscriberListProps {
  subscribers: Subscriber[];
  onRefresh: () => void;
}

export function SubscriberList({ subscribers, onRefresh }: SubscriberListProps) {
  const supabase = createClient();
  const { addToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<Subscriber | null>(null);

  const filteredSubscribers = subscribers.filter((sub) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sub.email?.toLowerCase().includes(searchLower) ||
      sub.phone?.includes(searchTerm) ||
      sub.first_name?.toLowerCase().includes(searchLower) ||
      sub.last_name?.toLowerCase().includes(searchLower) ||
      sub.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  });

  const handleDelete = async () => {
    if (!subscriberToDelete) return;

    const id = subscriberToDelete.id;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id);
      if (error) throw error;
      addToast('success', 'Subscriber deleted');
      setSubscriberToDelete(null);
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      addToast('error', 'Failed to delete subscriber');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSubscription = async (subscriber: Subscriber) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ subscribed: !subscriber.subscribed })
        .eq('id', subscriber.id);
      
      if (error) throw error;
      addToast('success', subscriber.subscribed ? 'Subscriber unsubscribed' : 'Subscriber resubscribed');
      onRefresh();
    } catch (error) {
      console.error('Toggle error:', error);
      addToast('error', 'Failed to update subscription status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#3B82F6]/40 focus:border-[#3B82F6] transition-all text-sm text-[#1E293B] placeholder:text-[#94A3B8]"
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Subscriber
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-[#64748B]">Total</p>
            <p className="text-2xl font-bold text-[#1E293B]">{subscribers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-[#64748B]">Active</p>
            <p className="text-2xl font-bold text-[#10B981]">
              {subscribers.filter((s) => s.subscribed).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-[#64748B]">With Email</p>
            <p className="text-2xl font-bold text-[#3B82F6]">
              {subscribers.filter((s) => s.email).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-[#64748B]">With Phone</p>
            <p className="text-2xl font-bold text-[#8B5CF6]">
              {subscribers.filter((s) => s.phone).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {filteredSubscribers.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-medium text-[#1E293B] mb-2">
                {searchTerm ? 'No matching subscribers' : 'No subscribers yet'}
              </h3>
              <p className="text-[#64748B] mb-6">
                {searchTerm ? 'Try a different search term' : 'Add your first subscriber to get started'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Subscriber
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSubscribers.map((subscriber) => (
            <Card key={subscriber.id} className="hover:shadow-md hover:shadow-[#1E293B]/5 transition-all duration-200">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#F1F5F9] rounded-full">
                      <User className="h-5 w-5 text-[#475569]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[#1E293B]">
                          {subscriber.first_name || subscriber.last_name
                            ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                            : 'Unnamed Subscriber'}
                        </h3>
                        <Badge variant={subscriber.subscribed ? 'success' : 'secondary'}>
                          {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-[#64748B]">
                        {subscriber.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {subscriber.email}
                          </span>
                        )}
                        {subscriber.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {subscriber.phone}
                          </span>
                        )}
                      </div>
                      {subscriber.tags && subscriber.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="h-3 w-3 text-[#94A3B8]" />
                          <div className="flex flex-wrap gap-1">
                            {subscriber.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-[#94A3B8] mt-2">
                        Added {formatDate(subscriber.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSubscription(subscriber)}
                    >
                      {subscriber.subscribed ? 'Unsubscribe' : 'Resubscribe'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSubscriberToDelete(subscriber)}
                      disabled={deletingId === subscriber.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddSubscriberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          onRefresh();
        }}
      />

      {subscriberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (deletingId !== subscriberToDelete.id) {
                setSubscriberToDelete(null);
              }
            }}
          />

          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1E293B]">Delete subscriber?</h2>
              <button
                onClick={() => setSubscriberToDelete(null)}
                disabled={deletingId === subscriberToDelete.id}
                className="text-[#94A3B8] hover:text-[#475569] transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-[#64748B] mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-[#1E293B]">
                {subscriberToDelete.first_name || subscriberToDelete.last_name
                  ? `${subscriberToDelete.first_name || ''} ${subscriberToDelete.last_name || ''}`.trim()
                  : subscriberToDelete.email || subscriberToDelete.phone || 'this subscriber'}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubscriberToDelete(null)}
                disabled={deletingId === subscriberToDelete.id}
              >
                No
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                isLoading={deletingId === subscriberToDelete.id}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
