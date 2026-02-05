'use client';

import { useState } from 'react';
import { Subscriber } from '@/types';
import { Badge, Button, Card, CardContent, useToast } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import { User, Mail, Phone, Tag, Trash2, Edit2, MoreVertical, UserPlus, Search } from 'lucide-react';
import { AddSubscriberModal } from './add-subscriber-modal';

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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase.from('subscribers').delete().eq('id', id);
      if (error) throw error;
      addToast('success', 'Subscriber deleted');
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{subscribers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {subscribers.filter((s) => s.subscribed).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">With Email</p>
            <p className="text-2xl font-bold text-blue-600">
              {subscribers.filter((s) => s.email).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">With Phone</p>
            <p className="text-2xl font-bold text-purple-600">
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
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching subscribers' : 'No subscribers yet'}
              </h3>
              <p className="text-gray-500 mb-6">
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
            <Card key={subscriber.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {subscriber.first_name || subscriber.last_name
                            ? `${subscriber.first_name || ''} ${subscriber.last_name || ''}`.trim()
                            : 'Unnamed Subscriber'}
                        </h3>
                        <Badge variant={subscriber.subscribed ? 'success' : 'secondary'}>
                          {subscriber.subscribed ? 'Active' : 'Unsubscribed'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-sm text-gray-500">
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
                          <Tag className="h-3 w-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {subscriber.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
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
                      onClick={() => handleDelete(subscriber.id)}
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
    </div>
  );
}
