import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getCustomers } from '@/src/lib/api';
import { AdminPageHeader } from '@/src/components/ui/AdminPageHeader';
import { AdminScrollPage } from '@/src/components/ui/AdminScrollPage';
import { Badge } from '@/src/components/ui/Badge';
import { DataTable } from '@/src/components/ui/DataTable';
import type { Profile } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

type CustomerRow = Profile & { orderCount: number };

export default function AdminCustomersScreen() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => setCustomers(await getCustomers()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q) ||
        String(c.orderCount).includes(q)
      );
    });
  }, [customers, search]);

  return (
    <AdminScrollPage
      maxWidth={1200}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <AdminPageHeader
        title="Customers"
        subtitle={`${customers.length} registered customer${customers.length === 1 ? '' : 's'}`}
      />

      <DataTable<CustomerRow>
        data={filtered}
        keyExtractor={(row) => row.id}
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
        searchPlaceholder="Search by name, email, phone, or order count…"
        emptyTitle="No customers found"
        emptyDescription={
          search.trim()
            ? 'Try a different search term or clear the filter.'
            : 'Customers will appear here after they register.'
        }
        onRowPress={(row) =>
          router.push({ pathname: '/(admin)/orders', params: { customerId: row.id } })
        }
        columns={[
          {
            key: 'name',
            label: 'Customer',
            flex: 1.4,
            minWidth: 180,
            render: (row) => (
              <View style={styles.nameCell}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{row.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.nameText}>
                  <Text style={styles.name}>{row.name}</Text>
                  {row.phone ? <Text style={styles.phoneHint}>{row.phone}</Text> : null}
                </View>
              </View>
            ),
          },
          {
            key: 'email',
            label: 'Email',
            flex: 1.8,
            minWidth: 220,
            render: (row) => (
              <Text style={styles.email} numberOfLines={1}>
                {row.email ?? '—'}
              </Text>
            ),
          },
          {
            key: 'orders',
            label: 'Orders',
            flex: 0.7,
            minWidth: 100,
            align: 'right',
            render: (row) => (
              <Badge
                label={String(row.orderCount)}
                tone={row.orderCount > 0 ? 'primary' : 'default'}
              />
            ),
          },
        ]}
      />

      <Text style={styles.hint}>Tap a row to view that customer&apos;s orders.</Text>
    </AdminScrollPage>
  );
}

const styles = StyleSheet.create({
  nameCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.label, color: colors.primaryDark, fontSize: 15 },
  nameText: { flex: 1, minWidth: 0 },
  name: { ...typography.label, color: colors.foreground },
  phoneHint: { ...typography.caption, marginTop: 2 },
  email: { ...typography.bodySm, color: colors.foreground },
  hint: { ...typography.caption, marginTop: spacing.sm },
});
