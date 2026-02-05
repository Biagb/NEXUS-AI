'use client';

import { Sidebar } from '@/components/dashboard';
import { ToastProvider } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Sidebar>{children}</Sidebar>
    </ToastProvider>
  );
}
