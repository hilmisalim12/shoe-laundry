import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getServices } from '@/src/lib/api';
import { Button } from '@/src/components/ui/Button';
import { CustomerPageHeader } from '@/src/components/ui/CustomerPageHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { ServiceGrid, ServiceGridCard, ServiceGridItem } from '@/src/components/ui/ServiceGridCard';
import { useBookingStore } from '@/src/stores/bookingStore';
import type { Service } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function CustomerHome() {
  const booking = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      setServices(await getServices());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleServicePress(serviceId: string) {
    booking.setSelectedServiceId(serviceId);
    booking.setStep(1);
    router.push('/(customer)/book');
  }

  function handleBookNow() {
    booking.reset();
    router.push('/(customer)/book');
  }

  return (
    <ScreenContainer scroll maxWidth={960} bottomPad={96}>
      <CustomerPageHeader
        title="Fresh kicks, delivered clean"
        subtitle="Book pickup or drop-off. Pay with cash when we meet you."
      />

      {error ? <InlineMessage message={error} tone="error" /> : null}

      <Button title="Book cleaning now" onPress={handleBookNow} fullWidth size="lg" />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Our services</Text>
        <Text style={styles.sectionHint}>Tap a service to book instantly</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : !services.length ? (
        <EmptyState title="No services available" description="Please check back later." />
      ) : (
        <ServiceGrid>
          {services.map((service) => (
            <ServiceGridItem key={service.id}>
              <ServiceGridCard service={service} onPress={() => handleServicePress(service.id)} />
            </ServiceGridItem>
          ))}
        </ServiceGrid>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { marginTop: spacing.xxxl, marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, marginBottom: spacing.xs },
  sectionHint: { ...typography.bodySm },
});
