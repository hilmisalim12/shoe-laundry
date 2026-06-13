import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, typography } from '@/src/theme/tokens';

const toneMap = {
  default: { bg: colors.secondary, text: colors.secondaryForeground },
  success: { bg: colors.successBg, text: colors.successForeground },
  warning: { bg: colors.warningBg, text: colors.warningForeground },
  danger: { bg: colors.dangerBg, text: colors.destructive },
  primary: { bg: colors.primaryLight, text: colors.infoForeground },
};

export function Badge({ label, tone = 'default' }: { label: string; tone?: keyof typeof toneMap }) {
  const palette = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: { ...typography.caption, fontWeight: '600' },
});
