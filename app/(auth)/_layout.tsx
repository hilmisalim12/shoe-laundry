import { Slot, usePathname } from 'expo-router';

import { GuestOnly } from '@/src/components/AuthGuard';

export default function AuthLayout() {
  const pathname = usePathname();
  const isPasswordFlow =
    pathname.includes('forgot-password') || pathname.includes('reset-password');

  return (
    <GuestOnly allowWhenAuthenticated={isPasswordFlow}>
      <Slot />
    </GuestOnly>
  );
}
