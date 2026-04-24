'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { auth, ApiError } from '@kitco/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useRedirectIfAuthed } from '@/hooks/use-auth-guard';

export default function LoginPage() {
  useRedirectIfAuthed();
  const router = useRouter();
  const { toast } = useToast();
  const setTokens = useAuthStore((s) => s.setTokens);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const tokens = await auth.login(getApiClient(), { email, password });
      setTokens(tokens);
      router.replace('/orders');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Sign in failed';
      toast({ title: 'Sign in failed', description: message, variant: 'error' });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your kitchen console.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="chef@yourkitchen.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Spinner className="text-primary-foreground" />}
          Sign in
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        New to KitCo?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Register your kitchen
        </Link>
      </p>
    </div>
  );
}
