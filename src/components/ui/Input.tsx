import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = TextInputProps & { error?: boolean };

export function Input({ error, style, ...props }: Props) {
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      style={[styles.input, error && styles.inputError, props.multiline && styles.multiline, style]}
      accessibilityState={{ disabled: props.editable === false }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    color: colors.foreground,
  },
  inputError: { borderColor: colors.destructive },
  multiline: { minHeight: 88, textAlignVertical: 'top', paddingTop: spacing.md },
});
