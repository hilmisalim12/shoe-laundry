import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Input } from '@/src/components/ui/Input';
import { colors, radius, shadows, spacing, typography } from '@/src/theme/tokens';

export type DataTableColumn<T> = {
  key: string;
  label: string;
  /** Flex grow ratio (default 1). Ignored when `width` is set. */
  flex?: number;
  /** Fixed column width in px — use for narrow columns like actions/counts. */
  width?: number;
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
  const alignItems =
    col.align === 'right' ? ('flex-end' as const) : col.align === 'center' ? ('center' as const) : ('flex-start' as const);

  if (col.width != null) {
    return {
      width: col.width,
      flexShrink: 0,
      flexGrow: 0,
      alignItems,
    };
  }

  return {
    flex: col.flex ?? 1,
    minWidth: 0,
    alignItems,
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
  const { width: windowWidth } = useWindowDimensions();
  const showSearch = onSearchChange !== undefined;
  const actionWidth = onRowPress ? 44 : 0;
  const useHorizontalScroll = windowWidth < 720;

  const tableBody = (
    <View style={[styles.table, useHorizontalScroll && styles.tableScrollMin]}>
      <View style={styles.headerRow}>
        {columns.map((col) => (
          <View key={col.key} style={[styles.headerCell, cellStyle(col)]}>
            <Text style={[styles.headerLabel, col.align === 'right' && styles.headerLabelRight]}>
              {col.label}
            </Text>
          </View>
        ))}
        {onRowPress ? <View style={[styles.actionCell, { width: actionWidth }]} /> : null}
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
                <View style={[styles.actionCell, { width: actionWidth }]}>
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
  );

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
        {useHorizontalScroll ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tableBody}
          </ScrollView>
        ) : (
          tableBody
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, width: '100%' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  searchWrap: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 0,
  },
  clearText: { ...typography.bodySm, fontWeight: '600', color: colors.foreground },
  resultCount: { ...typography.caption, flexShrink: 0, marginLeft: 'auto' },
  tableCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
    ...shadows.sm,
  },
  table: {
    width: '100%',
  },
  tableScrollMin: {
    minWidth: 640,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.muted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  headerCell: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.mutedForeground,
  },
  headerLabelRight: {
    textAlign: 'right',
    width: '100%',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dataRowAlt: { backgroundColor: colors.borderLight },
  rowPressable: { width: '100%', cursor: 'pointer' as unknown as undefined },
  rowHovered: { backgroundColor: colors.primaryLight },
  dataCell: {
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  actionCell: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyState: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.label, color: colors.foreground },
  emptyDescription: { ...typography.bodySm, textAlign: 'center', maxWidth: 320 },
});
