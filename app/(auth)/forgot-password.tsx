import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { requestPasswordReset } from '@/src/lib/auth';
import { AuthCard } from '@/src/components/ui/AuthCard';
import { Button } from '@/src/components/ui/Button';
import { FormField } from '@/src/components/ui/FormField';
import { InlineMessage } from '@/src/components/ui/InlineMessage';
import { Input } from '@/src/components/ui/Input';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/AppThemeContext';

export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit() {
    setError('');
    setSuccess('');
    if (!email.trim()) {
      setError('Please enter the email associated with your account.');
      return;
    }
    try {
      setLoading(true);
      const result = await requestPasswordReset(email.trim());
      if (result.demoToken) {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email: email.trim(), token: result.demoToken },
        });
        return;
      }
      const message = 'If an account exists for this email, password reset instructions have been sent.';
      setSuccess(message);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to process request. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll keyboardAvoid>
      <AuthCard
        title="Forgot password?"
        subtitle="Enter your email and we'll help you reset your password"
      >
        {error ? <InlineMessage message={error} tone="error" /> : null}
        {success ? <InlineMessage message={success} tone="success" /> : null}

        <FormField label="Email address" required>
          <Input
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </FormField>

        <Button title="Send reset link" onPress={handleSubmit} loading={loading} fullWidth />

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(auth)/reset-password',
              params: { email: email.trim() },
            })
          }
          style={styles.demoLink}
        >
          <Text style={[theme.typography.bodySm, styles.link, { color: theme.colors.primary }]}>
            Already have a reset link? Set new password →
          </Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.backWrap}>
          <Text style={[theme.typography.bodySm, { color: theme.colors.textSecondary }]}>← Back to sign in</Text>
        </Pressable>
      </AuthCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  demoLink: { alignItems: 'center' },
  link: { fontWeight: '600' },
  backWrap: { alignItems: 'center' },
});
