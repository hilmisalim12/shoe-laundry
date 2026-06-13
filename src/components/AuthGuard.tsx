import { Redirect } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { restoreSession } from '@/src/lib/auth';
import { useUserStore } from '@/src/stores/userStore';
import { colors } from '@/src/theme/tokens';

type RequireAuthProps = {
  children: ReactNode;
  role: 'admin' | 'customer';
};

export function RequireAuth({ children, role }: RequireAuthProps) {
  const profile = useUserStore((s) => s.profile);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setReady(true));
  }, []);

  if (!isHydrated || !ready) {
    return <AuthLoading />;
  }

  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'admin' && profile.role !== 'admin') {
    return <Redirect href="/(customer)/home" />;
  }

  if (role === 'customer' && profile.role !== 'customer') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <>{children}</>;
}

type GuestOnlyProps = {
  children: ReactNode;
  allowWhenAuthenticated?: boolean;
};

/** Keeps login/register behind a sign-in wall; redirects signed-in users to their home. */
export function GuestOnly({ children, allowWhenAuthenticated }: GuestOnlyProps) {
  const profile = useUserStore((s) => s.profile);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setReady(true));
  }, []);

  if (!isHydrated || !ready) {
    return <AuthLoading />;
  }

  if (profile && !allowWhenAuthenticated) {
    if (profile.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
    return <Redirect href="/(customer)/home" />;
  }

  return <>{children}</>;
}

function AuthLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
