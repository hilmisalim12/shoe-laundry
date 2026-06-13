import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  MONTHS,
  WEEKDAYS,
  formatFriendlySchedule,
  formatTimeLabel,
  getCalendarDays,
  isBeforeDay,
  isSameDay,
  parseScheduledValue,
  startOfDay,
  toScheduledIso,
} from '@/src/lib/datetime';
import { Button } from '@/src/components/ui/Button';
import { colors, radius, shadows, spacing, typography } from '@/src/theme/tokens';

const TIME_OPTIONS = [
  { h: 9, m: 0 }, { h: 10, m: 0 }, { h: 11, m: 0 }, { h: 12, m: 0 },
  { h: 13, m: 0 }, { h: 14, m: 0 }, { h: 15, m: 0 }, { h: 16, m: 0 },
  { h: 17, m: 0 }, { h: 18, m: 0 },
];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function DateTimePickerField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = parseScheduledValue(value);
  const today = startOfDay(new Date());

  const [viewMonth, setViewMonth] = useState(parsed?.date.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(parsed?.date.getFullYear() ?? today.getFullYear());
  const [draftDate, setDraftDate] = useState<Date>(parsed?.date ?? today);
  const [draftHour, setDraftHour] = useState(parsed?.hours ?? 10);
  const [draftMinute, setDraftMinute] = useState(parsed?.minutes ?? 0);

  useEffect(() => {
    if (!open) return;
    const p = parseScheduledValue(value);
    if (p) {
      setViewMonth(p.date.getMonth());
      setViewYear(p.date.getFullYear());
      setDraftDate(p.date);
      setDraftHour(p.hours);
      setDraftMinute(p.minutes);
    }
  }, [open, value]);

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  function shiftMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  function handleConfirm() {
    if (isBeforeDay(draftDate, today)) return;
    onChange(toScheduledIso(draftDate, draftHour, draftMinute));
    setOpen(false);
  }

  const preview = formatFriendlySchedule(toScheduledIso(draftDate, draftHour, draftMinute));

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.trigger}>
        <View style={styles.triggerIcon}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.triggerText}>
          <Text style={styles.triggerLabel}>Custom date & time</Text>
          <Text style={styles.triggerValue}>{formatFriendlySchedule(value)}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.popover}>
            <Text style={styles.popoverTitle}>Pick date & time</Text>
            <Text style={styles.popoverSubtitle}>Available Mon–Sat, 9:00 AM – 6:00 PM</Text>

            {/* Calendar */}
            <View style={styles.calendarHeader}>
              <Pressable onPress={() => shiftMonth(-1)} style={styles.navBtn} hitSlop={8}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
              <Pressable onPress={() => shiftMonth(1)} style={styles.navBtn} hitSlop={8}>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={styles.weekday}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, i) => {
                if (!day) return <View key={`empty-${i}`} style={styles.dayCell} />;
                const disabled = isBeforeDay(day, today);
                const selected = isSameDay(day, draftDate);
                const isToday = isSameDay(day, today);
                return (
                  <Pressable
                    key={day.toISOString()}
                    disabled={disabled}
                    onPress={() => setDraftDate(day)}
                    style={[
                      styles.dayCell,
                      styles.dayBtn,
                      selected && styles.daySelected,
                      isToday && !selected && styles.dayToday,
                      disabled && styles.dayDisabled,
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      selected && styles.dayTextSelected,
                      disabled && styles.dayTextDisabled,
                    ]}>
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time */}
            <Text style={styles.timeTitle}>Select time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
              {TIME_OPTIONS.map(({ h, m }) => {
                const active = draftHour === h && draftMinute === m;
                return (
                  <Pressable
                    key={`${h}-${m}`}
                    onPress={() => { setDraftHour(h); setDraftMinute(m); }}
                    style={[styles.timeChip, active && styles.timeChipActive]}
                  >
                    <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>
                      {formatTimeLabel(h, m)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.previewBox}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={styles.previewText}>{preview}</Text>
            </View>

            <View style={styles.actions}>
              <Button title="Cancel" variant="secondary" onPress={() => setOpen(false)} flex />
              <Button title="Apply" onPress={handleConfirm} flex />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    ...shadows.card,
  },
  triggerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: { flex: 1 },
  triggerLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 2 },
  triggerValue: { ...typography.label, color: colors.text },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  popover: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadows.card,
    zIndex: 1,
  },
  popoverTitle: { ...typography.h3, marginBottom: spacing.xs },
  popoverSubtitle: { ...typography.caption, marginBottom: spacing.lg, color: colors.textSecondary },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderLight,
  },
  monthLabel: { ...typography.label },
  weekdayRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
  dayBtn: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  daySelected: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1, borderColor: colors.primary },
  dayDisabled: { opacity: 0.35 },
  dayText: { ...typography.bodySm, fontWeight: '500' },
  dayTextSelected: { color: colors.white, fontWeight: '700' },
  dayTextDisabled: { color: colors.textMuted },
  timeTitle: { ...typography.label, marginBottom: spacing.sm },
  timeRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  timeChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  timeChipText: { ...typography.bodySm },
  timeChipTextActive: { color: colors.primaryDark, fontWeight: '600' },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  previewText: { ...typography.bodySm, flex: 1, color: colors.primaryDark, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: spacing.md },
});
