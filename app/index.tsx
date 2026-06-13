import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { restoreSession } from '@/src/lib/auth';
import { useUserStore } from '@/src/stores/userStore';
import { colors } from '@/src/theme/tokens';

export default function Index() {
  const profile = useUserStore((s) => s.profile);
  const isHydrated = useUserStore((s) => s.isHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    restoreSession().finally(() => setReady(true));
  }, []);

  if (!isHydrated || !ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) return <Redirect href="/(auth)/login" />;
  if (profile.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(customer)/home" />;
}
