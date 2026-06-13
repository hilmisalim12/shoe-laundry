import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/src/theme/AppThemeContext';

type Step = { number: number; label: string };

type Props = {
  steps: Step[];
  current: number;
  onStepPress?: (step: number) => void;
  maxReachable?: number;
};

export function StepIndicator({ steps, current, onStepPress, maxReachable = current }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => {
        const done = step.number < current;
        const active = step.number === current;
        const reachable = step.number <= maxReachable;
        const doneColor = theme.colors.primary;
        return (
          <View key={step.number} style={styles.item}>
            <Pressable
              disabled={!onStepPress || !reachable}
              onPress={() => onStepPress?.(step.number)}
              style={[
                styles.circle,
                {
                  borderColor: active || done ? theme.colors.primary : theme.colors.border,
                  backgroundColor: active
                    ? theme.colors.primary
                    : done
                      ? theme.isCustomer
                        ? theme.colors.successBg
                        : theme.colors.primaryLight
                      : theme.colors.white,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.label,
                  {
                    color: active
                      ? theme.colors.primaryForeground
                      : done
                        ? doneColor
                        : theme.colors.textMuted,
                  },
                ]}
              >
                {done ? '✓' : step.number}
              </Text>
            </Pressable>
            <Text
              style={[
                theme.typography.caption,
                styles.label,
                active && { color: theme.colors.primary, fontWeight: '600' },
              ]}
            >
              {step.label}
            </Text>
            {index < steps.length - 1 ? (
              <View
                style={[
                  styles.connector,
                    {
                      backgroundColor: done
                        ? theme.isCustomer
                          ? theme.colors.primary
                          : theme.colors.primaryLight
                        : theme.colors.border,
                    },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32 },
  item: { flex: 1, alignItems: 'center', position: 'relative' },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: { marginTop: 8, textAlign: 'center' },
  connector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: 0,
  },
});
