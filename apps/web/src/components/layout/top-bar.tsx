'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, PanelLeftClose, PanelLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import { useUiStore } from '@/lib/ui-store';
import { useToast } from '@/components/ui/toast';

export function TopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const email = useAuthStore((s) => s.email);
  const clear = useAuthStore((s) => s.clear);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const toggleSound = useUiStore((s) => s.toggleSound);

  function logout() {
    clear();
    toast({ title: 'Signed out' });
    router.replace('/login');
  }

  const kitchenLabel = email?.split('@')[0] ?? 'My kitchen';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/80 backdrop-blur px-4 lg:px-6">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={toggleSidebar}
        className="hidden lg:inline-flex rounded-md p-2 text-muted-foreground hover:bg-muted"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-sm font-semibold truncate">{kitchenLabel}</span>
        <span className="text-xs text-muted-foreground truncate">{email}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          aria-label={soundEnabled ? 'Mute new-order sound' : 'Unmute new-order sound'}
          title={soundEnabled ? 'Sound on' : 'Sound off'}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={logout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
