import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { updateProfile } from '@/src/lib/auth';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { CustomerPageHeader } from '@/src/components/ui/CustomerPageHeader';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { ReadOnlyField } from '@/src/components/ui/ReadOnlyField';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useUserStore } from '@/src/stores/userStore';
import { spacing, typography } from '@/src/theme/tokens';

export default function ProfileScreen() {
  const profile = useUserStore((s) => s.profile);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  function handleCancel() {
    setName(profile?.name ?? '');
    setPhone(profile?.phone ?? '');
    setEditing(false);
    setError('');
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    try {
      setLoading(true);
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined });
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll maxWidth={560} bottomPad={96} keyboardAvoid>
      <CustomerPageHeader title="Profile" subtitle="Your account details" showSignOut />

      {error ? <InlineMessage message={error} tone="error" /> : null}
      {success ? <InlineMessage message={success} tone="success" /> : null}

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Account information</Text>
          {!editing ? (
            <Button title="Edit" variant="outline" size="sm" onPress={() => setEditing(true)} />
          ) : null}
        </View>

        <ReadOnlyField label="Email" value={profile?.email ?? '-'} />

        {!editing ? (
          <>
            <ReadOnlyField label="Full name" value={name} />
            <ReadOnlyField label="Phone number" value={phone || 'Not set'} />
          </>
        ) : (
          <>
            <FormField label="Full name" required>
              <Input value={name} onChangeText={setName} autoComplete="name" />
            </FormField>
            <FormField label="Phone number">
              <Input value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" />
            </FormField>
            <View style={styles.actions}>
              <Button title="Cancel" variant="ghost" onPress={handleCancel} flex />
              <Button title="Save" onPress={handleSave} loading={loading} flex />
            </View>
          </>
        )}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardTitle: { ...typography.h3 },
  actions: { flexDirection: 'row', gap: spacing.md },
});
