'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUiStore } from '@/lib/ui-store';
import { useAuthStore } from '@/lib/auth-store';

export default function SettingsPage() {
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const toggleSound = useUiStore((s) => s.toggleSound);
  const email = useAuthStore((s) => s.email);
  const kitchenId = useAuthStore((s) => s.kitchenId);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Console preferences and account info.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Read-only for now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{email ?? '—'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Kitchen ID</span>
            <span className="font-mono text-xs truncate max-w-xs" title={kitchenId ?? ''}>
              {kitchenId ?? '—'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>How you&apos;re alerted to new orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="sound">Sound on new order</Label>
              <p className="text-xs text-muted-foreground mt-1">
                A short ding when a new order lands on the board.
              </p>
            </div>
            <Switch id="sound" checked={soundEnabled} onCheckedChange={toggleSound} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
