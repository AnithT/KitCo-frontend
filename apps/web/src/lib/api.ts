'use client';

import { createKitCoClient, type KitCoClient } from '@kitco/api-client';
import { authStoreAsTokenStorage, useAuthStore } from './auth-store';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

let client: KitCoClient | null = null;

export function getApiClient(): KitCoClient {
  if (client) return client;
  client = createKitCoClient({
    baseURL: API_BASE_URL,
    storage: authStoreAsTokenStorage(),
    onTokensRefreshed: (tokens) => {
      useAuthStore.getState().setTokens(tokens);
    },
    onAuthFailure: () => {
      useAuthStore.getState().clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  });
  return client;
}
