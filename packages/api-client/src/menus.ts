import { request, type KitCoClient } from './client.js';
import type {
  MenuCreate,
  MenuItemCreate,
  MenuItemOut,
  MenuItemUpdate,
  MenuOut,
  MenuStatus,
  MenuUpdate,
  PaginationParams,
  UUID,
} from './types.js';

const BASE = '/api/v1/menus';

export interface ListMenusParams extends PaginationParams {
  menu_date?: string;
  status?: MenuStatus;
}

export function listMenus(
  client: KitCoClient,
  params: ListMenusParams = {},
): Promise<MenuOut[]> {
  return request<MenuOut[]>(client, { url: `${BASE}/`, method: 'GET', params });
}

export function getMenu(client: KitCoClient, menuId: UUID): Promise<MenuOut> {
  return request<MenuOut>(client, { url: `${BASE}/${menuId}`, method: 'GET' });
}

export function createMenu(client: KitCoClient, body: MenuCreate): Promise<MenuOut> {
  return request<MenuOut>(client, { url: `${BASE}/`, method: 'POST', data: body });
}

export function updateMenu(
  client: KitCoClient,
  menuId: UUID,
  body: MenuUpdate,
): Promise<MenuOut> {
  return request<MenuOut>(client, {
    url: `${BASE}/${menuId}`,
    method: 'PATCH',
    data: body,
  });
}

export function deleteMenu(client: KitCoClient, menuId: UUID): Promise<void> {
  return request<void>(client, { url: `${BASE}/${menuId}`, method: 'DELETE' });
}

export function publishMenu(client: KitCoClient, menuId: UUID): Promise<MenuOut> {
  return request<MenuOut>(client, {
    url: `${BASE}/${menuId}/publish`,
    method: 'POST',
  });
}

export function addMenuItem(
  client: KitCoClient,
  menuId: UUID,
  body: MenuItemCreate,
): Promise<MenuItemOut> {
  return request<MenuItemOut>(client, {
    url: `${BASE}/${menuId}/items`,
    method: 'POST',
    data: body,
  });
}

export function updateMenuItem(
  client: KitCoClient,
  itemId: UUID,
  body: MenuItemUpdate,
): Promise<MenuItemOut> {
  return request<MenuItemOut>(client, {
    url: `${BASE}/items/${itemId}`,
    method: 'PATCH',
    data: body,
  });
}

export function deleteMenuItem(client: KitCoClient, itemId: UUID): Promise<void> {
  return request<void>(client, {
    url: `${BASE}/items/${itemId}`,
    method: 'DELETE',
  });
}

export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (params: ListMenusParams) => [...menuKeys.lists(), params] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: UUID) => [...menuKeys.details(), id] as const,
};
