import { StyleSheet, Text, View } from 'react-native';

import { formatDateTime, formatStatusLabel } from '@/src/lib/format';
import { useAppTheme } from '@/src/theme/AppThemeContext';
import type { OrderStatusEvent } from '@/src/types';

export function OrderTimeline({ events }: { events: OrderStatusEvent[] }) {
  const theme = useAppTheme();

  if (!events.length) return <Text style={theme.typography.bodySm}>No updates yet.</Text>;

  return (
    <View style={styles.wrap}>
      {events.map((event, index) => {
        const isLatest = index === events.length - 1;
        const isDone = !isLatest;
        return (
          <View key={event.id} style={styles.row}>
            <View style={styles.lineCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isLatest
                      ? theme.colors.primary
                      : theme.isCustomer
                        ? theme.colors.primaryLight
                        : theme.colors.border,
                  },
                ]}
              />
              {index < events.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor: isDone && theme.isCustomer ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.content}>
              <Text style={theme.typography.label}>{formatStatusLabel(event.status)}</Text>
              {event.note ? <Text style={[theme.typography.bodySm, styles.note]}>{event.note}</Text> : null}
              <Text style={[theme.typography.caption, styles.time]}>{formatDateTime(event.created_at)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  lineCol: { alignItems: 'center', width: 16 },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  line: { flex: 1, width: 2, marginTop: 4 },
  content: { flex: 1, paddingBottom: 16 },
  note: { marginTop: 2 },
  time: { marginTop: 4 },
});
