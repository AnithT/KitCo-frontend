import { request, type KitCoClient } from './client.js';
import type {
  KitchenRegister,
  LoginRequest,
  TokenRefresh,
  TokenResponse,
} from './types.js';

const BASE = '/api/v1/auth';

export async function register(
  client: KitCoClient,
  body: KitchenRegister,
): Promise<TokenResponse> {
  const tokens = await request<TokenResponse>(client, {
    url: `${BASE}/register`,
    method: 'POST',
    data: body,
  });
  await client.setTokens(tokens);
  return tokens;
}

export async function login(
  client: KitCoClient,
  body: LoginRequest,
): Promise<TokenResponse> {
  const tokens = await request<TokenResponse>(client, {
    url: `${BASE}/login`,
    method: 'POST',
    data: body,
  });
  await client.setTokens(tokens);
  return tokens;
}

export async function refresh(
  client: KitCoClient,
  body: TokenRefresh,
): Promise<TokenResponse> {
  const tokens = await request<TokenResponse>(client, {
    url: `${BASE}/refresh`,
    method: 'POST',
    data: body,
  });
  await client.setTokens(tokens);
  return tokens;
}

export async function logout(client: KitCoClient): Promise<void> {
  await client.clearTokens();
}

export const authKeys = {
  all: ['auth'] as const,
};
