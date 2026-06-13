import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { hasRecoverySession, requestPasswordReset, resetPasswordWithToken } from '@/src/lib/auth';
import { isSupabaseConfigured } from '@/src/lib/supabase';
import { AuthCard } from '@/src/components/ui/AuthCard';
import { Button } from '@/src/components/ui/Button';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { PasswordInput } from '@/src/components/ui/PasswordInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/AppThemeContext';

export default function ResetPasswordScreen() {
  const theme = useAppTheme();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [supabaseRecovery, setSupabaseRecovery] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      hasRecoverySession().then(setSupabaseRecovery);
    }
  }, []);

  async function handleReset() {
    setError('');
    setSuccess('');

    if (!isSupabaseConfigured && (!email.trim() || !token.trim())) {
      setError('Enter your email and the reset token from your reset request.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match. Please re-enter them.');
      return;
    }

    try {
      setLoading(true);
      await resetPasswordWithToken(email.trim(), token.trim(), password);
      setSuccess('Your password has been updated. You can now sign in.');
      setTimeout(() => router.replace('/(auth)/login'), 1200);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to reset password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      setError('Enter your email first, then request a new reset link.');
      return;
    }
    try {
      setLoading(true);
      const result = await requestPasswordReset(email.trim());
      if (result.demoToken) setToken(result.demoToken);
      setSuccess('A new reset link has been generated. Use the token below in demo mode.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll maxWidth={480} keyboardAvoid>
      <AuthCard title="Reset password" subtitle="Choose a new password for your account">
        {error ? <InlineMessage message={error} tone="error" /> : null}
        {success ? <InlineMessage message={success} tone="success" /> : null}

        {!isSupabaseConfigured ? (
          <>
            <FormField label="Email address" required>
              <Input
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </FormField>
            <FormField label="Reset token" required hint="Provided after you request a password reset">
              <Input placeholder="reset-..." autoCapitalize="none" value={token} onChangeText={setToken} />
            </FormField>
          </>
        ) : supabaseRecovery ? (
          <InlineMessage
            message="Recovery session detected. Enter your new password below."
            tone="info"
          />
        ) : (
          <InlineMessage
            message="Open the reset link from your email, or enter your email and request a new one."
            tone="info"
          />
        )}

        <FormField label="New password" required hint="At least 6 characters">
          <PasswordInput placeholder="New password" value={password} onChangeText={setPassword} />
        </FormField>
        <FormField label="Confirm password" required>
          <PasswordInput placeholder="Confirm new password" value={confirm} onChangeText={setConfirm} />
        </FormField>

        <Button title="Update password" onPress={handleReset} loading={loading} fullWidth />

        {!isSupabaseConfigured ? (
          <Button title="Generate new reset token" variant="secondary" onPress={handleResend} loading={loading} fullWidth />
        ) : null}

        <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.backWrap}>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>← Back to sign in</Text>
        </Pressable>
      </AuthCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backWrap: { alignItems: 'center' },
});
