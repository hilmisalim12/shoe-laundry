import { StyleSheet, Text } from 'react-native';
import { Card } from '@/src/components/ui/Card';
import { colors, typography } from '@/src/theme/tokens';

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 160 },
  label: { ...typography.bodySm, marginBottom: 8 },
  value: { ...typography.h2, color: colors.primary },
});
