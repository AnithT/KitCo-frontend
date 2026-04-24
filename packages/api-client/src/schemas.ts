import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_prep',
  'ready',
  'out_for_delivery',
  'completed',
  'rejected',
  'cancelled',
]);

export const paymentStatusSchema = z.enum(['unpaid', 'paid', 'refunded', 'failed']);
export const menuStatusSchema = z.enum(['draft', 'published', 'archived']);
export const channelPreferenceSchema = z.enum(['whatsapp', 'sms', 'both']);
export const broadcastChannelSchema = z.enum(['whatsapp', 'sms']);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const kitchenRegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  timezone: z.string().default('UTC'),
});

export const menuItemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  cost: z.number().nonnegative().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  category: z.string().optional().nullable(),
  stock_quantity: z.number().int().nonnegative().optional().nullable(),
  is_available: z.boolean().default(true),
  prep_time_minutes: z.number().int().nonnegative().optional().nullable(),
  sort_order: z.number().int().default(0),
});

export const menuCreateSchema = z.object({
  title: z.string().default('Daily Menu'),
  date: z.string(),
  items: z.array(menuItemCreateSchema).default([]),
});

export const customerCreateSchema = z.object({
  phone: z.string().min(1),
  name: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  channel_preference: channelPreferenceSchema.default('whatsapp'),
});

export const orderItemCreateSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export const orderCreateSchema = z.object({
  kitchen_id: z.string().uuid(),
  menu_id: z.string().uuid(),
  customer_phone: z.string().min(1),
  customer_name: z.string().optional().nullable(),
  delivery_address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(orderItemCreateSchema).min(1),
  broadcast_ref: z.string().uuid().optional().nullable(),
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
});

export const broadcastCreateSchema = z.object({
  menu_id: z.string().uuid(),
  channel: broadcastChannelSchema.default('whatsapp'),
  message_template: z.string().optional().nullable(),
});

export const checkoutItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutRequestSchema = z.object({
  kitchen_id: z.string().uuid(),
  menu_id: z.string().uuid(),
  customer_phone: z.string().min(1),
  customer_name: z.string().optional().nullable(),
  delivery_address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  broadcast_ref: z.string().uuid().optional().nullable(),
  items: z.array(checkoutItemSchema).min(1),
});
