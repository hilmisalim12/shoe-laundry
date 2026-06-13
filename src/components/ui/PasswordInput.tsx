import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/src/theme/AppThemeContext';

type Props = Omit<TextInputProps, 'secureTextEntry'> & { error?: boolean };

export function PasswordInput({ error, style, ...props }: Props) {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View
      style={[
        styles.wrap,
        {
          minHeight: theme.isCustomer ? 48 : 44,
          borderRadius: theme.radius.md,
          borderColor: error ? theme.colors.destructive : theme.colors.input,
          backgroundColor: theme.colors.background,
          paddingLeft: theme.spacing.md,
        },
      ]}
    >
      <TextInput
        {...props}
        secureTextEntry={!visible}
        placeholderTextColor={theme.colors.mutedForeground}
        style={[theme.typography.body, styles.input, { color: theme.colors.foreground }, style]}
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
          color={theme.colors.mutedForeground}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 8,
  },
  toggle: { paddingHorizontal: 12, paddingVertical: 8 },
});
