import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getAllOrders } from '@/src/lib/api';
import { formatCurrency, formatDateTime } from '@/src/lib/format';
import { AdminPageHeader } from '@/src/components/ui/AdminPageHeader';
import { AdminScrollPage } from '@/src/components/ui/AdminScrollPage';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { FilterChips } from '@/src/components/ui/FilterChips';
import { SelectField } from '@/src/components/ui/SelectField';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

const PAYMENT_FILTERS: { label: string; value: PaymentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
];

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  ...ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s })),
];

export default function AdminOrdersScreen() {
  const { customerId } = useLocalSearchParams<{ customerId?: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => setOrders(await getAllOrders()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const customerName = useMemo(() => {
    if (!customerId) return null;
    return orders.find((o) => o.customer_id === customerId)?.customer?.name ?? 'Customer';
  }, [orders, customerId]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const customerOk = !customerId || o.customer_id === customerId;
      const paymentOk = paymentFilter === 'all' || o.payment_status === paymentFilter;
      const statusOk = statusFilter === 'all' || o.status === statusFilter;
      return customerOk && paymentOk && statusOk;
    });
  }, [orders, customerId, paymentFilter, statusFilter]);

  return (
    <AdminScrollPage
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <AdminPageHeader
        title="Orders"
        subtitle={
          customerId
            ? `${filtered.length} order(s) for ${customerName}`
            : `${filtered.length} of ${orders.length} orders`
        }
      />

      {customerId ? (
        <View style={styles.customerBanner}>
          <Text style={styles.customerBannerText}>Showing orders for {customerName}</Text>
          <Button
            title="Clear filter"
            variant="outline"
            onPress={() => router.replace('/(admin)/orders')}
          />
        </View>
      ) : null}

      <View style={styles.filtersRow}>
        <Text style={styles.inlineLabel}>Payment</Text>
        <FilterChips options={PAYMENT_FILTERS} value={paymentFilter} onChange={setPaymentFilter} wrap={false} />
        <View style={styles.filterDivider} />
        <Text style={styles.inlineLabel}>Status</Text>
        <View style={styles.statusSelect}>
          <SelectField
            compact
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(v) => setStatusFilter(v as OrderStatus | 'all')}
            placeholder="All statuses"
          />
        </View>
      </View>

      <View style={styles.list}>
        {!filtered.length ? (
          <EmptyState
            title="No orders"
            description={
              customerId
                ? 'This customer has no orders matching your filters.'
                : 'Try adjusting your payment or status filters.'
            }
          />
        ) : (
          filtered.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push({ pathname: '/(admin)/orders/[id]', params: { id: order.id } })}
            >
              <Card style={styles.card}>
                <View style={styles.top}>
                  <Text style={typography.label}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <View style={styles.badges}>
                    <Badge label={ORDER_STATUS_LABELS[order.status]} tone="primary" />
                    <Badge
                      label={order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                      tone={order.payment_status === 'paid' ? 'success' : 'warning'}
                    />
                  </View>
                </View>
                <Text style={typography.bodySm}>
                  {order.customer?.name ?? 'Customer'} ·{' '}
                  {order.logistics_type === 'pickup_delivery' ? 'Pickup' : 'Drop-off'} ·{' '}
                  {formatCurrency(order.total)}
                </Text>
                <Text style={typography.caption}>{formatDateTime(order.created_at)}</Text>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </AdminScrollPage>
  );
}

const styles = StyleSheet.create({
  customerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.muted,
    borderRadius: 8,
  },
  customerBannerText: { ...typography.bodySm, flex: 1 },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  inlineLabel: {
    ...typography.label,
    fontSize: 13,
    color: colors.mutedForeground,
    flexShrink: 0,
  },
  filterDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
    flexShrink: 0,
  },
  statusSelect: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    maxWidth: 220,
  },
  list: { marginTop: spacing.lg, gap: spacing.md },
  card: { marginBottom: 0 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
});
