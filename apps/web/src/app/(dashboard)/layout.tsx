'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/top-bar';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthGuard();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Spinner className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
