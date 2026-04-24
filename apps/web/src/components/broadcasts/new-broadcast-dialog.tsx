'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Users } from 'lucide-react';
import {
  ApiError,
  broadcasts,
  customers,
  menus,
  type BroadcastChannel,
} from '@kitco/api-client';
import { formatGBP, formatDate } from '@kitco/shared';
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
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';

function defaultMessage(menuTitle: string, date: string, items: { name: string; price: number }[]) {
  const lines = items.slice(0, 6).map((i) => `• ${i.name} — ${formatGBP(i.price)}`);
  const more = items.length > 6 ? `\n…and ${items.length - 6} more` : '';
  return `Today's menu — ${menuTitle} (${formatDate(date)})\n\n${lines.join('\n')}${more}\n\nReply to order!`;
}

export function NewBroadcastDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: publishedMenus, isLoading: loadingMenus } = useQuery({
    queryKey: menus.menuKeys.list({ status: 'published', limit: 50 }),
    queryFn: () => menus.listMenus(getApiClient(), { status: 'published', limit: 50 }),
    enabled: open,
  });

  const { data: optedInCustomers } = useQuery({
    queryKey: customers.customerKeys.list({ opted_in_only: true, limit: 1000 }),
    queryFn: () =>
      customers.listCustomers(getApiClient(), { opted_in_only: true, limit: 1000 }),
    enabled: open,
  });

  const [menuId, setMenuId] = useState<string>('');
  const [channel, setChannel] = useState<BroadcastChannel>('whatsapp');
  const [message, setMessage] = useState('');

  const selectedMenu = useMemo(
    () => publishedMenus?.find((m) => m.id === menuId),
    [publishedMenus, menuId],
  );

  useEffect(() => {
    if (open && publishedMenus && publishedMenus.length > 0 && !menuId) {
      setMenuId(publishedMenus[0]!.id);
    }
  }, [open, publishedMenus, menuId]);

  useEffect(() => {
    if (selectedMenu) {
      setMessage(defaultMessage(selectedMenu.title, selectedMenu.date, selectedMenu.items));
    }
  }, [selectedMenu]);

  const send = useMutation({
    mutationFn: () =>
      broadcasts.createBroadcast(getApiClient(), {
        menu_id: menuId,
        channel,
        message_template: message || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: broadcasts.broadcastKeys.lists() });
      toast({ title: 'Broadcast queued', variant: 'success' });
      onOpenChange(false);
    },
    onError: (err) => {
      toast({
        title: 'Could not send',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!menuId) return;
    send.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New broadcast</DialogTitle>
            <DialogDescription>
              Send a published menu to your opted-in customers.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="menu">Menu</Label>
                {loadingMenus ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner /> Loading menus…
                  </div>
                ) : publishedMenus && publishedMenus.length > 0 ? (
                  <Select
                    id="menu"
                    value={menuId}
                    onChange={(e) => setMenuId(e.target.value)}
                    required
                  >
                    {publishedMenus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} — {formatDate(m.date)}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-3">
                    No published menus yet. Publish one first.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select
                  id="channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as BroadcastChannel)}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </Select>
              </div>
            </div>

            <div className="rounded-md bg-accent/40 border border-accent px-3 py-2 flex items-center gap-2 text-sm text-accent-foreground">
              <Users className="h-4 w-4" />
              <span>
                Will go to{' '}
                <strong className="tabular-nums">
                  {optedInCustomers?.length ?? 0}
                </strong>{' '}
                opted-in {(optedInCustomers?.length ?? 0) === 1 ? 'customer' : 'customers'}.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="message">Message template</Label>
                <textarea
                  id="message"
                  rows={10}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-input bg-surface px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label>Preview</Label>
                <WhatsAppPreview message={message} />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={send.isPending || !menuId || !publishedMenus?.length}
            >
              {send.isPending ? <Spinner className="text-primary-foreground" /> : <MessageCircle className="h-4 w-4" />}
              Send broadcast
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function WhatsAppPreview({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-[#e5ddd5] p-4 min-h-[16rem] flex items-end">
      <div className="relative max-w-[85%] rounded-lg rounded-br-sm bg-[#dcf8c6] px-3 py-2 text-sm text-[#111] shadow-sm whitespace-pre-wrap break-words">
        {message || (
          <span className="text-muted-foreground italic">
            Pick a menu to preview the message.
          </span>
        )}
        <div className="mt-1 text-right text-[10px] text-[#667781]">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
        </div>
      </div>
    </div>
  );
}
