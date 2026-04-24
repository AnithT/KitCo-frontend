'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Upload, Search, Users } from 'lucide-react';
import { customers, type CustomerOut } from '@kitco/api-client';
import { formatPhoneDisplay } from '@kitco/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { AddCustomerDialog } from '@/components/customers/add-customer-dialog';
import { BulkImportDialog } from '@/components/customers/bulk-import-dialog';
import { getApiClient } from '@/lib/api';

export default function CustomersPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: customers.customerKeys.list({ limit: 500 }),
    queryFn: () => customers.listCustomers(getApiClient(), { limit: 500 }),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.phone.toLowerCase().includes(q) ||
        (c.name?.toLowerCase().includes(q) ?? false),
    );
  }, [data, query]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} total ·{' '}
            {data?.filter((c) => c.is_opted_in).length ?? 0} opted in
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4" />
            Bulk import
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add customer
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by phone or name"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-2">
          <Spinner /> Loading customers…
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer or paste a CSV to get started."
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4" />
                Bulk import
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Add customer
              </Button>
            </div>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Name</th>
                  <th className="text-left font-medium px-4 py-2.5">Phone</th>
                  <th className="text-left font-medium px-4 py-2.5">Channel</th>
                  <th className="text-left font-medium px-4 py-2.5">Opted in</th>
                  <th className="text-right font-medium px-4 py-2.5">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <CustomerRow key={c.id} customer={c} />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No customers match &ldquo;{query}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />
      <BulkImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function CustomerRow({ customer }: { customer: CustomerOut }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 font-medium text-foreground">
        {customer.name || <span className="text-muted-foreground italic">Unnamed</span>}
      </td>
      <td className="px-4 py-3 tabular-nums text-muted-foreground">
        {formatPhoneDisplay(customer.phone)}
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="capitalize">
          {customer.channel_preference}
        </Badge>
      </td>
      <td className="px-4 py-3">
        {customer.is_opted_in ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <Badge variant="muted">No</Badge>
        )}
      </td>
      <td className="px-4 py-3 text-right tabular-nums font-medium">
        {customer.total_orders}
      </td>
    </tr>
  );
}
