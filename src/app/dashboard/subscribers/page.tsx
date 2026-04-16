'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscriber } from '@/types';
import { SubscriberList } from '@/components/subscribers';
import { LoadingScreen } from '@/components/ui';

export default function SubscribersPage() {
  const supabase = createClient();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  if (isLoading) {
    return <LoadingScreen message="Loading subscribers..." />;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Subscribers</h1>
        <p className="text-[#64748B] mt-1">
          Manage your contacts and subscriber list
        </p>
      </div>

      {/* Subscriber List */}
      <SubscriberList subscribers={subscribers} onRefresh={fetchSubscribers} />
    </div>
  );
}
