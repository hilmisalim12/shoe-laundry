import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography } from '@/src/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
};

export function AdminPageHeader({ title, subtitle, showBack, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.foreground} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl, gap: spacing.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  backText: { ...typography.bodySm, color: colors.mutedForeground },
  textCol: { gap: spacing.xs },
  title: { ...typography.h1, fontSize: 28 },
  subtitle: { ...typography.bodySm },
});
