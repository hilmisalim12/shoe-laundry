import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatCurrency } from '@/src/lib/format';
import { getServiceAccent, getServiceIcon } from '@/src/lib/services';
import { useAppTheme } from '@/src/theme/AppThemeContext';
import type { Service } from '@/src/types';

function formatEstimatedDays(days: number): string {
  return days === 1 ? '1 day' : `${days} days`;
}

type Props = {
  service: Service;
  onPress: () => void;
};

export function ServiceGridCard({ service, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.borderLight,
          borderRadius: theme.radius.lg,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Book ${service.name}, ${formatEstimatedDays(service.estimated_days)} turnaround`}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.isCustomer ? theme.colors.primaryLight : getServiceAccent(service.name),
            borderRadius: theme.radius.md,
          },
        ]}
      >
        <Ionicons
          name={getServiceIcon(service.name) as keyof typeof Ionicons.glyphMap}
          size={22}
          color={theme.colors.primary}
        />
      </View>

      <Text style={[theme.typography.label, styles.name]} numberOfLines={2}>
        {service.name}
      </Text>
      <Text
        style={[theme.typography.caption, styles.description, { color: theme.colors.textMuted }]}
        numberOfLines={2}
      >
        {service.description}
      </Text>

      <View style={[styles.footer, { borderTopColor: theme.colors.borderLight }]}>
        <Text style={[styles.price, { color: theme.colors.primary }]} numberOfLines={1}>
          {formatCurrency(service.base_price)}
        </Text>
        <View style={[styles.turnaroundChip, { backgroundColor: theme.colors.muted }]}>
          <Ionicons name="time-outline" size={13} color={theme.colors.textMuted} />
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
            Est. turnaround
          </Text>
          <Text style={[theme.typography.caption, styles.turnaroundValue, { color: theme.colors.foreground }]}>
            {formatEstimatedDays(service.estimated_days)}
          </Text>
        </View>
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
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    borderWidth: 1,
    padding: 14,
    minHeight: 176,
  },
  pressed: { opacity: 0.94 },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  description: {
    lineHeight: 16,
    minHeight: 32,
    marginBottom: 12,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  turnaroundChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  turnaroundValue: {
    fontWeight: '600',
  },
});
