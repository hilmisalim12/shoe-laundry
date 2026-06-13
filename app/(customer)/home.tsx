import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getServices } from '@/src/lib/api';
import { Button } from '@/src/components/ui/Button';
import { CustomerPageHeader } from '@/src/components/ui/CustomerPageHeader';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { ServiceGrid, ServiceGridCard, ServiceGridItem } from '@/src/components/ui/ServiceGridCard';
import { useAppTheme } from '@/src/theme/AppThemeContext';
import { useBookingStore } from '@/src/stores/bookingStore';
import type { Service } from '@/src/types';

const HOW_IT_WORKS = [
  { icon: 'cube-outline' as const, title: 'Schedule pickup', desc: 'Book online and choose a time that works for you.' },
  { icon: 'sparkles-outline' as const, title: 'Expert cleaning', desc: 'We deep clean and restore your footwear with care.' },
  { icon: 'bicycle-outline' as const, title: 'Fresh delivery', desc: 'Your shoes return looking and feeling brand new.' },
];

export default function CustomerHome() {
  const theme = useAppTheme();
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
    <ScreenContainer scroll bottomPad={96}>
      <CustomerPageHeader brand />

      {error ? <InlineMessage message={error} tone="error" /> : null}

      {/* Hero — Stitch "Lather & Sole" style */}
      <View style={[styles.hero, { backgroundColor: theme.colors.primaryContainer, borderRadius: theme.radius.xl }]}>
        <View style={styles.heroContent}>
          <Text style={[theme.typography.display, { color: theme.colors.primaryForeground }]}>
            The new shoe feeling, delivered.
          </Text>
          <Text style={[theme.typography.body, styles.heroSub, { color: 'rgba(255,255,255,0.92)' }]}>
            Professional sneaker laundry service. We pick up, deep clean, and return your footwear to its former glory.
          </Text>
          <Button title="Book a clean" onPress={handleBookNow} variant="surface" size="lg" />
        </View>
        <View style={[styles.heroGlow, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={theme.typography.h2}>Our services</Text>
        <Text style={theme.typography.bodySm}>Expert care for every material</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
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

      {/* How it works */}
      <View style={[styles.howSection, { backgroundColor: theme.colors.surfaceContainerLow, borderRadius: theme.radius.xl }]}>
        <Text style={[theme.typography.h2, styles.howTitle, { color: theme.colors.primary }]}>How it works</Text>
        <Text style={[theme.typography.bodySm, styles.howSub]}>
          Get your shoes cleaned in 3 simple steps without leaving your home.
        </Text>
        {HOW_IT_WORKS.map((step) => (
          <View key={step.title} style={[styles.howRow, { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg }]}>
            <View style={[styles.howIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name={step.icon} size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.howText}>
              <Text style={theme.typography.label}>{step.title}</Text>
              <Text style={theme.typography.bodySm}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    marginBottom: 32,
    minHeight: 280,
    justifyContent: 'center',
  },
  heroContent: { padding: 24, zIndex: 1 },
  heroSub: { marginTop: 12, marginBottom: 20, maxWidth: 340 },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -40,
    bottom: -40,
  },
  sectionHeader: { marginBottom: 16, gap: 4 },
  howSection: { marginTop: 40, padding: 24, gap: 12 },
  howTitle: { textAlign: 'center' },
  howSub: { textAlign: 'center', marginBottom: 8 },
  howRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
  },
  howIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  howText: { flex: 1, gap: 2 },
});
