'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError, customers, type ChannelPreference } from '@kitco/api-client';
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
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';

export function AddCustomerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<ChannelPreference>('whatsapp');

  const create = useMutation({
    mutationFn: () =>
      customers.createCustomer(getApiClient(), {
        phone,
        name: name || null,
        channel_preference: channel,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customers.customerKeys.lists() });
      toast({ title: 'Customer added', variant: 'success' });
      setPhone('');
      setName('');
      setChannel('whatsapp');
      onOpenChange(false);
    },
    onError: (err) => {
      toast({
        title: 'Could not add',
        description: err instanceof ApiError ? err.message : 'Try again.',
        variant: 'error',
      });
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
            <DialogDescription>Add one customer manually.</DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 7700 900123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel preference</Label>
              <Select
                id="channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelPreference)}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="both">Both</option>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Spinner className="text-primary-foreground" />}
              Add customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
