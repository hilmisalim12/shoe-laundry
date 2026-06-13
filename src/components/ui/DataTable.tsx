import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/src/components/ui/Input';
import { colors, radius, shadows, spacing, typography } from '@/src/theme/tokens';

export type DataTableColumn<T> = {
  key: string;
  label: string;
  flex?: number;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowPress?: (row: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onClearSearch?: () => void;
};

function cellStyle(col: DataTableColumn<unknown>) {
  return {
    flex: col.flex ?? 1,
    minWidth: col.minWidth ?? 120,
    alignItems:
      col.align === 'right' ? ('flex-end' as const) : col.align === 'center' ? ('center' as const) : ('flex-start' as const),
  };
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = 'No results',
  emptyDescription,
  onRowPress,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  onClearSearch,
}: Props<T>) {
  const tableMinWidth = columns.reduce((sum, col) => sum + (col.minWidth ?? 120), 0);
  const showSearch = onSearchChange !== undefined;

  return (
    <View style={styles.wrap}>
      {showSearch ? (
        <View style={styles.toolbar}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color={colors.mutedForeground} style={styles.searchIcon} />
            <Input
              value={searchValue ?? ''}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
              style={styles.searchInput}
              accessibilityLabel={searchPlaceholder}
            />
          </View>
          {searchValue?.trim() && onClearSearch ? (
            <Pressable onPress={onClearSearch} style={styles.clearBtn} accessibilityRole="button">
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : null}
          <Text style={styles.resultCount}>
            {data.length} {data.length === 1 ? 'result' : 'results'}
          </Text>
        </View>
      ) : null}

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.table, { minWidth: Math.max(tableMinWidth, 640) }]}>
            <View style={styles.headerRow}>
              {columns.map((col) => (
                <View key={col.key} style={[styles.headerCell, cellStyle(col)]}>
                  <Text style={styles.headerLabel}>{col.label}</Text>
                </View>
              ))}
              {onRowPress ? <View style={styles.actionHeaderCell} /> : null}
            </View>

            {!data.length ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={32} color={colors.mutedForeground} />
                <Text style={styles.emptyTitle}>{emptyTitle}</Text>
                {emptyDescription ? <Text style={styles.emptyDescription}>{emptyDescription}</Text> : null}
              </View>
            ) : (
              data.map((row, index) => {
                const rowContent = (
                  <View style={[styles.dataRow, index % 2 === 1 && styles.dataRowAlt]}>
                    {columns.map((col) => (
                      <View key={col.key} style={[styles.dataCell, cellStyle(col)]}>
                        {col.render(row)}
                      </View>
                    ))}
                    {onRowPress ? (
                      <View style={styles.actionCell}>
                        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                      </View>
                    ) : null}
                  </View>
                );

                if (!onRowPress) {
                  return <View key={keyExtractor(row)}>{rowContent}</View>;
                }

                return (
                  <Pressable
                    key={keyExtractor(row)}
                    onPress={() => onRowPress(row)}
                    style={({ pressed, hovered }) => [
                      styles.rowPressable,
                      (pressed || hovered) && styles.rowHovered,
                    ]}
                    accessibilityRole="button"
                  >
                    {rowContent}
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  searchWrap: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 280,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  searchInput: {
    paddingLeft: spacing.xl + spacing.sm,
    minHeight: 40,
  },
  clearBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  clearText: { ...typography.bodySm, fontWeight: '600', color: colors.foreground },
  resultCount: { ...typography.caption, flexShrink: 0 },
  tableCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    ...shadows.sm,
  },
  table: { width: '100%' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  headerCell: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.mutedForeground,
  },
  actionHeaderCell: { width: 36 },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dataRowAlt: { backgroundColor: colors.borderLight },
  rowPressable: { cursor: 'pointer' as unknown as undefined },
  rowHovered: { backgroundColor: colors.primaryLight },
  dataCell: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  actionCell: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.label, color: colors.foreground },
  emptyDescription: { ...typography.bodySm, textAlign: 'center', maxWidth: 320 },
});
