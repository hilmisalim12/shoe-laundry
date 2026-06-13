import { useCallback, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getAllServices, upsertService } from '@/src/lib/api';
import { formatCurrency } from '@/src/lib/format';
import { AdminPageHeader } from '@/src/components/ui/AdminPageHeader';
import { AdminScrollPage } from '@/src/components/ui/AdminScrollPage';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import type { Service } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function AdminServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('2');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => setServices(await getAllServices()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleAdd() {
    setError('');
    setSuccess('');
    if (!name || !price) {
      setError('Name and price are required.');
      return;
    }
    try {
      setLoading(true);
      await upsertService({
        name: name.trim(),
        description: description.trim(),
        base_price: Number(price),
        estimated_days: Number(days) || 2,
        is_active: true,
      });
      setName('');
      setDescription('');
      setPrice('');
      setDays('2');
      await load();
      setSuccess('Service added to catalog.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add service.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleService(service: Service) {
    await upsertService({ ...service, is_active: !service.is_active });
    await load();
  }

  return (
    <AdminScrollPage
      maxWidth={960}
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <AdminPageHeader title="Services" subtitle="Manage your service catalog and pricing" />

      {error ? <InlineMessage message={error} tone="error" /> : null}
      {success ? <InlineMessage message={success} tone="success" /> : null}

      <Card style={styles.formCard}>
        <Text style={styles.section}>Add service</Text>
        <FormField label="Name" required>
          <Input placeholder="e.g. Standard Clean" value={name} onChangeText={setName} />
        </FormField>
        <FormField label="Description">
          <Input
            placeholder="Brief description of the service"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </FormField>
        <View style={styles.row}>
          <FormField label="Price (IDR)" required style={styles.half}>
            <Input placeholder="35000" value={price} onChangeText={setPrice} keyboardType="number-pad" />
          </FormField>
          <FormField label="Estimated days" style={styles.half}>
            <Input placeholder="2" value={days} onChangeText={setDays} keyboardType="number-pad" />
          </FormField>
        </View>
        <Button title="Add service" onPress={handleAdd} loading={loading} fullWidth />
      </Card>

      <Text style={[styles.section, { marginTop: spacing.xxxl }]}>Catalog</Text>
      {services.map((service) => (
        <Card key={service.id} style={styles.catalogCard}>
          <View style={styles.serviceTop}>
            <Text style={typography.label}>{service.name}</Text>
            <Switch value={service.is_active} onValueChange={() => toggleService(service)} trackColor={{ true: colors.primary }} />
          </View>
          <Text style={typography.bodySm}>{service.description}</Text>
          <Text style={typography.bodySm}>
            {formatCurrency(service.base_price)} · {service.estimated_days} day(s)
          </Text>
        </Card>
      ))}
    </AdminScrollPage>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.h3, marginBottom: spacing.lg },
  formCard: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  catalogCard: { marginBottom: spacing.md },
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
