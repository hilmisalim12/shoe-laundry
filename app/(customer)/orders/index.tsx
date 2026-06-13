import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getCustomerOrders } from '@/src/lib/api';
import { formatCurrency, formatDateTime } from '@/src/lib/format';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CustomerPageHeader } from '@/src/components/ui/CustomerPageHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { ORDER_STATUS_LABELS, type Order } from '@/src/types';
import { useUserStore } from '@/src/stores/userStore';
import { spacing, typography } from '@/src/theme/tokens';

export default function OrdersScreen() {
  const profile = useUserStore((s) => s.profile);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      setError('');
      setOrders(await getCustomerOrders(profile.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders.');
    }
  }, [profile]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <ScreenContainer
      scroll
      bottomPad={96}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <CustomerPageHeader title="My orders" subtitle="Track status and payment for your cleans" />
      {error ? <InlineMessage message={error} tone="error" /> : null}

      {!orders.length ? (
        <EmptyState title="No orders yet" description="Book your first shoe cleaning to get started." />
      ) : null}
      {!orders.length ? (
        <Button title="Book cleaning" onPress={() => router.push('/(customer)/book')} fullWidth />
      ) : null}

      {orders.map((order) => (
        <Pressable
          key={order.id}
          onPress={() => router.push(`/orders/${order.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`Order ${order.id.slice(-6)}, ${ORDER_STATUS_LABELS[order.status]}`}
        >
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
              <Badge
                label={order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                tone={order.payment_status === 'paid' ? 'success' : 'warning'}
              />
            </View>
            <Text style={typography.bodySm}>{ORDER_STATUS_LABELS[order.status]}</Text>
            <Text style={typography.bodySm}>
              {formatCurrency(order.total)} · {formatDateTime(order.created_at)}
            </Text>
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderId: { ...typography.label },
});
