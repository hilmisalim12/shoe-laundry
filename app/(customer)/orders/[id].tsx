import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getOrder, subscribeToOrder } from '@/src/lib/api';
import { formatCurrency, formatDateTime } from '@/src/lib/format';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CustomerPageHeader } from '@/src/components/ui/CustomerPageHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { OrderTimeline } from '@/src/components/ui/OrderTimeline';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { ORDER_STATUS_LABELS, type Order } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const bottomPad = width >= 1024 ? 48 : 100;
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setOrder(await getOrder(id));
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    setLoaded(false);
    load();
    if (!id) return;
    return subscribeToOrder(id, load);
  }, [id, load]);

  if (!loaded) {
    return (
      <ScreenContainer scroll bottomPad={bottomPad}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!order) {
    return (
      <ScreenContainer scroll bottomPad={bottomPad}>
        <CustomerPageHeader title="Order not found" showBack />
        <EmptyState
          title="We couldn't find this order"
          description="It may have been removed or the link is incorrect."
        />
        <Button title="Back to orders" variant="outline" onPress={() => router.back()} fullWidth />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scroll
      maxWidth={640}
      bottomPad={bottomPad}
      keyboardAvoid
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <CustomerPageHeader
        title={`Order #${order.id.slice(-6).toUpperCase()}`}
        subtitle={formatDateTime(order.created_at)}
        showBack
      />

      <View style={styles.badges}>
        <Badge label={ORDER_STATUS_LABELS[order.status]} tone="primary" />
        <Badge
          label={order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
          tone={order.payment_status === 'paid' ? 'success' : 'warning'}
        />
      </View>

      {order.payment_status === 'unpaid' ? (
        <Card style={styles.cashCard}>
          <Text style={styles.cashTitle}>Pay with cash</Text>
          <Text style={typography.bodySm}>
            Total due: {formatCurrency(order.total)}. Pay at pickup, shop drop-off, or delivery.
          </Text>
        </Card>
      ) : (
        <Card style={styles.paidCard}>
          <Text style={styles.paidTitle}>Payment received</Text>
          <Text style={typography.bodySm}>
            {formatCurrency(order.amount_received ?? order.total)} confirmed on{' '}
            {order.payment_confirmed_at ? formatDateTime(order.payment_confirmed_at) : '-'}
          </Text>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <Text style={styles.section}>Details</Text>
        <DetailRow
          label="Logistics"
          value={order.logistics_type === 'pickup_delivery' ? 'Pickup & delivery' : 'Shop drop-off'}
        />
        <DetailRow label="Scheduled" value={formatDateTime(order.scheduled_at)} />
        {order.notes ? <DetailRow label="Notes" value={order.notes} stacked /> : null}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.section}>Items</Text>
        {order.order_items?.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemMain}>
              <Text style={typography.label}>{item.service?.name ?? 'Service'}</Text>
              <Text style={typography.bodySm}>
                {item.quantity}× {item.shoe_type}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(item.unit_price * item.quantity)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={typography.label}>Total</Text>
          <Text style={typography.h3}>{formatCurrency(order.total)}</Text>
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.section}>Progress</Text>
        <OrderTimeline events={order.order_status_events ?? []} />
      </Card>
    </ScreenContainer>
  );
}

function DetailRow({
  label,
  value,
  stacked,
}: {
  label: string;
  value: string;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <View style={styles.detailStacked}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValueInline}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { ...typography.bodySm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  cashCard: { backgroundColor: colors.warningBg, marginBottom: spacing.lg },
  cashTitle: { ...typography.label, color: colors.warning, marginBottom: spacing.sm },
  paidCard: { backgroundColor: colors.successBg, marginBottom: spacing.lg },
  paidTitle: { ...typography.label, color: colors.success, marginBottom: spacing.sm },
  sectionCard: { marginBottom: spacing.lg, width: '100%' },
  section: { ...typography.h3, marginBottom: spacing.md },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  detailStacked: { marginBottom: spacing.md, gap: 2 },
  detailLabel: { ...typography.bodySm, color: colors.mutedForeground, flexShrink: 0 },
  detailValueInline: {
    ...typography.bodySm,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    color: colors.foreground,
  },
  detailValue: { ...typography.bodySm, fontWeight: '500', color: colors.foreground },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  itemMain: { flex: 1, minWidth: 0, gap: 2 },
  itemPrice: { ...typography.label, flexShrink: 0 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
