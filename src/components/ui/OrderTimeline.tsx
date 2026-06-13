import { StyleSheet, Text, View } from 'react-native';
import { formatDateTime, formatStatusLabel } from '@/src/lib/format';
import type { OrderStatusEvent } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

export function OrderTimeline({ events }: { events: OrderStatusEvent[] }) {
  if (!events.length) return <Text style={typography.bodySm}>No updates yet.</Text>;
  return (
    <View style={styles.wrap}>
      {events.map((event, index) => (
        <View key={event.id} style={styles.row}>
          <View style={styles.lineCol}>
            <View style={[styles.dot, index === events.length - 1 && styles.dotActive]} />
            {index < events.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{formatStatusLabel(event.status)}</Text>
            {event.note ? <Text style={styles.note}>{event.note}</Text> : null}
            <Text style={styles.time}>{formatDateTime(event.created_at)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  lineCol: { alignItems: 'center', width: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginTop: 4 },
  dotActive: { backgroundColor: colors.primary },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  content: { flex: 1, paddingBottom: spacing.lg },
  title: { ...typography.label },
  note: { ...typography.bodySm, marginTop: 2 },
  time: { ...typography.caption, marginTop: 4 },
});
