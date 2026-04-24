'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { ApiError, menus } from '@kitco/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';

export function AddItemForm({ menuId }: { menuId: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const create = useMutation({
    mutationFn: () =>
      menus.addMenuItem(getApiClient(), menuId, {
        name,
        price: Number(price),
        stock_quantity: stock === '' ? null : Number(stock),
        is_available: true,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menus.menuKeys.detail(menuId) });
      setName('');
      setPrice('');
      setStock('');
    },
    onError: (err) => {
      toast({
        title: 'Could not add item',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    create.mutate();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-2 p-3 border-t border-border bg-muted/30">
      <Input
        placeholder="New item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 min-w-[180px] h-9"
        required
      />
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="h-9 w-24 tabular-nums"
        required
      />
      <Input
        type="number"
        min="0"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="h-9 w-24 tabular-nums"
      />
      <Button type="submit" size="sm" disabled={create.isPending}>
        {create.isPending ? <Spinner className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        Add
      </Button>
    </form>
  );
}
