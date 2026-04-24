'use client';

import { useEffect, useRef } from 'react';
import { createKitchenSocket, type KitchenWSEvent } from '@kitco/api-client';
import { API_BASE_URL } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

interface Options {
  enabled?: boolean;
  onEvent: (event: KitchenWSEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Subscribes to /ws/kitchen/{kitchenId}. Auto-reconnects with backoff while
 * the auth state and kitchenId stay valid.
 */
export function useKitchenSocket({ enabled = true, onEvent, onOpen, onClose }: Options) {
  const kitchenId = useAuthStore((s) => s.kitchenId);
  const accessToken = useAuthStore((s) => s.accessToken);

  const eventRef = useRef(onEvent);
  const openRef = useRef(onOpen);
  const closeRef = useRef(onClose);
  eventRef.current = onEvent;
  openRef.current = onOpen;
  closeRef.current = onClose;

  useEffect(() => {
    if (!enabled || !kitchenId) return;

    let cancelled = false;
    let attempts = 0;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;
      const handle = createKitchenSocket(
        API_BASE_URL,
        kitchenId,
        {
          onOpen: () => {
            attempts = 0;
            openRef.current?.();
          },
          onMessage: (ev) => eventRef.current?.(ev),
          onClose: () => {
            closeRef.current?.();
            if (cancelled) return;
            attempts += 1;
            const delay = Math.min(15_000, 1_000 * 2 ** Math.min(attempts, 4));
            reconnectTimer = setTimeout(connect, delay);
          },
          onError: () => {
            // onClose will fire and trigger reconnect.
          },
        },
        accessToken ? { token: accessToken } : undefined,
      );
      socket = handle.socket;
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        socket?.close();
      } catch {
        /* noop */
      }
    };
  }, [enabled, kitchenId, accessToken]);
}
