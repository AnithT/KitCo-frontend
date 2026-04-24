'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  UtensilsCrossed,
  Users,
  Megaphone,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/ui-store';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const nav: NavItem[] = [
  { label: 'Orders', href: '/orders', icon: LayoutGrid },
  { label: 'Menus', href: '/menus', icon: UtensilsCrossed },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Broadcasts', href: '/broadcasts', icon: Megaphone },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all',
          'lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-16' : 'lg:w-60',
          'w-64',
        )}
      >
        <div
          className={cn(
            'flex h-14 items-center border-b border-border px-4 gap-2',
            collapsed && 'lg:justify-center lg:px-0',
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shrink-0">
            K
          </div>
          {!collapsed && (
            <span className="text-base font-semibold tracking-tight">KitCo</span>
          )}
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  collapsed && 'lg:justify-center lg:px-0',
                  active
                    ? 'bg-primary-soft text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={cn('p-3 text-xs text-muted-foreground', collapsed && 'lg:hidden')}>
          v0.1 · KitCo console
        </div>
      </aside>
    </>
  );
}
