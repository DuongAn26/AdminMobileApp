import { supabase } from './supabase';

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    role: data.user?.app_metadata?.role || 'admin',
    token: data.session?.access_token || '',
  };
}
