import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/Card';
import { colors, spacing, typography } from '@/src/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>Shoe Laundry</Text>
        <Text style={styles.tagline}>Professional shoe cleaning service</Text>
      </View>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.content}>{children}</View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: spacing.xl },
  brandBlock: { alignItems: 'center', gap: spacing.xs },
  brand: { ...typography.h2, color: colors.primary },
  tagline: { ...typography.bodySm },
  card: { gap: spacing.lg },
  header: { gap: spacing.xs, alignItems: 'center' },
  title: { ...typography.h2 },
  subtitle: { ...typography.bodySm, textAlign: 'center' },
  content: { gap: spacing.lg },
});
