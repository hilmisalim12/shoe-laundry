import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getAllOrders, getDashboardStats } from '@/src/lib/api';
import { formatCurrency, formatDateTime } from '@/src/lib/format';
import {
  ORDER_STATUS_FILTER_GROUPS,
  matchesStatusFilter,
  type OrderStatusFilter,
} from '@/src/lib/orderFilters';
import { AdminPageHeader } from '@/src/components/ui/AdminPageHeader';
import { AdminScrollPage } from '@/src/components/ui/AdminScrollPage';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { FilterChips } from '@/src/components/ui/FilterChips';
import { StatCard } from '@/src/components/ui/StatCard';
import { ORDER_STATUS_LABELS, type DashboardStats, type Order } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, allOrders] = await Promise.all([getDashboardStats(), getAllOrders()]);
    setStats(s);
    setOrders(allOrders);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const recent = useMemo(() => {
    return orders
      .filter((o) => matchesStatusFilter(o.status, statusFilter))
      .slice(0, 12);
  }, [orders, statusFilter]);

  return (
    <AdminScrollPage
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <AdminPageHeader title="Dashboard" subtitle="Overview of today's business activity" />
      <View style={styles.stats}>
        <StatCard label="Orders today" value={stats?.ordersToday ?? 0} />
        <StatCard label="Cash collected today" value={formatCurrency(stats?.cashCollectedToday ?? 0)} />
        <StatCard label="Unpaid orders" value={stats?.unpaidOrders ?? 0} />
        <StatCard label="Pending pickups" value={stats?.pendingPickups ?? 0} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>Recent orders</Text>
        <Text style={styles.sectionMeta}>{recent.length} shown</Text>
      </View>

      <FilterChips
        options={ORDER_STATUS_FILTER_GROUPS.map((g) => ({ label: g.label, value: g.value }))}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <View style={styles.list}>
        {!recent.length ? (
          <EmptyState title="No orders" description="No orders match this status filter." />
        ) : (
          recent.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push({ pathname: '/(admin)/orders/[id]', params: { id: order.id } })}
            >
              <Card style={styles.rowCard}>
                <View style={styles.rowTop}>
                  <Text style={typography.label}>
                    #{order.id.slice(-6).toUpperCase()} · {order.customer?.name ?? 'Customer'}
                  </Text>
                  <View style={styles.badges}>
                    <Badge label={ORDER_STATUS_LABELS[order.status]} tone="primary" />
                    <Badge
                      label={order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                      tone={order.payment_status === 'paid' ? 'success' : 'warning'}
                    />
                  </View>
                </View>
                <Text style={typography.bodySm}>
                  {formatCurrency(order.total)} · {formatDateTime(order.created_at)}
                </Text>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </AdminScrollPage>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xxxl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  section: { ...typography.h3 },
  sectionMeta: { ...typography.caption },
  list: { marginTop: spacing.lg, gap: spacing.md },
  rowCard: { marginBottom: 0 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'flex-end' },
});
