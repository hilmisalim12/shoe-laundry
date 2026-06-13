import type { OrderStatus } from '@/src/types';

export type OrderStatusFilter =
  | 'all'
  | 'pending'
  | 'in_progress'
  | 'ready'
  | 'completed'
  | 'cancelled';

export const ORDER_STATUS_FILTER_GROUPS: {
  label: string;
  value: OrderStatusFilter;
  statuses?: OrderStatus[];
}[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending', statuses: ['confirmed', 'pickup_scheduled'] },
  {
    label: 'In Progress',
    value: 'in_progress',
    statuses: ['picked_up', 'dropped_off', 'cleaning', 'quality_check'],
  },
  { label: 'Ready for Pickup', value: 'ready', statuses: ['ready', 'out_for_delivery'] },
  { label: 'Completed', value: 'completed', statuses: ['completed'] },
  { label: 'Cancelled', value: 'cancelled', statuses: ['cancelled'] },
];

export function matchesStatusFilter(status: OrderStatus, filter: OrderStatusFilter): boolean {
  if (filter === 'all') return true;
  const group = ORDER_STATUS_FILTER_GROUPS.find((g) => g.value === filter);
  return group?.statuses?.includes(status) ?? true;
}
