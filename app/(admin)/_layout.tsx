import { Slot, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequireAuth } from '@/src/components/AuthGuard';
import { signOut } from '@/src/lib/auth';
import { colors, spacing, typography } from '@/src/theme/tokens';

const NAV = [
  { href: '/(admin)/dashboard' as const, label: 'Dashboard', short: 'Dash' },
  { href: '/(admin)/orders' as const, label: 'Orders', short: 'Orders' },
  { href: '/(admin)/services' as const, label: 'Services', short: 'Svc' },
  { href: '/(admin)/customers' as const, label: 'Customers', short: 'Users' },
];

export default function AdminLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 1024;

  if (!isWide) {
    return (
      <RequireAuth role="admin">
        <View style={styles.mobileRoot}>
        <View style={[styles.mobileTopBar, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.mobileBrand}>Shoe Laundry Admin</Text>
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/login');
            }}
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
        <View style={styles.mobileNav}>
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href.replace('/(admin)', ''));
            return (
              <Pressable
                key={item.href}
                onPress={() => router.push(item.href)}
                style={[styles.mobileNavItem, active && styles.mobileNavActive]}
              >
                <Text style={[styles.mobileNavText, active && styles.mobileNavTextActive]}>
                  {item.short}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.mobileMain}>
          <Slot />
        </View>
        </View>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth role="admin">
      <View style={styles.root}>
      <View style={[styles.sidebar, { paddingTop: insets.top + spacing.xl }]}>
        <Text style={styles.logo}>Shoe Laundry</Text>
        <Text style={styles.logoSub}>Admin panel</Text>
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href.replace('/(admin)', ''));
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/login');
          }}
          style={styles.signOut}
        >
          <Text style={styles.signOutSidebar}>Sign out</Text>
        </Pressable>
      </View>
      <View style={styles.main}>
        <Slot />
      </View>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.muted, minHeight: 0 },
  sidebar: {
    width: 260,
    backgroundColor: colors.adminSidebar,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  logo: { ...typography.h3, color: colors.white, marginBottom: 2 },
  logoSub: { ...typography.caption, color: colors.adminSidebarForeground, marginBottom: spacing.xxxl },
  navItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  navItemActive: { backgroundColor: colors.adminSidebarActive },
  navText: { ...typography.label, color: colors.adminSidebarForeground, fontWeight: '500' },
  navTextActive: { color: colors.white },
  signOut: { marginTop: 'auto', padding: spacing.md },
  signOutSidebar: { ...typography.bodySm, color: colors.adminSidebarForeground },
  main: { flex: 1, minHeight: 0, overflow: 'hidden' as const },
  mobileRoot: { flex: 1, backgroundColor: colors.muted, minHeight: 0 },
  mobileTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mobileBrand: { ...typography.label, color: colors.foreground },
  signOutText: { ...typography.bodySm, color: colors.mutedForeground },
  mobileNav: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  mobileNavItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  mobileNavActive: { backgroundColor: colors.primaryLight },
  mobileNavText: { ...typography.caption, fontWeight: '600', color: colors.mutedForeground },
  mobileNavTextActive: { color: colors.primaryDark },
  mobileMain: { flex: 1, minHeight: 0 },
});
