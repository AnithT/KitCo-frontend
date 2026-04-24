export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'in_prep',
  'ready',
  'out_for_delivery',
  'completed',
  'rejected',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_prep', 'cancelled'],
  in_prep: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'completed'],
  out_for_delivery: ['completed'],
  completed: [],
  rejected: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): readonly OrderStatus[] {
  return TRANSITIONS[from];
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'New',
  accepted: 'Accepted',
  in_prep: 'In kitchen',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export interface StatusColors {
  bg: string;
  fg: string;
  border: string;
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, StatusColors> = {
  pending: { bg: '#fef3c7', fg: '#92400e', border: '#f59e0b' },
  accepted: { bg: '#dbeafe', fg: '#1e3a8a', border: '#3b82f6' },
  in_prep: { bg: '#ede9fe', fg: '#5b21b6', border: '#8b5cf6' },
  ready: { bg: '#d1fae5', fg: '#065f46', border: '#10b981' },
  out_for_delivery: { bg: '#cffafe', fg: '#155e75', border: '#06b6d4' },
  completed: { bg: '#e5e7eb', fg: '#374151', border: '#6b7280' },
  rejected: { bg: '#fee2e2', fg: '#991b1b', border: '#ef4444' },
  cancelled: { bg: '#fee2e2', fg: '#991b1b', border: '#ef4444' },
};

export function formatStatus(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status];
}
