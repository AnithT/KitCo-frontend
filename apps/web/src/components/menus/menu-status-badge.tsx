import type { MenuStatus } from '@kitco/api-client';
import { Badge, type BadgeProps } from '@/components/ui/badge';

const variant: Record<MenuStatus, NonNullable<BadgeProps['variant']>> = {
  draft: 'muted',
  published: 'success',
  archived: 'secondary',
};

const label: Record<MenuStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  return <Badge variant={variant[status]}>{label[status]}</Badge>;
}
