'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export function useAuthGuard() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    // Hydration: zustand-persist needs a tick before the value is real on the client.
    if (typeof window === 'undefined') return;
    const hydrated = useAuthStore.persist.hasHydrated();
    if (!hydrated) {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        if (!useAuthStore.getState().accessToken) router.replace('/login');
      });
      return () => {
        unsub();
      };
    }
    if (!accessToken) router.replace('/login');
    return undefined;
  }, [accessToken, router]);

  return { isAuthenticated: Boolean(accessToken) };
}

export function useRedirectIfAuthed() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) router.replace('/orders');
  }, [accessToken, router]);
}
