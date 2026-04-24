import type { OrderStatus, PaymentStatus } from '@kitco/shared';

export type UUID = string;
export type ISODate = string;
export type ISODateTime = string;

export type MenuStatus = 'draft' | 'published' | 'archived';
export type BroadcastChannel = 'whatsapp' | 'sms';
export type ChannelPreference = 'whatsapp' | 'sms' | 'both';

export type { OrderStatus, PaymentStatus };

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface KitchenRegister {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  address?: string | null;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenRefresh {
  refresh_token: string;
}

export interface MenuItemCreate {
  name: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  image_url?: string | null;
  category?: string | null;
  stock_quantity?: number | null;
  is_available?: boolean;
  prep_time_minutes?: number | null;
  sort_order?: number;
}

export interface MenuItemUpdate {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  cost?: number | null;
  image_url?: string | null;
  category?: string | null;
  stock_quantity?: number | null;
  is_available?: boolean | null;
  prep_time_minutes?: number | null;
  sort_order?: number | null;
}

export interface MenuItemOut {
  id: UUID;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  image_url: string | null;
  category: string | null;
  stock_quantity: number | null;
  is_available: boolean;
  prep_time_minutes: number | null;
  sort_order: number;
}

export interface MenuCreate {
  title?: string;
  date: ISODate;
  items?: MenuItemCreate[];
}

export interface MenuUpdate {
  title?: string | null;
  date?: ISODate | null;
  status?: MenuStatus | null;
}

export interface MenuOut {
  id: UUID;
  kitchen_id: UUID;
  title: string;
  date: ISODate;
  status: MenuStatus;
  items: MenuItemOut[];
}

export interface CustomerCreate {
  phone: string;
  name?: string | null;
  address?: string | null;
  channel_preference?: ChannelPreference;
}

export interface CustomerUpdate {
  name?: string | null;
  address?: string | null;
  channel_preference?: ChannelPreference | null;
  is_opted_in?: boolean | null;
}

export interface CustomerOut {
  id: UUID;
  kitchen_id: UUID;
  phone: string;
  name: string | null;
  address: string | null;
  channel_preference: ChannelPreference;
  is_opted_in: boolean;
  total_orders: number;
}

export interface CustomerBulkImport {
  customers: CustomerCreate[];
}

export interface OrderItemCreate {
  menu_item_id: UUID;
  quantity?: number;
}

export interface OrderItemOut {
  id: UUID;
  item_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderCreate {
  kitchen_id: UUID;
  menu_id: UUID;
  customer_phone: string;
  customer_name?: string | null;
  delivery_address?: string | null;
  notes?: string | null;
  items: OrderItemCreate[];
  broadcast_ref?: UUID | null;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
}

export interface OrderOut {
  id: UUID;
  kitchen_id: UUID;
  customer_phone: string;
  customer_name: string | null;
  delivery_address: string | null;
  notes: string | null;
  subtotal: number;
  total_amount: number;
  payment_status: PaymentStatus;
  status: OrderStatus;
  items: OrderItemOut[];
  broadcast_id: UUID | null;
  created_at: ISODateTime;
  accepted_at: ISODateTime | null;
  prep_started_at: ISODateTime | null;
  ready_at: ISODateTime | null;
  completed_at: ISODateTime | null;
}

export interface BroadcastCreate {
  menu_id: UUID;
  channel?: BroadcastChannel;
  message_template?: string | null;
}

export interface BroadcastOut {
  id: UUID;
  kitchen_id: UUID;
  menu_id: UUID | null;
  channel: BroadcastChannel;
  total_recipients: number;
  delivered_count: number;
  read_count: number;
  clicked_count: number;
  sent_at: ISODateTime;
}

export interface CheckoutItemRequest {
  menu_item_id: UUID;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutRequest {
  kitchen_id: UUID;
  menu_id: UUID;
  customer_phone: string;
  customer_name?: string | null;
  delivery_address?: string | null;
  notes?: string | null;
  broadcast_ref?: UUID | null;
  items: CheckoutItemRequest[];
}

export interface CheckoutResponse {
  session_id: string;
  checkout_url: string;
}

export interface PaginationParams {
  skip?: number;
  limit?: number;
}
