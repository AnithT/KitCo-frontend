'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Plus, MessageCircle, MessageSquare } from 'lucide-react';
import { broadcasts, type BroadcastOut } from '@kitco/api-client';
import { formatDateTime } from '@kitco/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { NewBroadcastDialog } from '@/components/broadcasts/new-broadcast-dialog';
import { getApiClient } from '@/lib/api';

export default function BroadcastsPage() {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: broadcasts.broadcastKeys.list({ limit: 100 }),
    queryFn: () => broadcasts.listBroadcasts(getApiClient(), { limit: 100 }),
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Broadcasts</h1>
          <p className="text-sm text-muted-foreground">
            Send today&apos;s menu to your opted-in customers.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New broadcast
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Spinner /> Loading broadcasts…
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No broadcasts yet"
          description="Publish a menu, then send it to your customers."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              New broadcast
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((b) => (
            <BroadcastRow key={b.id} broadcast={b} />
          ))}
        </div>
      )}

      <NewBroadcastDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function BroadcastRow({ broadcast }: { broadcast: BroadcastOut }) {
  const ChannelIcon = broadcast.channel === 'whatsapp' ? MessageCircle : MessageSquare;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary shrink-0">
            <ChannelIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold capitalize">
              {broadcast.channel} broadcast
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(broadcast.sent_at)} · {broadcast.total_recipients} recipients
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Stat label="Delivered" value={pct(broadcast.delivered_count, broadcast.total_recipients)} variant="info" />
          <Stat label="Read" value={pct(broadcast.read_count, broadcast.total_recipients)} variant="default" />
          <Stat label="Clicked" value={pct(broadcast.clicked_count, broadcast.total_recipients)} variant="success" />
        </div>
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: React.ComponentProps<typeof Badge>['variant'];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Badge variant={variant} className="tabular-nums">{value}</Badge>
    </div>
  );
}
