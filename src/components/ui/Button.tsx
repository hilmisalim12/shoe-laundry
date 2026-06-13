import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, typography } from '@/src/theme/tokens';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  flex?: boolean;
  size?: 'default' | 'sm' | 'lg';
};

export function Button({
  title,
  onPress,
  variant = 'default',
  disabled,
  loading,
  fullWidth,
  flex,
  size = 'default',
}: Props) {
  const height = size === 'sm' ? 36 : size === 'lg' ? 52 : 44;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { height },
        fullWidth && styles.fullWidth,
        flex && styles.flex,
        variant === 'default' && styles.default,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        variant === 'destructive' && styles.destructive,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'default' || variant === 'destructive' ? colors.primaryForeground : colors.foreground}
        />
      ) : (
        <Text
          style={[
            styles.label,
            size === 'sm' && styles.labelSm,
            variant === 'default' && styles.defaultLabel,
            variant === 'destructive' && styles.destructiveLabel,
            (variant === 'secondary' || variant === 'outline' || variant === 'ghost') && styles.mutedLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minWidth: 80,
  },
  fullWidth: { width: '100%' },
  flex: { flex: 1 },
  default: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: 'transparent' },
  destructive: { backgroundColor: colors.destructive },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.92 },
  label: { ...typography.label, fontSize: 14 },
  labelSm: { fontSize: 13 },
  defaultLabel: { color: colors.primaryForeground },
  destructiveLabel: { color: colors.destructiveForeground },
  mutedLabel: { color: colors.secondaryForeground },
});
