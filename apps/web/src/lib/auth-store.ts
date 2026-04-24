'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthTokens, TokenStorage } from '@kitco/api-client';
import { getKitchenIdFromToken, decodeJwt } from './jwt';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  kitchenId: string | null;
  email: string | null;
  setTokens: (tokens: AuthTokens) => void;
  clear: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      kitchenId: null,
      email: null,
      setTokens: (tokens) => {
        const payload = decodeJwt<{ sub: string; email?: string; kitchen_id?: string }>(
          tokens.access_token,
        );
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          kitchenId: getKitchenIdFromToken(tokens.access_token),
          email: payload?.email ?? null,
        });
      },
      clear: () =>
        set({ accessToken: null, refreshToken: null, kitchenId: null, email: null }),
      isAuthenticated: () => Boolean(get().accessToken),
    }),
    {
      name: 'kitco.auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function authStoreAsTokenStorage(): TokenStorage {
  return {
    getAccessToken() {
      return useAuthStore.getState().accessToken;
    },
    getRefreshToken() {
      return useAuthStore.getState().refreshToken;
    },
    setTokens(tokens) {
      useAuthStore.getState().setTokens(tokens);
    },
    clear() {
      useAuthStore.getState().clear();
    },
  };
}
