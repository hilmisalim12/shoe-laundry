import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props = {
  message: string;
  tone?: 'error' | 'success' | 'info';
};

export function InlineMessage({ message, tone = 'error' }: Props) {
  const theme = useAppTheme();

  const palette = {
    error: { bg: theme.colors.dangerBg, text: theme.colors.destructive, border: '#fecaca' },
    success: { bg: theme.colors.successBg, text: theme.colors.successForeground, border: '#bbf7d0' },
    info: {
      bg: theme.colors.infoBg,
      text: theme.colors.infoForeground,
      border: theme.isCustomer ? theme.colors.primaryLight : '#99f6e4',
    },
  }[tone];

  return (
    <View
      style={[styles.box, { backgroundColor: palette.bg, borderColor: palette.border, borderRadius: theme.radius.md }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={[theme.typography.bodySm, styles.text, { color: palette.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  text: { fontWeight: '500' },
});
