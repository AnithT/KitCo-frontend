import { request, type KitCoClient } from './client.js';
import type {
  CheckoutRequest,
  CheckoutResponse,
  MenuOut,
  UUID,
} from './types.js';

const BASE = '/api/v1/public';

export function getPublicMenu(
  client: KitCoClient,
  kitchenId: UUID,
  menuId: UUID,
): Promise<MenuOut> {
  return request<MenuOut>(client, {
    url: `${BASE}/menu/${kitchenId}/${menuId}`,
    method: 'GET',
  });
}

export function createCheckout(
  client: KitCoClient,
  body: CheckoutRequest,
): Promise<CheckoutResponse> {
  return request<CheckoutResponse>(client, {
    url: `${BASE}/checkout`,
    method: 'POST',
    data: body,
  });
}

export const publicKeys = {
  all: ['public'] as const,
  menu: (kitchenId: UUID, menuId: UUID) =>
    [...publicKeys.all, 'menu', kitchenId, menuId] as const,
};
