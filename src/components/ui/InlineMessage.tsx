import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = {
  message: string;
  tone?: 'error' | 'success' | 'info';
};

export function InlineMessage({ message, tone = 'error' }: Props) {
  const palette = {
    error: { bg: colors.dangerBg, text: colors.destructive, border: '#FECACA' },
    success: { bg: colors.successBg, text: colors.successForeground, border: '#BBF7D0' },
    info: { bg: colors.infoBg, text: colors.infoForeground, border: '#99F6E4' },
  }[tone];

  return (
    <View
      style={[styles.box, { backgroundColor: palette.bg, borderColor: palette.border }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.text, { color: palette.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  text: { ...typography.bodySm, fontWeight: '500' },
});
