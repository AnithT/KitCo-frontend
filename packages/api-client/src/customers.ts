import { request, type KitCoClient } from './client.js';
import type {
  CustomerBulkImport,
  CustomerCreate,
  CustomerOut,
  CustomerUpdate,
  PaginationParams,
  UUID,
} from './types.js';

const BASE = '/api/v1/customers';

export interface ListCustomersParams extends PaginationParams {
  opted_in_only?: boolean;
}

export function listCustomers(
  client: KitCoClient,
  params: ListCustomersParams = {},
): Promise<CustomerOut[]> {
  return request<CustomerOut[]>(client, { url: `${BASE}/`, method: 'GET', params });
}

export function getCustomer(
  client: KitCoClient,
  customerId: UUID,
): Promise<CustomerOut> {
  return request<CustomerOut>(client, {
    url: `${BASE}/${customerId}`,
    method: 'GET',
  });
}

export function createCustomer(
  client: KitCoClient,
  body: CustomerCreate,
): Promise<CustomerOut> {
  return request<CustomerOut>(client, {
    url: `${BASE}/`,
    method: 'POST',
    data: body,
  });
}

export function updateCustomer(
  client: KitCoClient,
  customerId: UUID,
  body: CustomerUpdate,
): Promise<CustomerOut> {
  return request<CustomerOut>(client, {
    url: `${BASE}/${customerId}`,
    method: 'PATCH',
    data: body,
  });
}

export function bulkImportCustomers(
  client: KitCoClient,
  body: CustomerBulkImport,
): Promise<unknown> {
  return request<unknown>(client, {
    url: `${BASE}/bulk-import`,
    method: 'POST',
    data: body,
  });
}

export function customerCount(client: KitCoClient): Promise<{ count: number }> {
  return request<{ count: number }>(client, {
    url: `${BASE}/count`,
    method: 'GET',
  });
}

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: ListCustomersParams) => [...customerKeys.lists(), params] as const,
  count: () => [...customerKeys.all, 'count'] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...customerKeys.details(), id] as const,
};
