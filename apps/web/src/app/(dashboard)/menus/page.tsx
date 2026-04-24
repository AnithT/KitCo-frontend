'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, UtensilsCrossed, Calendar } from 'lucide-react';
import { menus, type MenuOut, type MenuStatus } from '@kitco/api-client';
import { formatDate, formatGBP } from '@kitco/shared';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { MenuStatusBadge } from '@/components/menus/menu-status-badge';
import { CreateMenuDialog } from '@/components/menus/create-menu-dialog';
import { getApiClient } from '@/lib/api';

export default function MenusPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<MenuStatus | ''>('');

  const params = useMemo(
    () => ({
      ...(date ? { menu_date: date } : {}),
      ...(status ? { status: status as MenuStatus } : {}),
      limit: 100,
    }),
    [date, status],
  );

  const { data, isLoading } = useQuery({
    queryKey: menus.menuKeys.list(params),
    queryFn: () => menus.listMenus(getApiClient(), params),
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Menus</h1>
          <p className="text-sm text-muted-foreground">
            Build daily menus and publish them to broadcast.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New menu
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as MenuStatus | '')}
          className="w-44"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        {(date || status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDate('');
              setStatus('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Spinner /> Loading menus…
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No menus yet"
          description="Create your first menu to start taking orders."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New menu
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((menu) => (
            <MenuRow key={menu.id} menu={menu} />
          ))}
        </div>
      )}

      <CreateMenuDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function MenuRow({ menu }: { menu: MenuOut }) {
  const total = menu.items.reduce((sum, i) => sum + i.price * (i.stock_quantity ?? 1), 0);

  return (
    <Link href={`/menus/${menu.id}`} className="group">
      <Card className="p-4 transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-px">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-base font-semibold truncate">{menu.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(menu.date)}
            </div>
          </div>
          <MenuStatusBadge status={menu.status} />
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{menu.items.length} {menu.items.length === 1 ? 'item' : 'items'}</span>
          <span className="tabular-nums">{formatGBP(total)} catalog value</span>
        </div>
      </Card>
    </Link>
  );
}
