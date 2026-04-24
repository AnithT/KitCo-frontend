'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Phone, MapPin, FileText, Receipt } from 'lucide-react';
import { ApiError, orders, type OrderOut } from '@kitco/api-client';
import {
  formatGBP,
  formatPhoneDisplay,
  formatDateTime,
  nextStatuses,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@kitco/shared';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from './order-status-badge';
import { Spinner } from '@/components/ui/spinner';
import { Separator } from '@/components/ui/separator';
import { getApiClient } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

export function OrderDrawer({
  order,
  open,
  onOpenChange,
}: {
  order: OrderOut | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const update = useMutation({
    mutationFn: async ({ status }: { status: OrderStatus }) => {
      if (!order) throw new Error('No order');
      return orders.updateOrderStatus(getApiClient(), order.id, { status });
    },
    onSuccess: (next) => {
      qc.invalidateQueries({ queryKey: orders.orderKeys.lists() });
      qc.setQueryData(orders.orderKeys.detail(next.id), next);
      toast({
        title: 'Status updated',
        description: `Marked as ${ORDER_STATUS_LABELS[next.status]}.`,
        variant: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'Could not update',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent side="right" className="p-0">
        {order && (
          <>
            <DialogHeader className="border-b">
              <div className="flex items-center justify-between gap-3 pr-8">
                <DialogTitle>{order.customer_name ?? 'Walk-in'}</DialogTitle>
                <OrderStatusBadge status={order.status} />
              </div>
              <DialogDescription>
                Order placed {formatDateTime(order.created_at)}
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone">
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="text-primary hover:underline"
                  >
                    {formatPhoneDisplay(order.customer_phone)}
                  </a>
                </InfoRow>
                <InfoRow icon={<Receipt className="h-4 w-4" />} label="Total">
                  <span className="font-semibold tabular-nums">
                    {formatGBP(order.total_amount)}
                  </span>
                </InfoRow>
                {order.delivery_address && (
                  <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" full>
                    {order.delivery_address}
                  </InfoRow>
                )}
                {order.notes && (
                  <InfoRow icon={<FileText className="h-4 w-4" />} label="Notes" full>
                    {order.notes}
                  </InfoRow>
                )}
              </div>

              <Separator />

              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">
                  Items
                </div>
                <div className="rounded-md border border-border divide-y divide-border">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 p-3 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {item.item_name}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {item.quantity} × {formatGBP(item.unit_price)}
                        </div>
                      </div>
                      <div className="font-semibold tabular-nums">
                        {formatGBP(item.subtotal)}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 text-sm font-semibold bg-muted/40">
                    <span>Total</span>
                    <span className="tabular-nums">{formatGBP(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <Timeline order={order} />
            </DialogBody>

            <DialogFooter className="flex-wrap">
              {nextStatuses(order.status).length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  This order is closed.
                </span>
              ) : (
                nextStatuses(order.status).map((next) => (
                  <Button
                    key={next}
                    variant={
                      next === 'rejected' || next === 'cancelled'
                        ? 'destructive'
                        : next === 'completed'
                          ? 'success'
                          : 'default'
                    }
                    size="sm"
                    disabled={update.isPending}
                    onClick={() => update.mutate({ status: next })}
                  >
                    {update.isPending && update.variables?.status === next && (
                      <Spinner className="h-3 w-3" />
                    )}
                    Mark {ORDER_STATUS_LABELS[next].toLowerCase()}
                  </Button>
                ))
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon,
  label,
  children,
  full,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : undefined}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm text-foreground">{children}</div>
    </div>
  );
}

function Timeline({ order }: { order: OrderOut }) {
  const events = [
    { label: 'Received', at: order.created_at },
    { label: 'Accepted', at: order.accepted_at },
    { label: 'Prep started', at: order.prep_started_at },
    { label: 'Ready', at: order.ready_at },
    { label: 'Completed', at: order.completed_at },
  ];

  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground font-medium">
        Timeline
      </div>
      <ul className="space-y-1.5">
        {events.map((e) => (
          <li key={e.label} className="flex items-center justify-between text-sm">
            <span className={e.at ? 'text-foreground' : 'text-muted-foreground'}>
              {e.label}
            </span>
            <span className={e.at ? 'text-muted-foreground tabular-nums' : 'text-muted-foreground/60'}>
              {e.at ? formatDateTime(e.at, 'HH:mm:ss') : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
