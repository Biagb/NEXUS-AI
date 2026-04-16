'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
  { name: 'Subscribers', href: '/dashboard/subscribers', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-[#E2E8F0]/60">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl gradient-ai flex items-center justify-center shadow-sm shadow-blue-500/20">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-[#1E293B] tracking-tight">NEXUS-AI</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-all duration-200"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-[#0F172A]/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 z-40 h-full w-[272px] bg-white transform transition-transform duration-300 ease-out shadow-2xl shadow-[#0F172A]/10',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full pt-16 pb-4">
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'sidebar-active bg-[#1E293B] text-white shadow-md shadow-[#1E293B]/20'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-3 pt-2 border-t border-[#F1F5F9]">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-[18px] w-[18px] mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[264px] lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-[#E2E8F0]/60">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-6 py-5">
            <div className="w-9 h-9 rounded-xl gradient-ai flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1E293B] tracking-tight">NEXUS-AI</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'sidebar-active bg-[#1E293B] text-white shadow-md shadow-[#1E293B]/20'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E293B]'
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.name}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-60" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-[#F1F5F9]">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-[18px] w-[18px] mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-[264px]">
        <main className="min-h-screen pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
