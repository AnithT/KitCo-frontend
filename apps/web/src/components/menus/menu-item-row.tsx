'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { ApiError, menus, type MenuItemOut } from '@kitco/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';
import { formatGBP } from '@kitco/shared';

export function MenuItemRow({
  item,
  menuId,
}: {
  item: MenuItemOut;
  menuId: string;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));

  const update = useMutation({
    mutationFn: (patch: Partial<MenuItemOut>) =>
      menus.updateMenuItem(getApiClient(), item.id, {
        name: patch.name,
        price: patch.price,
        stock_quantity: patch.stock_quantity,
        is_available: patch.is_available,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menus.menuKeys.detail(menuId) });
    },
    onError: (err) => {
      toast({
        title: 'Update failed',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  const remove = useMutation({
    mutationFn: () => menus.deleteMenuItem(getApiClient(), item.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menus.menuKeys.detail(menuId) });
      toast({ title: 'Item removed', variant: 'success' });
    },
  });

  function commitName() {
    if (name !== item.name && name.trim()) update.mutate({ name });
  }

  function commitPrice() {
    const n = Number(price);
    if (!Number.isNaN(n) && n !== item.price) update.mutate({ price: n });
  }

  function adjustStock(delta: number) {
    const current = item.stock_quantity ?? 0;
    const next = Math.max(0, current + delta);
    update.mutate({ stock_quantity: next });
  }

  const stock = item.stock_quantity;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-[180px]">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          className="border-0 bg-transparent px-0 h-8 font-medium focus-visible:ring-0 focus-visible:border-b focus-visible:rounded-none"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">£</span>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={commitPrice}
          className="h-8 w-24 tabular-nums"
        />
      </div>
      <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => adjustStock(-1)}
          disabled={stock == null || stock === 0}
          aria-label="Decrease stock"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-[2.5rem] text-center text-sm tabular-nums font-medium">
          {stock ?? '∞'}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => adjustStock(1)}
          aria-label="Increase stock"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={item.is_available}
          onCheckedChange={(v) => update.mutate({ is_available: v })}
          aria-label="Available"
        />
        <span className="text-xs text-muted-foreground w-16">
          {item.is_available ? 'Available' : 'Hidden'}
        </span>
      </div>
      <div className="hidden sm:block text-xs text-muted-foreground tabular-nums">
        {formatGBP(item.price)}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove.mutate()}
        aria-label="Delete item"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
