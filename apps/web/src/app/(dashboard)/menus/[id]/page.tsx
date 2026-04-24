'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { ApiError, menus } from '@kitco/api-client';
import { formatDate } from '@kitco/shared';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { MenuStatusBadge } from '@/components/menus/menu-status-badge';
import { MenuItemRow } from '@/components/menus/menu-item-row';
import { AddItemForm } from '@/components/menus/add-item-form';
import { getApiClient } from '@/lib/api';

export default function MenuDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: menu, isLoading } = useQuery({
    queryKey: menus.menuKeys.detail(id),
    queryFn: () => menus.getMenu(getApiClient(), id),
    enabled: Boolean(id),
  });

  const publish = useMutation({
    mutationFn: () => menus.publishMenu(getApiClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menus.menuKeys.detail(id) });
      qc.invalidateQueries({ queryKey: menus.menuKeys.lists() });
      toast({ title: 'Menu published', description: 'Customers can now see this menu.', variant: 'success' });
    },
    onError: (err) => {
      toast({
        title: 'Publish failed',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  const remove = useMutation({
    mutationFn: () => menus.deleteMenu(getApiClient(), id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: menus.menuKeys.lists() });
      toast({ title: 'Menu deleted', variant: 'success' });
      router.push('/menus');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
        <Spinner /> Loading menu…
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="p-8 text-muted-foreground">Menu not found.</div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <Link
          href="/menus"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          All menus
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{menu.title}</h1>
              <MenuStatusBadge status={menu.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatDate(menu.date)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {menu.status === 'draft' && (
              <Button
                onClick={() => publish.mutate()}
                disabled={publish.isPending || menu.items.length === 0}
              >
                {publish.isPending ? <Spinner className="text-primary-foreground" /> : <Send className="h-4 w-4" />}
                Publish
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Delete this menu? This cannot be undone.')) remove.mutate();
              }}
              disabled={remove.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground font-medium border-b border-border bg-muted/40">
          <div>Item</div>
          <div className="w-24 text-right">Price</div>
          <div className="w-28 text-center">Stock</div>
          <div className="w-32">Available</div>
          <div className="hidden sm:block w-16" />
          <div className="w-9" />
        </div>
        {menu.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No items yet — add one below.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {menu.items
              .slice()
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((item) => (
                <MenuItemRow key={item.id} item={item} menuId={id} />
              ))}
          </div>
        )}
        <AddItemForm menuId={id} />
      </Card>

      {menu.status === 'draft' && menu.items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add at least one item before publishing.
        </p>
      )}
    </div>
  );
}
