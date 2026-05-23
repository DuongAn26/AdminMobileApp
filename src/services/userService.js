import { supabase } from './supabase';

export async function getCurrentUserRecord() {
  // Get session user email then fetch USERS row
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user;
  if (!authUser?.email) throw new Error('Không tìm thấy email người dùng');

  const { data: user, error } = await supabase
    .from('USERS')
    .select('*')
    .ilike('email', authUser.email)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return user;
}

export async function updateUserProfile(payload) {
  // payload should include id or email to identify record
  if (!payload?.id && !payload?.email) throw new Error('Thiếu id hoặc email để cập nhật');
  const q = supabase.from('USERS').update({
    fullname: payload.fullname || null,
    phone: payload.phone || null,
  });
  if (payload.id) q.eq('id', payload.id); else q.ilike('email', payload.email);

  const { data, error } = await q.select().maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function changeUserPassword(oldPassword, newPassword) {
  // Verify old password by attempting sign in with credentials
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user;
  if (!authUser?.email) throw new Error('Không tìm thấy email người dùng');

  // Try to sign in with old password to verify
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: authUser.email,
    password: oldPassword,
  });

  if (verifyErr) throw new Error('Mật khẩu cũ không đúng');

  // Update password on auth
  const { error: upErr } = await supabase.auth.updateUser({ password: newPassword });
  if (upErr) throw new Error(upErr.message || 'Không thể thay đổi mật khẩu');

  // Also update USERS.password_hash if that field exists in schema (best-effort)
  try {
    await supabase.from('USERS').update({ password_hash: newPassword }).ilike('email', authUser.email);
  } catch (e) {
    // ignore non-critical
  }

  return { success: true };
}
