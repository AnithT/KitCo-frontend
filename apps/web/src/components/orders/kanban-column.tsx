'use client';

import type { OrderOut } from '@kitco/api-client';
import type { OrderStatus } from '@kitco/shared';
import { OrderCard } from './order-card';
import { cn } from '@/lib/utils';

export function KanbanColumn({
  status,
  label,
  orders,
  newOrderIds,
  onCardClick,
}: {
  status: OrderStatus;
  label: string;
  orders: OrderOut[];
  newOrderIds: Set<string>;
  onCardClick: (order: OrderOut) => void;
}) {
  const accent = ACCENTS[status];

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-lg bg-muted/40 border border-border">
      <div className={cn('flex items-center justify-between gap-2 border-b border-border px-3 py-2.5')}>
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', accent)} />
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums ring-1 ring-inset ring-border">
          {orders.length}
        </span>
      </div>
      <div className="flex-1 space-y-2 p-2 overflow-y-auto scrollbar-thin">
        {orders.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
            No orders
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isNew={newOrderIds.has(order.id)}
              onClick={() => onCardClick(order)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const ACCENTS: Record<OrderStatus, string> = {
  pending: 'bg-warning',
  accepted: 'bg-info',
  in_prep: 'bg-primary',
  ready: 'bg-success',
  out_for_delivery: 'bg-info',
  completed: 'bg-muted-foreground',
  rejected: 'bg-destructive',
  cancelled: 'bg-destructive',
};
