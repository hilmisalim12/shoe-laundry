import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '@/src/theme/tokens';

export type DataTableColumn<T> = {
  key: string;
  label: string;
  flex?: number;
  minWidth?: number;
  render: (row: T) => React.ReactNode;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterPlaceholder?: string;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyTitle?: string;
  onRowPress?: (row: T) => void;
};

export function DataTable<T>({ columns, data, keyExtractor, emptyTitle = 'No results', onRowPress }: Props<T>) {
  return (
    <View style={styles.tableWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {columns.map((col) => (
              <View
                key={col.key}
                style={[styles.cell, { flex: col.flex ?? 1, minWidth: col.minWidth ?? 140 }]}
              >
                <Text style={styles.headerLabel}>{col.label}</Text>
                <View style={styles.filterBox}>
                  <Text style={styles.filterIcon}>⌕</Text>
                  <TextInput
                    value={col.filterValue}
                    onChangeText={col.onFilterChange}
                    placeholder={col.filterPlaceholder ?? `Filter ${col.label.toLowerCase()}...`}
                    placeholderTextColor={colors.textMuted}
                    style={styles.filterInput}
                  />
                </View>
              </View>
            ))}
          </View>

          {!data.length ? (
            <View style={styles.emptyRow}>
              <Text style={typography.bodySm}>{emptyTitle}</Text>
            </View>
          ) : (
            data.map((row) => {
              const cells = (
                <View style={styles.dataRow}>
                  {columns.map((col) => (
                    <View
                      key={col.key}
                      style={[styles.cell, styles.dataCell, { flex: col.flex ?? 1, minWidth: col.minWidth ?? 140 }]}
                    >
                      {col.render(row)}
                    </View>
                  ))}
                </View>
              );

              if (!onRowPress) return <View key={keyExtractor(row)}>{cells}</View>;

              return (
                <Pressable
                  key={keyExtractor(row)}
                  onPress={() => onRowPress(row)}
                  style={({ pressed }) => [pressed && styles.rowPressed]}
                >
                  {cells}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
      <Text style={styles.count}>{data.length} row(s)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tableWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  table: { minWidth: 720 },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowPressed: { backgroundColor: colors.primaryLight },
  cell: { padding: spacing.md },
  dataCell: { justifyContent: 'center' },
  headerLabel: { ...typography.label, marginBottom: spacing.sm },
  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    minHeight: 36,
  },
  filterIcon: { color: colors.textMuted, marginRight: 4, fontSize: 14 },
  filterInput: {
    flex: 1,
    ...typography.bodySm,
    color: colors.text,
    paddingVertical: 6,
    minWidth: 80,
  },
  emptyRow: { padding: spacing.xxxl, alignItems: 'center' },
  count: { ...typography.caption, padding: spacing.md, color: colors.textSecondary },
});
