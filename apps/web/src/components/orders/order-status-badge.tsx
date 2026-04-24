import { ORDER_STATUS_LABELS, type OrderStatus } from '@kitco/shared';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const variantByStatus: Record<OrderStatus, NonNullable<BadgeProps['variant']>> = {
  pending: 'warning',
  accepted: 'info',
  in_prep: 'default',
  ready: 'success',
  out_for_delivery: 'info',
  completed: 'muted',
  rejected: 'destructive',
  cancelled: 'destructive',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={variantByStatus[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
