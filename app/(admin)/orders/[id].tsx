import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { confirmCashPayment, getOrder, subscribeToOrder, updateOrderStatus } from '@/src/lib/api';
import { formatCurrency, formatDateTime } from '@/src/lib/format';
import { AdminPageHeader } from '@/src/components/ui/AdminPageHeader';
import { AdminScrollPage } from '@/src/components/ui/AdminScrollPage';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { OrderTimeline } from '@/src/components/ui/OrderTimeline';
import { SelectField } from '@/src/components/ui/SelectField';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/src/types';
import { useUserStore } from '@/src/stores/userStore';
import { colors, spacing, typography } from '@/src/theme/tokens';

const STATUS_OPTIONS = ORDER_STATUSES.map((s) => ({
  label: ORDER_STATUS_LABELS[s],
  value: s,
}));

export default function AdminOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const stackInfo = width < 640;
  const admin = useUserStore((s) => s.profile);
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<OrderStatus>('confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    const data = await getOrder(id);
    setOrder(data);
    setLoaded(true);
    if (data) {
      setStatus(data.status);
      setAmount(String(data.total));
    }
  }, [id]);

  useEffect(() => {
    setLoaded(false);
    load();
    if (!id) return;
    return subscribeToOrder(id, load);
  }, [id, load]);

  async function handleStatusUpdate() {
    if (!order || !admin) return;
    setError('');
    setSuccess('');
    try {
      setStatusLoading(true);
      await updateOrderStatus(
        order.id,
        status,
        statusNote || `Status updated to ${ORDER_STATUS_LABELS[status]}`,
        admin.id,
      );
      setStatusNote('');
      await load();
      setSuccess(`Order status updated to ${ORDER_STATUS_LABELS[status]}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleConfirmPayment() {
    if (!order || !admin) return;
    setError('');
    setSuccess('');
    const received = Number(amount);
    if (!received || received <= 0) {
      setError('Enter the cash amount received.');
      return;
    }
    try {
      setPaymentLoading(true);
      await confirmCashPayment(order.id, received, paymentNote, admin.id);
      setPaymentNote('');
      await load();
      setSuccess('Cash payment recorded.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to confirm payment.');
    } finally {
      setPaymentLoading(false);
    }
  }

  if (!loaded) {
    return (
      <AdminScrollPage maxWidth={1100}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={typography.bodySm}>Loading order...</Text>
        </View>
      </AdminScrollPage>
    );
  }

  if (!order) {
    return (
      <AdminScrollPage maxWidth={1100}>
        <AdminPageHeader title="Order not found" showBack />
        <EmptyState
          title="This order doesn't exist"
          description="It may have been deleted or the link is incorrect."
        />
      </AdminScrollPage>
    );
  }

  return (
    <AdminScrollPage
      maxWidth={1100}
      keyboardAvoid
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <AdminPageHeader
        title={`Order #${order.id.slice(-6).toUpperCase()}`}
        showBack
      >
        <View style={styles.metaBlock}>
          <View style={styles.badges}>
            <Badge label={ORDER_STATUS_LABELS[order.status]} tone="primary" />
            <Badge
              label={order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              tone={order.payment_status === 'paid' ? 'success' : 'warning'}
            />
          </View>
          <Text style={styles.metaLine}>{order.customer?.name ?? 'Customer'}</Text>
          <Text style={styles.metaLine}>{formatDateTime(order.created_at)}</Text>
          <Text style={styles.metaTotal}>{formatCurrency(order.total)}</Text>
        </View>
      </AdminPageHeader>

      {error ? <InlineMessage message={error} tone="error" /> : null}
      {success ? <InlineMessage message={success} tone="success" /> : null}

      <View style={[styles.grid, isWide && styles.gridWide]}>
        <Card style={isWide ? styles.columnPanel : styles.stackItem}>
          <Text style={styles.panelTitle}>Customer & order</Text>
          <InfoRow stacked={stackInfo} label="Name" value={order.customer?.name ?? 'Unknown'} />
          <InfoRow stacked={stackInfo} label="Email" value={order.customer?.email ?? '-'} />
          <InfoRow stacked={stackInfo} label="Phone" value={order.customer?.phone ?? '-'} />
          <InfoRow
            stacked={stackInfo}
            label="Logistics"
            value={order.logistics_type === 'pickup_delivery' ? 'Pickup & delivery' : 'Drop-off'}
          />
          <InfoRow stacked={stackInfo} label="Scheduled" value={formatDateTime(order.scheduled_at)} />
          {order.notes ? <InfoRow stacked={stackInfo} label="Notes" value={order.notes} /> : null}
          <View style={styles.divider} />
          <Text style={styles.subheading}>Items</Text>
          {order.order_items?.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>
                {item.quantity}× {item.shoe_type} — {item.service?.name ?? 'Service'}
              </Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.unit_price * item.quantity)}</Text>
            </View>
          ))}
        </Card>

        <View style={[styles.actionColumn, isWide ? styles.actionColumnWide : styles.stackItem]}>
          <Card style={styles.actionCard}>
            <Text style={styles.panelTitle}>Cash payment</Text>
            {order.payment_status === 'paid' ? (
              <Text style={typography.bodySm}>
                Received {formatCurrency(order.amount_received ?? order.total)}
                {order.payment_confirmed_at ? ` on ${formatDateTime(order.payment_confirmed_at)}` : ''}
                {order.payment_note ? ` · ${order.payment_note}` : ''}
              </Text>
            ) : (
              <View style={styles.formBlock}>
                <Text style={typography.bodySm}>Amount due: {formatCurrency(order.total)}</Text>
                <FormField label="Amount received">
                  <Input value={amount} onChangeText={setAmount} keyboardType="number-pad" />
                </FormField>
                <FormField label="Note (optional)">
                  <Input value={paymentNote} onChangeText={setPaymentNote} placeholder="Paid at pickup" />
                </FormField>
                <Button
                  title="Confirm cash payment"
                  onPress={handleConfirmPayment}
                  loading={paymentLoading}
                  fullWidth
                />
              </View>
            )}
          </Card>

          <Card style={styles.actionCard}>
            <Text style={styles.panelTitle}>Update status</Text>
            <View style={styles.formBlock}>
              <SelectField
                label="Order status"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(v) => setStatus(v as OrderStatus)}
              />
              <FormField label="Note (optional)">
                <Input value={statusNote} onChangeText={setStatusNote} placeholder="Optional update note" multiline />
              </FormField>
              <Button
                title="Save status"
                variant="secondary"
                onPress={handleStatusUpdate}
                loading={statusLoading}
                fullWidth
              />
            </View>
          </Card>
        </View>
      </View>

      <Card style={styles.timelinePanel}>
        <Text style={styles.panelTitle}>Activity timeline</Text>
        <OrderTimeline events={order.order_status_events ?? []} />
      </Card>
    </AdminScrollPage>
  );
}

function InfoRow({
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
      <View style={styles.infoRowStacked}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValueStacked}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  metaBlock: { gap: spacing.xs },
  metaLine: { ...typography.bodySm, color: colors.mutedForeground },
  metaTotal: { ...typography.label, color: colors.foreground, marginTop: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xs },
  grid: { gap: spacing.lg, width: '100%' },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  columnPanel: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
  stackItem: { width: '100%', flex: 0, flexGrow: 0, flexShrink: 0 },
  actionColumn: { gap: spacing.lg, width: '100%' },
  actionColumnWide: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
  actionCard: { width: '100%', flexGrow: 0, flexShrink: 0, alignSelf: 'stretch' },
  formBlock: { gap: spacing.md },
  panelTitle: {
    ...typography.label,
    marginBottom: spacing.md,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subheading: { ...typography.label, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.md },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  infoRowStacked: {
    marginBottom: spacing.md,
    gap: 2,
  },
  infoLabel: { ...typography.bodySm, color: colors.mutedForeground, flexShrink: 0 },
  infoValue: {
    ...typography.bodySm,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    color: colors.foreground,
  },
  infoValueStacked: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.foreground,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  itemTitle: { ...typography.bodySm, flex: 1, minWidth: 160 },
  itemPrice: { ...typography.bodySm, fontWeight: '600', flexShrink: 0 },
  timelinePanel: { marginTop: spacing.lg, width: '100%' },
});
