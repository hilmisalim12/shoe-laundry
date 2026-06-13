import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { signOut } from '@/src/lib/auth';
import { colors, spacing, typography } from '@/src/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSignOut?: boolean;
  /** Extra content below title row (e.g. meta lines, badges) */
  children?: React.ReactNode;
};

export function AdminPageHeader({ title, subtitle, showBack, onBack, showSignOut, children }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {showBack ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
        ) : null}
        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={3}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {showSignOut ? (
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/login');
            }}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl, gap: spacing.md },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  textCol: { flex: 1, minWidth: 0, gap: spacing.xs },
  title: { ...typography.h1, fontSize: 26 },
  subtitle: { ...typography.bodySm },
});
