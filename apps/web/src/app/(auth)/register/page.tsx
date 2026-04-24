'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { auth, ApiError } from '@kitco/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { getApiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useRedirectIfAuthed } from '@/hooks/use-auth-guard';

export default function RegisterPage() {
  useRedirectIfAuthed();
  const router = useRouter();
  const { toast } = useToast();
  const setTokens = useAuthStore((s) => s.setTokens);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Minimum 8 characters.', variant: 'error' });
      return;
    }
    setPending(true);
    try {
      const tokens = await auth.register(getApiClient(), {
        name,
        email,
        password,
        phone: phone || null,
        address: address || null,
      });
      setTokens(tokens);
      toast({ title: 'Kitchen created', description: 'Welcome aboard.', variant: 'success' });
      router.replace('/orders');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not register';
      toast({ title: 'Registration failed', description: message, variant: 'error' });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Set up your kitchen</h1>
        <p className="text-sm text-muted-foreground">
          A few details and you&apos;re ready to take orders.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Kitchen name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Casa Lina"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 ..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address (optional)</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending && <Spinner className="text-primary-foreground" />}
          Create kitchen
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Already have a kitchen?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
