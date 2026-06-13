import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createOrder, getServices } from '@/src/lib/api';
import { parseScheduledValue, toScheduledIso } from '@/src/lib/datetime';
import { formatCurrency, formatDateTime } from '@/src/lib/format';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { DateTimePickerField } from '@/src/components/ui/DateTimePickerField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { CustomerPageHeader } from '@/src/components/ui/CustomerPageHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { ServiceCard } from '@/src/components/ui/ServiceCard';
import { StepIndicator } from '@/src/components/ui/StepIndicator';
import { useBookingStore } from '@/src/stores/bookingStore';
import { useUserStore } from '@/src/stores/userStore';
import { SHOP_LOCATION, type Service } from '@/src/types';
import { customerColors } from '@/src/theme/customerTheme';
import { spacing, typography } from '@/src/theme/tokens';

const STEPS = [
  { number: 1, label: 'Service' },
  { number: 2, label: 'Logistics' },
  { number: 3, label: 'Review' },
];

const SHOE_TYPES = ['Sneakers', 'Running shoes', 'Leather shoes', 'Boots', 'Sandals'];

const TIME_SLOTS = [
  { label: 'Tomorrow morning', hours: 10 },
  { label: 'Tomorrow afternoon', hours: 14 },
  { label: 'Day after morning', hours: 34 },
  { label: 'Day after afternoon', hours: 38 },
];

function slotToIso(hoursFromNow: number) {
  const d = new Date(Date.now() + hoursFromNow * 3600000);
  d.setMinutes(0, 0, 0);
  return d.toISOString().slice(0, 16);
}

function parseScheduledAt(value: string) {
  const parsed = parseScheduledValue(value);
  if (!parsed) throw new Error('Please choose a valid date and time.');
  const iso = toScheduledIso(parsed.date, parsed.hours, parsed.minutes);
  const date = new Date(iso);
  if (date.getTime() < Date.now()) {
    throw new Error('Please choose a future date and time.');
  }
  return date.toISOString();
}

export default function BookScreen() {
  const profile = useUserStore((s) => s.profile);
  const booking = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maxStep, setMaxStep] = useState(1);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  const selectedService = services.find((s) => s.id === booking.selectedServiceId);
  const subtotal = selectedService ? selectedService.base_price * booking.quantity : 0;
  const deliveryFee = booking.logisticsType === 'pickup_delivery' ? 15000 : 0;
  const total = subtotal + deliveryFee;

  const scheduledLabel = useMemo(() => {
    try {
      return formatDateTime(parseScheduledAt(booking.scheduledAt));
    } catch {
      return 'Invalid date';
    }
  }, [booking.scheduledAt]);

  function goToStep(step: number) {
    setError('');
    booking.setStep(step);
  }

  function validateStep1() {
    if (!booking.selectedServiceId) {
      setError('Please select a cleaning service.');
      return false;
    }
    if (booking.quantity < 1) {
      setError('Quantity must be at least 1.');
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (booking.logisticsType === 'pickup_delivery' && !booking.addressText.trim()) {
      setError('Please enter your pickup address.');
      return false;
    }
    try {
      parseScheduledAt(booking.scheduledAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid schedule.');
      return false;
    }
    return true;
  }

  function handleNextFromStep1() {
    if (!validateStep1()) return;
    setMaxStep(2);
    goToStep(2);
  }

  function handleNextFromStep2() {
    if (!validateStep2()) return;
    setMaxStep(3);
    goToStep(3);
  }

  async function handleSubmit() {
    setError('');

    if (!profile) {
      setError('You are not signed in. Please log in again.');
      return;
    }
    if (!validateStep1() || !validateStep2()) {
      setError('Please complete all required fields.');
      return;
    }
    if (!selectedService) {
      setError('Selected service is no longer available. Go back and pick another.');
      return;
    }

    try {
      setLoading(true);
      const order = await createOrder({
        customerId: profile.id,
        logisticsType: booking.logisticsType,
        scheduledAt: parseScheduledAt(booking.scheduledAt),
        notes: [
          booking.notes,
          booking.logisticsType === 'pickup_delivery' ? `Address: ${booking.addressText.trim()}` : 'Drop-off at shop',
        ]
          .filter(Boolean)
          .join('\n'),
        items: [
          {
            serviceId: selectedService.id,
            shoeType: booking.shoeType,
            quantity: booking.quantity,
            notes: booking.notes,
          },
        ],
        deliveryFee,
      });

      booking.reset();
      setMaxStep(1);
      router.replace(`/orders/${order.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll bottomPad={120} keyboardAvoid>
      <CustomerPageHeader title="Book cleaning" subtitle="3 quick steps — pay with cash when we meet you" />

      {booking.selectedServiceId && selectedService ? (
        <InlineMessage
          message={`${selectedService.name} is pre-selected. You can change it below.`}
          tone="info"
        />
      ) : null}

      <StepIndicator
        steps={STEPS}
        current={booking.step}
        maxReachable={maxStep}
        onStepPress={(step) => {
          if (step === 1) goToStep(1);
          if (step === 2 && maxStep >= 2) goToStep(2);
          if (step === 3 && maxStep >= 3) {
            if (!validateStep1() || !validateStep2()) return;
            goToStep(3);
          }
        }}
      />

      {error ? <InlineMessage message={error} tone="error" /> : null}

      {booking.step === 1 && (
        <View>
          <Text style={styles.sectionTitle}>1. Choose your service</Text>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={booking.selectedServiceId === service.id}
              onPress={() => {
                booking.setSelectedServiceId(service.id);
                setError('');
              }}
            />
          ))}

          <Card style={styles.detailsCard}>
            <Text style={styles.label}>Shoe type</Text>
            <View style={styles.chips}>
              {SHOE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => booking.setShoeType(type)}
                  style={[styles.chip, booking.shoeType === type && styles.chipActive]}
                >
                  <Text style={[styles.chipText, booking.shoeType === type && styles.chipTextActive]}>{type}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: spacing.lg }]}>How many pairs?</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => booking.setQuantity(booking.quantity - 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{booking.quantity}</Text>
              <Pressable
                onPress={() => booking.setQuantity(booking.quantity + 1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          </Card>

          <Button title="Continue to logistics →" onPress={handleNextFromStep1} fullWidth />
        </View>
      )}

      {booking.step === 2 && (
        <View>
          <Text style={styles.sectionTitle}>2. Pickup or drop-off</Text>
          <View style={styles.optionRow}>
            {(['pickup_delivery', 'dropoff'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => {
                  booking.setLogisticsType(type);
                  setError('');
                }}
                style={[styles.option, booking.logisticsType === type && styles.optionActive]}
              >
                <Text style={styles.optionIcon}>{type === 'pickup_delivery' ? '🚗' : '🏪'}</Text>
                <Text style={styles.optionTitle}>
                  {type === 'pickup_delivery' ? 'Pickup & delivery' : 'Drop-off at shop'}
                </Text>
                <Text style={styles.optionDesc}>
                  {type === 'pickup_delivery'
                    ? 'We collect and return your shoes (+ Rp 15.000)'
                    : 'Bring shoes to our studio — no delivery fee'}
                </Text>
              </Pressable>
            ))}
          </View>

          {booking.logisticsType === 'pickup_delivery' ? (
            <Card style={styles.detailsCard}>
              <Text style={styles.label}>Pickup address</Text>
              <Input
                placeholder="Street, building, unit number, landmarks..."
                value={booking.addressText}
                onChangeText={(text) => {
                  booking.setAddressText(text);
                  setError('');
                }}
                multiline
              />
            </Card>
          ) : (
            <Card style={[styles.detailsCard, styles.shopCard]}>
              <Text style={styles.label}>{SHOP_LOCATION.name}</Text>
              <Text style={typography.bodySm}>
                {SHOP_LOCATION.street}, {SHOP_LOCATION.city}
              </Text>
              <Text style={typography.caption}>{SHOP_LOCATION.hours}</Text>
            </Card>
          )}

          <Text style={[styles.label, { marginTop: spacing.lg }]}>When works for you?</Text>
          <View style={styles.chips}>
            {TIME_SLOTS.map((slot) => (
              <Pressable
                key={slot.label}
                onPress={() => booking.setScheduledAt(slotToIso(slot.hours))}
                style={[
                  styles.chip,
                  booking.scheduledAt === slotToIso(slot.hours) && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    booking.scheduledAt === slotToIso(slot.hours) && styles.chipTextActive,
                  ]}
                >
                  {slot.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Or choose a specific date & time</Text>
          <DateTimePickerField
            value={booking.scheduledAt}
            onChange={(value) => {
              booking.setScheduledAt(value);
              setError('');
            }}
          />

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Special notes (optional)</Text>
          <Input
            value={booking.notes}
            onChangeText={booking.setNotes}
            multiline
            placeholder="Stains, delicate material, etc."
          />

          <View style={styles.navRow}>
            <Button title="← Back" variant="secondary" onPress={() => goToStep(1)} flex />
            <Button title="Review order →" onPress={handleNextFromStep2} flex />
          </View>
        </View>
      )}

      {booking.step === 3 && (
        <View>
          <Text style={styles.sectionTitle}>3. Review & confirm</Text>

          <Card style={styles.summaryCard}>
            <SummaryRow label="Service" value={selectedService?.name ?? '-'} />
            <SummaryRow label="Shoes" value={`${booking.quantity}× ${booking.shoeType}`} />
            <SummaryRow
              label="Logistics"
              value={booking.logisticsType === 'pickup_delivery' ? 'Pickup & delivery' : 'Shop drop-off'}
            />
            {booking.logisticsType === 'pickup_delivery' ? (
              <SummaryRow label="Address" value={booking.addressText.trim() || '-'} />
            ) : null}
            <SummaryRow label="Scheduled" value={scheduledLabel} />
            <View style={styles.divider} />
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            {deliveryFee > 0 ? <SummaryRow label="Delivery fee" value={formatCurrency(deliveryFee)} /> : null}
            <SummaryRow label="Total due" value={formatCurrency(total)} highlight />
          </Card>

          <Card style={styles.cashCard}>
            <Text style={styles.cashTitle}>💵 Cash payment — no online checkout</Text>
            <Text style={typography.bodySm}>
              Pay {formatCurrency(total)} when we pick up your shoes, at shop drop-off, or on delivery.
            </Text>
          </Card>

          <View style={styles.navRow}>
            <Button title="← Edit" variant="secondary" onPress={() => goToStep(2)} flex disabled={loading} />
            <Button
              title={loading ? 'Submitting...' : 'Confirm booking ✓'}
              onPress={handleSubmit}
              loading={loading}
              flex
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[typography.bodySm, highlight && styles.summaryHighlightLabel]}>{label}</Text>
      <Text style={[highlight ? typography.h3 : typography.bodySm, highlight && styles.summaryHighlightValue]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.h3, marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  detailsCard: { marginBottom: spacing.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: customerColors.border,
    backgroundColor: customerColors.white,
  },
  chipActive: { backgroundColor: customerColors.primaryLight, borderColor: customerColors.primary },
  chipText: { ...typography.bodySm, color: customerColors.foreground },
  chipTextActive: { color: customerColors.primaryDark, fontWeight: '600' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: customerColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: customerColors.white,
  },
  qtyBtnText: { fontSize: 22, fontWeight: '600', color: customerColors.primary },
  qtyValue: { ...typography.h3, minWidth: 32, textAlign: 'center' },
  optionRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  option: {
    flex: 1,
    borderWidth: 2,
    borderColor: customerColors.border,
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: customerColors.white,
  },
  optionActive: { borderColor: customerColors.primary, backgroundColor: customerColors.primaryLight },
  optionIcon: { fontSize: 28, marginBottom: spacing.sm },
  optionTitle: { ...typography.label, marginBottom: 4 },
  optionDesc: { ...typography.caption, lineHeight: 18 },
  shopCard: { backgroundColor: customerColors.primaryLight, marginBottom: spacing.lg },
  summaryCard: { marginBottom: spacing.lg },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryHighlightLabel: { fontWeight: '600', color: customerColors.text },
  summaryHighlightValue: { color: customerColors.primary },
  divider: { height: 1, backgroundColor: customerColors.borderLight, marginVertical: spacing.md },
  cashCard: {
    backgroundColor: customerColors.primaryLight,
    marginBottom: spacing.xl,
    borderColor: customerColors.primaryLight,
  },
  cashTitle: { ...typography.label, color: customerColors.primaryDark, marginBottom: spacing.sm },
  navRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});
