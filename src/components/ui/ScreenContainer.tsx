import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props = ViewProps & {
  scroll?: boolean;
  maxWidth?: number;
  bottomPad?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAvoid?: boolean;
};

export function ScreenContainer({
  children,
  scroll,
  maxWidth = 960,
  bottomPad = 88,
  refreshing,
  onRefresh,
  keyboardAvoid,
  style,
  ...props
}: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const horizontalPad = theme.isCustomer ? 20 : theme.spacing.xl;
  const padTop = insets.top + (theme.isCustomer ? theme.spacing.md : theme.spacing.lg);
  const padBottom = insets.bottom + bottomPad;

  const inner = (
    <View
      style={[
        styles.inner,
        {
          maxWidth: theme.isCustomer ? undefined : maxWidth,
          paddingTop: padTop,
          paddingBottom: padBottom,
          paddingHorizontal: horizontalPad,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  const scrollContent = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        theme.isCustomer && styles.scrollContentCustomer,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        ) : undefined
      }
    >
      {inner}
    </ScrollView>
  ) : (
    inner
  );

  const body = (
    <View
      style={[
        styles.root,
        theme.isCustomer && styles.rootCustomer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {scroll ? scrollContent : inner}
    </View>
  );

  if (keyboardAvoid) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, alignItems: 'center', minHeight: 0, width: '100%', minWidth: 0 },
  rootCustomer: { alignItems: 'stretch' },
  scroll: { flex: 1, width: '100%', minWidth: 0 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  scrollContentCustomer: { alignItems: 'stretch', width: '100%' },
  inner: { width: '100%', minWidth: 0, alignSelf: 'stretch' },
});
