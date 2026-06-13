import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import * as local from '@/src/lib/localDb';
import { useUserStore } from '@/src/stores/userStore';
import type { Profile } from '@/src/types';

async function fetchSupabaseProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email ?? undefined,
    name: data.name,
    phone: data.phone ?? undefined,
    role: data.role,
    created_at: data.created_at,
  };
}

export async function signInWithEmail(email: string, password: string): Promise<Profile> {
  if (!isSupabaseConfigured) {
    const profile = await local.localLogin(email, password);
    useUserStore.getState().setProfile(profile);
    return profile;
  }
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const profile = await fetchSupabaseProfile(data.user.id);
  if (!profile) throw new Error('Profile not found');
  useUserStore.getState().setProfile(profile);
  return profile;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  phone?: string,
): Promise<Profile> {
  if (!isSupabaseConfigured) {
    const profile = await local.localRegister(email, password, name, phone);
    useUserStore.getState().setProfile(profile);
    return profile;
  }
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { name, phone } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Sign up failed');
  const profile: Profile = {
    id: data.user.id,
    email,
    name,
    phone,
    role: 'customer',
  };
  await supabase!.from('profiles').insert({
    id: profile.id,
    email,
    name,
    phone,
    role: 'customer',
  });
  useUserStore.getState().setProfile(profile);
  return profile;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  useUserStore.getState().signOut();
}

export async function restoreSession(): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    const profile = useUserStore.getState().profile;
    return profile;
  }
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const profile = await fetchSupabaseProfile(data.session.user.id);
  if (profile) useUserStore.getState().setProfile(profile);
  return profile;
}

export async function updateProfile(input: { name: string; phone?: string }) {
  const current = useUserStore.getState().profile;
  if (!current) throw new Error('Not signed in');
  if (!isSupabaseConfigured) {
    const updated = { ...current, ...input };
    await local.localUpsertProfile(updated);
    useUserStore.getState().setProfile(updated);
    return updated;
  }
  const { error } = await supabase!
    .from('profiles')
    .update({ name: input.name, phone: input.phone })
    .eq('id', current.id);
  if (error) throw error;
  const updated = { ...current, ...input };
  useUserStore.getState().setProfile(updated);
  return updated;
}

export async function requestPasswordReset(email: string): Promise<{ demoToken?: string; email: string }> {
  const trimmed = email.trim();
  if (!trimmed) throw new Error('Please enter your email address.');

  if (!isSupabaseConfigured) {
    const token = await local.localRequestPasswordReset(trimmed);
    return { demoToken: token, email: trimmed };
  }

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
  const { error } = await supabase!.auth.resetPasswordForEmail(trimmed, { redirectTo });
  if (error) throw new Error(error.message);
  return { email: trimmed };
}

export async function resetPasswordWithToken(
  email: string,
  token: string,
  newPassword: string,
): Promise<void> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  if (!isSupabaseConfigured) {
    await local.localResetPassword(email, token, newPassword);
    return;
  }

  const { error } = await supabase!.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

export async function hasRecoverySession(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}
