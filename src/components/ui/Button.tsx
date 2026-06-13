import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'surface';
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
  const theme = useAppTheme();
  const height = size === 'sm' ? 36 : theme.isCustomer ? 48 : size === 'lg' ? 52 : 44;
  const pill = theme.isCustomer;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: pill ? theme.radius.full : theme.radius.md,
          paddingHorizontal: theme.isCustomer ? 20 : 16,
        },
        fullWidth && styles.fullWidth,
        flex && styles.flex,
        variant === 'default' && { backgroundColor: theme.colors.primary },
        variant === 'secondary' && { backgroundColor: theme.colors.secondary },
        variant === 'outline' && {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.isCustomer ? theme.colors.primary : theme.colors.border,
        },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        variant === 'surface' && { backgroundColor: theme.colors.card },
        variant === 'destructive' && { backgroundColor: theme.colors.destructive },
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'default' || variant === 'destructive' ? theme.colors.primaryForeground : theme.colors.foreground}
        />
      ) : (
        <Text
          style={[
            theme.typography.label,
            size === 'sm' && { fontSize: 13 },
            variant === 'default' && { color: theme.colors.primaryForeground },
            variant === 'destructive' && { color: theme.colors.destructiveForeground },
            variant === 'surface' && { color: theme.colors.primary },
            (variant === 'secondary' || variant === 'outline' || variant === 'ghost') && {
              color: variant === 'outline' && theme.isCustomer ? theme.colors.primary : theme.colors.secondaryForeground,
            },
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
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  fullWidth: { width: '100%' },
  flex: { flex: 1 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.92 },
});
