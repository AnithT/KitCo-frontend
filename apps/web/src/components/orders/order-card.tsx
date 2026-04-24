'use client';

import { Phone, Clock, ShoppingBag } from 'lucide-react';
import type { OrderOut } from '@kitco/api-client';
import { formatGBP, formatPhoneDisplay } from '@kitco/shared';
import { cn } from '@/lib/utils';
import { useElapsedSeconds, formatElapsed } from '@/hooks/use-elapsed';

const SLA_BY_STATUS: Partial<Record<string, number>> = {
  pending: 180,
  accepted: 300,
  in_prep: 1200,
  ready: 600,
};

export function OrderCard({
  order,
  onClick,
  isNew,
}: {
  order: OrderOut;
  onClick: () => void;
  isNew?: boolean;
}) {
  const elapsed = useElapsedSeconds(order.created_at);
  const sla = SLA_BY_STATUS[order.status];
  const overSla = sla !== undefined && elapsed > sla;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full rounded-lg border bg-card p-3 text-left shadow-sm transition-all',
        'hover:shadow-md hover:border-primary/40 hover:-translate-y-px',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isNew && 'ring-2 ring-primary animate-pulse-soft',
        overSla && 'border-destructive/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground truncate">
            {order.customer_name ?? 'Walk-in'}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="truncate">{formatPhoneDisplay(order.customer_phone)}</span>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
            overSla
              ? 'bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/30'
              : 'bg-muted text-muted-foreground',
          )}
          title="Time since received"
        >
          <Clock className="h-3 w-3" />
          {formatElapsed(elapsed)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
        </div>
        <span className="font-semibold text-foreground tabular-nums">
          {formatGBP(order.total_amount)}
        </span>
      </div>
    </button>
  );
}
