import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '@/src/lib/format';
import { useAppTheme } from '@/src/theme/AppThemeContext';
import type { Service } from '@/src/types';
import { Card } from '@/src/components/ui/Card';

type Props = { service: Service; selected?: boolean; onPress?: () => void };

export function ServiceCard({ service, selected, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card
        style={[
          styles.card,
          selected && { borderWidth: 2, borderColor: theme.colors.primary },
        ]}
      >
        <View style={styles.header}>
          <Text style={theme.typography.h3}>{service.name}</Text>
          <Text style={[theme.typography.label, { color: theme.colors.primary }]}>
            {formatCurrency(service.base_price)}
          </Text>
        </View>
        <Text style={theme.typography.bodySm}>{service.description}</Text>
        <Text style={theme.typography.caption}>{service.estimated_days} day(s)</Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
});
