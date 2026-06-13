import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/src/theme/AppThemeContext';

export function Card({ style, children, ...props }: ViewProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.isCustomer ? theme.radius.xl : theme.radius.lg,
          padding: theme.spacing.lg,
          borderWidth: theme.isCustomer ? 0 : 1,
          borderColor: theme.colors.border,
          ...theme.shadows.card,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
