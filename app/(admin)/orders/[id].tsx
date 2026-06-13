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
  const wide = width >= 900;
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
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <AdminPageHeader
        title={`Order #${order.id.slice(-6).toUpperCase()}`}
        subtitle={`${order.customer?.name ?? 'Customer'} · ${formatDateTime(order.created_at)} · ${formatCurrency(order.total)}`}
        showBack
      />

      <View style={styles.badges}>
        <Badge label={ORDER_STATUS_LABELS[order.status]} tone="primary" />
        <Badge
          label={order.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
          tone={order.payment_status === 'paid' ? 'success' : 'warning'}
        />
      </View>

      {error ? <InlineMessage message={error} tone="error" /> : null}
      {success ? <InlineMessage message={success} tone="success" /> : null}

      <View style={[styles.grid, wide && styles.gridWide]}>
        <Card style={styles.panel}>
          <Text style={styles.panelTitle}>Customer & order</Text>
          <InfoRow label="Name" value={order.customer?.name ?? 'Unknown'} />
          <InfoRow label="Email" value={order.customer?.email ?? '-'} />
          <InfoRow label="Phone" value={order.customer?.phone ?? '-'} />
          <InfoRow
            label="Logistics"
            value={order.logistics_type === 'pickup_delivery' ? 'Pickup & delivery' : 'Drop-off'}
          />
          <InfoRow label="Scheduled" value={formatDateTime(order.scheduled_at)} />
          {order.notes ? <InfoRow label="Notes" value={order.notes} /> : null}
          <View style={styles.divider} />
          <Text style={styles.subheading}>Items</Text>
          {order.order_items?.map((item) => (
            <Text key={item.id} style={typography.bodySm}>
              {item.quantity}× {item.shoe_type} — {item.service?.name ?? 'Service'} (
              {formatCurrency(item.unit_price * item.quantity)})
            </Text>
          ))}
        </Card>

        <View style={styles.actionColumn}>
          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Cash payment</Text>
            {order.payment_status === 'paid' ? (
              <Text style={typography.bodySm}>
                Received {formatCurrency(order.amount_received ?? order.total)}
                {order.payment_confirmed_at ? ` on ${formatDateTime(order.payment_confirmed_at)}` : ''}
                {order.payment_note ? ` · ${order.payment_note}` : ''}
              </Text>
            ) : (
              <>
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
              </>
            )}
          </Card>

          <Card style={styles.panel}>
            <Text style={styles.panelTitle}>Update status</Text>
            <SelectField
              label="Order status"
              value={status}
              options={STATUS_OPTIONS}
              onChange={(v) => setStatus(v as OrderStatus)}
            />
            <FormField label="Note (optional)" style={{ marginTop: spacing.md }}>
              <Input value={statusNote} onChangeText={setStatusNote} placeholder="Optional update note" multiline />
            </FormField>
            <Button
              title="Save status"
              variant="secondary"
              onPress={handleStatusUpdate}
              loading={statusLoading}
              fullWidth
            />
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl, gap: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  grid: { gap: spacing.lg },
  gridWide: { flexDirection: 'row', alignItems: 'flex-start' },
  panel: { flex: 1, minWidth: 280 },
  actionColumn: { flex: 1, gap: spacing.lg, minWidth: 280 },
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
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  infoLabel: { ...typography.bodySm, flex: 1 },
  infoValue: { ...typography.bodySm, fontWeight: '500', flex: 1.5, textAlign: 'right', color: colors.foreground },
  timelinePanel: { marginTop: spacing.lg },
});
