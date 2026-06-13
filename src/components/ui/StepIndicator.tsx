import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/src/theme/tokens';

type Step = { number: number; label: string };

type Props = {
  steps: Step[];
  current: number;
  onStepPress?: (step: number) => void;
  maxReachable?: number;
};

export function StepIndicator({ steps, current, onStepPress, maxReachable = current }: Props) {
  return (
    <View style={styles.wrap}>
      {steps.map((step, index) => {
        const done = step.number < current;
        const active = step.number === current;
        const reachable = step.number <= maxReachable;
        return (
          <View key={step.number} style={styles.item}>
            <Pressable
              disabled={!onStepPress || !reachable}
              onPress={() => onStepPress?.(step.number)}
              style={[styles.circle, active && styles.circleActive, done && styles.circleDone]}
            >
              <Text style={[styles.circleText, active && styles.circleTextOnPrimary, done && !active && styles.circleTextDone]}>
                {done ? '✓' : step.number}
              </Text>
            </Pressable>
            <Text style={[styles.label, active && styles.labelActive]}>{step.label}</Text>
            {index < steps.length - 1 ? <View style={[styles.connector, done && styles.connectorDone]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xxl },
  item: { flex: 1, alignItems: 'center', position: 'relative' },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  circleActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  circleDone: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  circleText: { ...typography.label, color: colors.textMuted },
  circleTextOnPrimary: { color: colors.white },
  circleTextDone: { color: colors.primaryDark },
  label: { ...typography.caption, marginTop: spacing.sm, textAlign: 'center', color: colors.textMuted },
  labelActive: { color: colors.primary, fontWeight: '600' },
  connector: {
    position: 'absolute',
    top: 20,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  connectorDone: { backgroundColor: colors.primaryLight },
});
