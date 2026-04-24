'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { orders, type OrderOut } from '@kitco/api-client';
import type { OrderStatus } from '@kitco/shared';
import { KanbanColumn } from '@/components/orders/kanban-column';
import { OrderDrawer } from '@/components/orders/order-drawer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';
import { useKitchenSocket } from '@/hooks/use-kitchen-socket';
import { useUiStore } from '@/lib/ui-store';
import { playDing } from '@/lib/audio';
import { cn } from '@/lib/utils';

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: 'Pending' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'in_prep', label: 'In prep' },
  { status: 'ready', label: 'Ready' },
  { status: 'out_for_delivery', label: 'Out for delivery' },
  { status: 'completed', label: 'Completed' },
];

const VISIBLE_STATUSES = COLUMNS.map((c) => c.status);

export default function OrdersPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const soundEnabled = useUiStore((s) => s.soundEnabled);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: orders.orderKeys.list({ limit: 200 }),
    queryFn: () => orders.listOrders(getApiClient(), { limit: 200 }),
    refetchInterval: 30_000,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [wsConnected, setWsConnected] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Track ids we've seen so the WS can flag truly-new ones (not initial fetch).
  useEffect(() => {
    if (!data) return;
    if (seenIdsRef.current.size === 0) {
      data.forEach((o) => seenIdsRef.current.add(o.id));
    }
  }, [data]);

  useKitchenSocket({
    onOpen: () => setWsConnected(true),
    onClose: () => setWsConnected(false),
    onEvent: (ev) => {
      if (ev.type === 'order.new' && 'order' in ev && ev.order) {
        const incoming = ev.order as OrderOut;
        const isNew = !seenIdsRef.current.has(incoming.id);
        seenIdsRef.current.add(incoming.id);

        qc.setQueryData<OrderOut[]>(orders.orderKeys.list({ limit: 200 }), (prev) => {
          if (!prev) return [incoming];
          if (prev.some((o) => o.id === incoming.id)) return prev;
          return [incoming, ...prev];
        });

        if (isNew) {
          if (soundEnabled) playDing();
          toast({
            title: 'New order',
            description: `${incoming.customer_name ?? 'Walk-in'} · ${incoming.items.length} items`,
            variant: 'info',
          });
          setNewOrderIds((s) => new Set(s).add(incoming.id));
          setTimeout(() => {
            setNewOrderIds((s) => {
              const next = new Set(s);
              next.delete(incoming.id);
              return next;
            });
          }, 8_000);
        }
      } else if (ev.type === 'order.updated' && 'order' in ev && ev.order) {
        const incoming = ev.order as OrderOut;
        qc.setQueryData<OrderOut[]>(orders.orderKeys.list({ limit: 200 }), (prev) => {
          if (!prev) return [incoming];
          const idx = prev.findIndex((o) => o.id === incoming.id);
          if (idx === -1) return [incoming, ...prev];
          const next = prev.slice();
          next[idx] = incoming;
          return next;
        });
        qc.setQueryData(orders.orderKeys.detail(incoming.id), incoming);
      }
    },
  });

  const grouped = useMemo(() => {
    const map = new Map<OrderStatus, OrderOut[]>();
    VISIBLE_STATUSES.forEach((s) => map.set(s, []));
    (data ?? []).forEach((order) => {
      if (map.has(order.status)) {
        map.get(order.status)!.push(order);
      }
    });
    map.forEach((list) =>
      list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    );
    return map;
  }, [data]);

  const selectedOrder = useMemo(
    () => (selectedId ? data?.find((o) => o.id === selectedId) ?? null : null),
    [selectedId, data],
  );

  function openOrder(order: OrderOut) {
    setSelectedId(order.id);
    setDrawerOpen(true);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
          <p className="text-xs text-muted-foreground">
            Live board · updates as new orders come in.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
              wsConnected
                ? 'bg-success/10 text-success ring-success/30'
                : 'bg-muted text-muted-foreground ring-border',
            )}
            title={wsConnected ? 'Live updates connected' : 'Reconnecting…'}
          >
            {wsConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {wsConnected ? 'Live' : 'Offline'}
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 lg:p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground gap-2">
            <Spinner /> Loading orders…
          </div>
        ) : (
          <div className="flex h-full gap-3">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                label={col.label}
                orders={grouped.get(col.status) ?? []}
                newOrderIds={newOrderIds}
                onCardClick={openOrder}
              />
            ))}
          </div>
        )}
      </div>

      <OrderDrawer order={selectedOrder} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
