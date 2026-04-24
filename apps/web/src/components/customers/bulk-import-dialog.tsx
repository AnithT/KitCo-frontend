'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, customers, type CustomerCreate } from '@kitco/api-client';
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
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';

function parseCsv(input: string): { rows: CustomerCreate[]; errors: string[] } {
  const rows: CustomerCreate[] = [];
  const errors: string[] = [];
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const [idx, line] of lines.entries()) {
    // Skip header row if it matches a known pattern
    if (idx === 0 && /^phone[, ]/i.test(line)) continue;
    const parts = line.split(',').map((p) => p.trim());
    const phone = parts[0];
    const name = parts[1] ?? '';
    if (!phone) {
      errors.push(`Line ${idx + 1}: missing phone`);
      continue;
    }
    rows.push({
      phone,
      name: name || null,
      channel_preference: 'whatsapp',
    });
  }
  return { rows, errors };
}

export function BulkImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [text, setText] = useState('');

  const { rows, errors } = useMemo(() => parseCsv(text), [text]);

  const importMutation = useMutation({
    mutationFn: () => customers.bulkImportCustomers(getApiClient(), { customers: rows }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customers.customerKeys.lists() });
      qc.invalidateQueries({ queryKey: customers.customerKeys.count() });
      toast({
        title: 'Import complete',
        description: `${rows.length} ${rows.length === 1 ? 'customer' : 'customers'} added.`,
        variant: 'success',
      });
      setText('');
      onOpenChange(false);
    },
    onError: (err) => {
      toast({
        title: 'Import failed',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rows.length === 0) return;
    importMutation.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Bulk import customers</DialogTitle>
            <DialogDescription>
              Paste rows in <code className="text-xs bg-muted px-1 py-0.5 rounded">phone,name</code> format — one per line.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="csv">CSV data</Label>
              <Textarea
                id="csv"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder={'+44 7700 900123,Jess\n+44 7700 900456,Sam'}
                className="font-mono text-xs"
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {rows.length} valid {rows.length === 1 ? 'row' : 'rows'}
              </span>
              {errors.length > 0 && (
                <span className="text-destructive">
                  {errors.length} {errors.length === 1 ? 'error' : 'errors'}
                </span>
              )}
            </div>
            {errors.length > 0 && (
              <ul className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive max-h-32 overflow-y-auto">
                {errors.slice(0, 8).map((e) => (
                  <li key={e}>{e}</li>
                ))}
                {errors.length > 8 && <li>… and {errors.length - 8} more</li>}
              </ul>
            )}
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={importMutation.isPending || rows.length === 0}>
              {importMutation.isPending && <Spinner className="text-primary-foreground" />}
              Import {rows.length > 0 ? `${rows.length}` : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
