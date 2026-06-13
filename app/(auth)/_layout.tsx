import { Slot, usePathname } from 'expo-router';

import { GuestOnly } from '@/src/components/AuthGuard';
import { CustomerPhoneShell } from '@/src/components/customer/CustomerPhoneShell';
import { CustomerThemeProvider } from '@/src/theme/AppThemeContext';

export default function AuthLayout() {
  const pathname = usePathname();
  const isPasswordFlow =
    pathname.includes('forgot-password') || pathname.includes('reset-password');

  return (
    <GuestOnly allowWhenAuthenticated={isPasswordFlow}>
      <CustomerThemeProvider>
        <CustomerPhoneShell>
          <Slot />
        </CustomerPhoneShell>
      </CustomerThemeProvider>
    </GuestOnly>
  );
}
