import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = Omit<TextInputProps, 'secureTextEntry'> & { error?: boolean };

export function PasswordInput({ error, style, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.wrap, error && styles.wrapError]}>
      <TextInput
        {...props}
        secureTextEntry={!visible}
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, style]}
        accessibilityLabel={props.placeholder ?? 'Password'}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        hitSlop={8}
      >
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={18}
          color={colors.mutedForeground}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
    paddingLeft: spacing.md,
  },
  wrapError: { borderColor: colors.destructive },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.foreground,
    paddingVertical: spacing.sm + 2,
    paddingRight: spacing.sm,
  },
  toggle: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
});
