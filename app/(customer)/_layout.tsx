import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RequireAuth } from '@/src/components/AuthGuard';
import { CustomerPhoneShell } from '@/src/components/customer/CustomerPhoneShell';
import { CustomerThemeProvider } from '@/src/theme/AppThemeContext';
import { customerColors } from '@/src/theme/customerTheme';

export default function CustomerLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;

  return (
    <RequireAuth role="customer">
      <CustomerThemeProvider>
        <CustomerPhoneShell>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: customerColors.primary,
              tabBarInactiveTintColor: customerColors.textMuted,
              tabBarLabelPosition: 'below-icon',
              tabBarAllowFontScaling: false,
              tabBarStyle: {
                borderTopColor: customerColors.borderLight,
                borderTopWidth: 1,
                backgroundColor: customerColors.white,
                paddingTop: 4,
                height: tabBarHeight,
              },
              tabBarLabelStyle: styles.tabLabel,
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: 'Home',
                tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
              }}
            />
            <Tabs.Screen
              name="book"
              options={{
                title: 'Book',
                tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
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
              name="profile"
              options={{
                title: 'Profile',
                tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
              }}
            />
            <Tabs.Screen name="orders/[id]" options={{ href: null }} />
          </Tabs>
        </CustomerPhoneShell>
      </CustomerThemeProvider>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 1,
    fontFamily: Platform.OS === 'web' ? 'Inter' : undefined,
  },
});
