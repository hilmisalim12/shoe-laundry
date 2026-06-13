import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { signUpWithEmail } from '@/src/lib/auth';
import { AuthCard } from '@/src/components/ui/AuthCard';
import { Button } from '@/src/components/ui/Button';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { PasswordInput } from '@/src/components/ui/PasswordInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { colors, typography } from '@/src/theme/tokens';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await signUpWithEmail(email.trim(), password, name.trim(), phone.trim() || undefined);
      router.replace('/(customer)/home');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll maxWidth={480} keyboardAvoid>
      <AuthCard title="Create account" subtitle="Book shoe cleaning and track your orders">
        {error ? <InlineMessage message={error} tone="error" /> : null}

        <FormField label="Full name" required>
          <Input placeholder="Your name" value={name} onChangeText={setName} autoComplete="name" />
        </FormField>
        <FormField label="Phone" hint="Optional — used for pickup coordination">
          <Input placeholder="08xxxxxxxxxx" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        </FormField>
        <FormField label="Email address" required>
          <Input
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </FormField>
        <FormField label="Password" required hint="At least 6 characters">
          <PasswordInput placeholder="Create a password" value={password} onChangeText={setPassword} />
        </FormField>

        <Button title="Create account" onPress={handleRegister} loading={loading} fullWidth />

        <Pressable onPress={() => router.back()} style={styles.linkWrap}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </Pressable>
      </AuthCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  linkWrap: { alignItems: 'center' },
  linkText: { ...typography.bodySm, color: colors.textSecondary },
  linkAccent: { color: colors.primary, fontWeight: '600' },
});
