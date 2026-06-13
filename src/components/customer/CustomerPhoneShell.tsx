import { StyleSheet, View } from 'react-native';

import { CUSTOMER_MAX_WIDTH, CUSTOMER_SHELL_BACKGROUND, customerColors } from '@/src/theme/customerTheme';

/** Centers customer/auth UI in a phone-width column on desktop */
export function CustomerPhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.outer}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    backgroundColor: CUSTOMER_SHELL_BACKGROUND,
    alignItems: 'center',
  },
  phone: {
    flex: 1,
    width: '100%',
    maxWidth: CUSTOMER_MAX_WIDTH,
    backgroundColor: customerColors.background,
  },
});
