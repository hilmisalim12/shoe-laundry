import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { signOut } from '@/src/lib/auth';
import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props =
  | {
      brand: true;
      title?: string;
      subtitle?: string;
      showBack?: boolean;
      onBack?: () => void;
      showSignOut?: boolean;
    }
  | {
      brand?: false;
      title: string;
      subtitle?: string;
      showBack?: boolean;
      onBack?: () => void;
      showSignOut?: boolean;
    };

export function CustomerPageHeader({
  title,
  subtitle,
  showBack,
  onBack,
  showSignOut = false,
  brand = false,
}: Props) {
  const theme = useAppTheme();

  if (brand) {
    return (
      <View style={[styles.brandBar, { borderBottomColor: theme.colors.borderLight }]}>
        <View style={styles.brandLeft}>
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
          <Text style={[theme.typography.h3, { color: theme.colors.primary }]}>Wash uh!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={[
            styles.iconBtn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.md,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.foreground} />
        </Pressable>
      ) : null}
      <View style={styles.textCol}>
        <Text style={theme.typography.h1}>{title}</Text>
        {subtitle ? <Text style={[theme.typography.bodySm, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      {showSignOut ? (
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/login');
          }}
          style={[
            styles.iconBtn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card,
              borderRadius: theme.radius.md,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 24,
  },
  textCol: { flex: 1, paddingTop: 2 },
  subtitle: { marginTop: 4 },
  iconBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
