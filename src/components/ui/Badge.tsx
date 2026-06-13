import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/AppThemeContext';

export function Badge({ label, tone = 'default' }: { label: string; tone?: 'default' | 'success' | 'warning' | 'danger' | 'primary' }) {
  const theme = useAppTheme();

  const toneMap = {
    default: { bg: theme.colors.secondary, text: theme.colors.secondaryForeground },
    success: { bg: theme.colors.successBg, text: theme.colors.successForeground },
    warning: { bg: theme.colors.warningBg, text: theme.colors.warningForeground },
    danger: { bg: theme.colors.dangerBg, text: theme.colors.destructive },
    primary: { bg: theme.colors.infoBg, text: theme.colors.infoForeground },
  };

  const palette = toneMap[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderRadius: theme.radius.full }]}>
      <Text style={[theme.typography.caption, styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: { fontWeight: '600' },
});
