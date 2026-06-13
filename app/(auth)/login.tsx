import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { signInWithEmail } from '@/src/lib/auth';
import { AuthCard } from '@/src/components/ui/AuthCard';
import { Button } from '@/src/components/ui/Button';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { PasswordInput } from '@/src/components/ui/PasswordInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { colors, spacing, typography } from '@/src/theme/tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      const profile = await signInWithEmail(email.trim(), password);
      router.replace(profile.role === 'admin' ? '/(admin)/dashboard' : '/(customer)/home');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to sign in. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll maxWidth={480} keyboardAvoid>
      <AuthCard title="Welcome back" subtitle="Sign in to manage your shoe cleaning orders">
        {error ? <InlineMessage message={error} tone="error" /> : null}

        <FormField label="Email address" required>
          <Input
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
          />
        </FormField>

        <FormField label="Password" required>
          <PasswordInput
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChangeText={(v) => { setPassword(v); setError(''); }}
          />
        </FormField>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotWrap}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </Pressable>

        <Button title="Sign in" onPress={handleLogin} loading={loading} fullWidth />

        <Pressable onPress={() => router.push('/(auth)/register')} style={styles.linkWrap}>
          <Text style={styles.linkText}>
            New customer? <Text style={styles.linkAccent}>Create account</Text>
          </Text>
        </Pressable>
      </AuthCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  forgotWrap: { alignSelf: 'flex-end', marginTop: -spacing.sm },
  forgotLink: { ...typography.bodySm, color: colors.primary, fontWeight: '600' },
  linkWrap: { alignItems: 'center' },
  linkText: { ...typography.bodySm, color: colors.textSecondary },
  linkAccent: { color: colors.primary, fontWeight: '600' },
});
