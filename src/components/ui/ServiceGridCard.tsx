import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatCurrency } from '@/src/lib/format';
import { getServiceAccent, getServiceIcon } from '@/src/lib/services';
import type { Service } from '@/src/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme/tokens';

type Props = {
  service: Service;
  onPress: () => void;
};

export function ServiceGridCard({ service, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Book ${service.name}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: getServiceAccent(service.name) }]}>
        <Ionicons name={getServiceIcon(service.name) as keyof typeof Ionicons.glyphMap} size={28} color={colors.primaryDark} />
      </View>
      <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{service.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>{formatCurrency(service.base_price)}</Text>
        <Text style={styles.meta}>{service.estimated_days}d</Text>
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Book →</Text>
      </View>
    </Pressable>
  );
}

export function ServiceGrid({ children }: { children: React.ReactNode }) {
  return <View style={styles.grid}>{children}</View>;
}

export function ServiceGridItem({ children }: { children: React.ReactNode }) {
  return <View style={styles.gridItem}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '48%',
    minWidth: 150,
    flexGrow: 1,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    ...shadows.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: { ...typography.label, marginBottom: spacing.xs },
  description: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md, minHeight: 36 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  price: { ...typography.label, color: colors.primary },
  meta: { ...typography.caption },
  cta: { borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm },
  ctaText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
