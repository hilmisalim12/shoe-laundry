import { Tabs, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequireAuth } from '@/src/components/AuthGuard';
import { signOut } from '@/src/lib/auth';
import { colors, spacing, typography } from '@/src/theme/tokens';

const SIDEBAR_NAV = [
  { href: '/(admin)/dashboard' as const, label: 'Dashboard' },
  { href: '/(admin)/orders' as const, label: 'Orders' },
  { href: '/(admin)/services' as const, label: 'Services' },
  { href: '/(admin)/customers' as const, label: 'Customers' },
];

function isActive(pathname: string, href: string) {
  const path = href.replace('/(admin)', '');
  return pathname === href || pathname.startsWith(path);
}

function AdminSidebar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sidebar, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.logo}>Shoe Laundry</Text>
      <Text style={styles.logoSub}>Admin panel</Text>
      {SIDEBAR_NAV.map((item) => {
        const active = isActive(pathname, item.href);
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
  );
}

export default function AdminLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= 1024;
  // BottomTabBar uses explicit `height` from tabBarStyle (minHeight is ignored → default 49px clips labels).
  const tabBarHeight = 64 + insets.bottom;

  return (
    <RequireAuth role="admin">
      <View style={[styles.shell, isWide && styles.shellWide]}>
        {isWide ? <AdminSidebar /> : null}
        <View style={styles.content}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.textMuted,
              tabBarLabelPosition: 'below-icon',
              tabBarAllowFontScaling: false,
              tabBarStyle: isWide
                ? styles.tabBarHidden
                : [styles.tabBar, { height: tabBarHeight }],
              tabBarLabelStyle: styles.tabLabel,
            }}
          >
            <Tabs.Screen
              name="dashboard"
              options={{
                title: 'Dashboard',
                tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="orders/index"
              options={{
                title: 'Orders',
                tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="services"
              options={{
                title: 'Services',
                tabBarIcon: ({ color, size }) => <Ionicons name="pricetags-outline" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="customers"
              options={{
                title: 'Customers',
                tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
              }}
            />
            <Tabs.Screen name="orders/[id]" options={{ href: null }} />
          </Tabs>
        </View>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.muted, minHeight: 0 },
  shellWide: { flexDirection: 'row' },
  content: { flex: 1, minHeight: 0 },
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
  tabBar: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.white,
    paddingTop: spacing.xs,
  },
  tabBarHidden: { display: 'none' },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 1,
  },
});
