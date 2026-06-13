import { TextInput, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props = TextInputProps & { error?: boolean };

export function Input({ error, style, ...props }: Props) {
  const theme = useAppTheme();

  return (
    <TextInput
      placeholderTextColor={theme.colors.mutedForeground}
      style={[
        {
          minHeight: theme.isCustomer ? 48 : 44,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: error ? theme.colors.destructive : theme.colors.input,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm + 2,
          ...theme.typography.body,
          color: theme.colors.foreground,
        },
        props.multiline && { minHeight: 88, textAlignVertical: 'top', paddingTop: theme.spacing.md },
        style,
      ]}
      accessibilityState={{ disabled: props.editable === false }}
      {...props}
    />
  );
}
