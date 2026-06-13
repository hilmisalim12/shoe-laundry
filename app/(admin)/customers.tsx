import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Text } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getCustomers } from '@/src/lib/api';
import { AdminPageHeader } from '@/src/components/ui/AdminPageHeader';
import { AdminScrollPage } from '@/src/components/ui/AdminScrollPage';
import { DataTable } from '@/src/components/ui/DataTable';
import type { Profile } from '@/src/types';
import { typography } from '@/src/theme/tokens';

type CustomerRow = Profile & { orderCount: number };

export default function AdminCustomersScreen() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [ordersFilter, setOrdersFilter] = useState('');

  const load = useCallback(async () => setCustomers(await getCustomers()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const nameOk = c.name.toLowerCase().includes(nameFilter.trim().toLowerCase());
      const emailOk = (c.email ?? '').toLowerCase().includes(emailFilter.trim().toLowerCase());
      const phoneOk = (c.phone ?? '').includes(phoneFilter.trim());
      const ordersOk =
        !ordersFilter.trim() || String(c.orderCount).includes(ordersFilter.trim());
      return nameOk && emailOk && phoneOk && ordersOk;
    });
  }, [customers, nameFilter, emailFilter, phoneFilter, ordersFilter]);

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
        subtitle="Filter by column to explore customer records. Click a row to view their orders."
      />

      <DataTable<CustomerRow>
        data={filtered}
        keyExtractor={(row) => row.id}
        emptyTitle="No customers match your filters"
        onRowPress={(row) =>
          router.push({ pathname: '/(admin)/orders', params: { customerId: row.id } })
        }
        columns={[
          {
            key: 'name',
            label: 'Name',
            flex: 1.2,
            minWidth: 160,
            filterValue: nameFilter,
            onFilterChange: setNameFilter,
            filterPlaceholder: 'Filter name...',
            render: (row) => <Text style={typography.label}>{row.name}</Text>,
          },
          {
            key: 'email',
            label: 'Email',
            flex: 1.5,
            minWidth: 200,
            filterValue: emailFilter,
            onFilterChange: setEmailFilter,
            filterPlaceholder: 'Filter email...',
            render: (row) => <Text style={typography.bodySm}>{row.email ?? '-'}</Text>,
          },
          {
            key: 'phone',
            label: 'Phone',
            flex: 1,
            minWidth: 140,
            filterValue: phoneFilter,
            onFilterChange: setPhoneFilter,
            filterPlaceholder: 'Filter phone...',
            render: (row) => <Text style={typography.bodySm}>{row.phone ?? '-'}</Text>,
          },
          {
            key: 'orders',
            label: 'Orders',
            flex: 0.6,
            minWidth: 100,
            filterValue: ordersFilter,
            onFilterChange: setOrdersFilter,
            filterPlaceholder: 'Filter count...',
            render: (row) => <Text style={typography.bodySm}>{row.orderCount}</Text>,
          },
        ]}
      />
    </AdminScrollPage>
  );
}
