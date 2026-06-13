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

import { colors, spacing } from '@/src/theme/tokens';

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
  const insets = useSafeAreaInsets();
  const padTop = insets.top + spacing.lg;
  const padBottom = insets.bottom + bottomPad;

  const inner = (
    <View
      style={[
        styles.inner,
        { maxWidth, paddingTop: padTop, paddingBottom: padBottom },
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
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {inner}
    </ScrollView>
  ) : (
    inner
  );

  const body = (
    <View style={styles.root}>
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
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center', minHeight: 0 },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  inner: { width: '100%', paddingHorizontal: spacing.xl, minHeight: 0 },
});
