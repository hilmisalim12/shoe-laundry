import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors, spacing, typography } from '@/src/theme/tokens';

type Props = ViewProps & {
  label: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
};

export function FormField({ label, hint, required, children, style, ...props }: Props) {
  return (
    <View style={[styles.field, style]} {...props}>
      <Text style={styles.label} accessibilityRole="text">
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm },
  label: { ...typography.label, fontSize: 13 },
  required: { color: colors.destructive },
  hint: { ...typography.caption },
});
