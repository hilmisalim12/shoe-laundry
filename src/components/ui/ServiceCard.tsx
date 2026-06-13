import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCurrency } from '@/src/lib/format';
import type { Service } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';
import { Card } from '@/src/components/ui/Card';

type Props = { service: Service; selected?: boolean; onPress?: () => void };

export function ServiceCard({ service, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card style={[styles.card, selected && styles.selected]}>
        <View style={styles.header}>
          <Text style={styles.name}>{service.name}</Text>
          <Text style={styles.price}>{formatCurrency(service.base_price)}</Text>
        </View>
        <Text style={styles.description}>{service.description}</Text>
        <Text style={styles.meta}>{service.estimated_days} day(s)</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.sm },
  name: { ...typography.h3, flex: 1 },
  price: { ...typography.label, color: colors.primary },
  description: { ...typography.bodySm, marginBottom: spacing.sm },
  meta: { ...typography.caption },
});
