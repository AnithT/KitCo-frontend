import { request, type KitCoClient } from './client.js';
import type {
  OrderCreate,
  OrderOut,
  OrderStatus,
  OrderStatusUpdate,
  PaginationParams,
  UUID,
} from './types.js';

const BASE = '/api/v1/orders';

export interface ListOrdersParams extends PaginationParams {
  status?: OrderStatus;
}

export function listOrders(
  client: KitCoClient,
  params: ListOrdersParams = {},
): Promise<OrderOut[]> {
  return request<OrderOut[]>(client, { url: `${BASE}/`, method: 'GET', params });
}

export function getOrder(client: KitCoClient, orderId: UUID): Promise<OrderOut> {
  return request<OrderOut>(client, { url: `${BASE}/${orderId}`, method: 'GET' });
}

export function createOrder(
  client: KitCoClient,
  body: OrderCreate,
): Promise<OrderOut> {
  return request<OrderOut>(client, { url: `${BASE}/`, method: 'POST', data: body });
}

export function updateOrderStatus(
  client: KitCoClient,
  orderId: UUID,
  body: OrderStatusUpdate,
): Promise<OrderOut> {
  return request<OrderOut>(client, {
    url: `${BASE}/${orderId}/status`,
    method: 'PATCH',
    data: body,
  });
}

/**
 * Public order tracking. No auth — the backend verifies by matching the phone
 * against the order.
 */
export function trackOrder(
  client: KitCoClient,
  orderId: UUID,
  phone: string,
): Promise<OrderOut> {
  return request<OrderOut>(client, {
    url: `${BASE}/track/${orderId}`,
    method: 'GET',
    params: { phone },
  });
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: ListOrdersParams) => [...orderKeys.lists(), params] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...orderKeys.details(), id] as const,
  tracking: (id: UUID) => [...orderKeys.all, 'tracking', id] as const,
};
