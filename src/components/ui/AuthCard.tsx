import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/ui/Card';
import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.brandBlock}>
        <Text style={[theme.typography.h2, { color: theme.colors.primary }]}>Shoe Laundry</Text>
        <Text style={theme.typography.bodySm}>Professional shoe cleaning service</Text>
      </View>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={theme.typography.h2}>{title}</Text>
          {subtitle ? <Text style={[theme.typography.bodySm, styles.subtitle]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.content}>{children}</View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: 24 },
  brandBlock: { alignItems: 'center', gap: 4 },
  card: { gap: 16 },
  header: { gap: 4, alignItems: 'center' },
  subtitle: { textAlign: 'center' },
  content: { gap: 16 },
});
