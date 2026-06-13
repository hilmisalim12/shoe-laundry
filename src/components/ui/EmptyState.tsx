import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/src/theme/tokens';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  title: { ...typography.h3, color: colors.mutedForeground },
  description: { ...typography.bodySm, textAlign: 'center' },
});
