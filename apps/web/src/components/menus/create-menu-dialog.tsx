'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { ApiError, menus, type MenuItemCreate } from '@kitco/api-client';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';

interface DraftItem extends MenuItemCreate {
  _localId: string;
}

function newDraftItem(): DraftItem {
  return {
    _localId: Math.random().toString(36).slice(2),
    name: '',
    price: 0,
    is_available: true,
    sort_order: 0,
  };
}

export function CreateMenuDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('Daily menu');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<DraftItem[]>([newDraftItem()]);

  const create = useMutation({
    mutationFn: () =>
      menus.createMenu(getApiClient(), {
        title,
        date,
        items: items
          .filter((i) => i.name.trim())
          .map(({ _localId, ...rest }, idx) => ({ ...rest, sort_order: idx })),
      }),
    onSuccess: (menu) => {
      qc.invalidateQueries({ queryKey: menus.menuKeys.lists() });
      toast({ title: 'Menu created', variant: 'success' });
      onOpenChange(false);
      reset();
      router.push(`/menus/${menu.id}`);
    },
    onError: (err) => {
      toast({
        title: 'Could not create menu',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  function reset() {
    setTitle('Daily menu');
    setDate(new Date().toISOString().slice(0, 10));
    setItems([newDraftItem()]);
  }

  function updateItem(localId: string, patch: Partial<DraftItem>) {
    setItems((prev) =>
      prev.map((item) => (item._localId === localId ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(localId: string) {
    setItems((prev) => prev.filter((item) => item._localId !== localId));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create menu</DialogTitle>
            <DialogDescription>
              Pick a date, add a few items — you can edit it after.
            </DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems((prev) => [...prev, newDraftItem()])}
                >
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item._localId}
                    className="flex gap-2 rounded-md border border-border p-2 bg-surface"
                  >
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(item._localId, { name: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.price || ''}
                      onChange={(e) =>
                        updateItem(item._localId, { price: Number(e.target.value) })
                      }
                      className="w-28"
                    />
                    <Input
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={item.stock_quantity ?? ''}
                      onChange={(e) =>
                        updateItem(item._localId, {
                          stock_quantity: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="w-24"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item._localId)}
                      disabled={items.length === 1}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner className="text-primary-foreground" />}
              Create menu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
