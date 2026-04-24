import { request, type KitCoClient } from './client.js';
import type {
  BroadcastCreate,
  BroadcastOut,
  PaginationParams,
  UUID,
} from './types.js';

const BASE = '/api/v1/broadcasts';

export function listBroadcasts(
  client: KitCoClient,
  params: PaginationParams = {},
): Promise<BroadcastOut[]> {
  return request<BroadcastOut[]>(client, { url: `${BASE}/`, method: 'GET', params });
}

export function getBroadcast(
  client: KitCoClient,
  broadcastId: UUID,
): Promise<BroadcastOut> {
  return request<BroadcastOut>(client, {
    url: `${BASE}/${broadcastId}`,
    method: 'GET',
  });
}

export function createBroadcast(
  client: KitCoClient,
  body: BroadcastCreate,
): Promise<BroadcastOut> {
  return request<BroadcastOut>(client, {
    url: `${BASE}/`,
    method: 'POST',
    data: body,
  });
}

export const broadcastKeys = {
  all: ['broadcasts'] as const,
  lists: () => [...broadcastKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...broadcastKeys.lists(), params] as const,
  details: () => [...broadcastKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...broadcastKeys.details(), id] as const,
};
