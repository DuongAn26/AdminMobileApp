import { supabase } from './supabase';

const normalizeTicket = (ticket, replies=[]) => ({
  ...ticket,
  replies: replies || ticket?.replies || [],
});

export async function getTickets() {
  const { data, error } = await supabase
    .from('SUPPORT_TICKETS')
    .select(`*, USERS (email)`)
    .order('id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((t) => normalizeTicket({ ...t, userEmail: t.USERS?.email || t.user_email }));
}

export async function getTicketById(id) {
  const { data, error } = await supabase
    .from('SUPPORT_TICKETS')
    .select(`*, USERS (email)`)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: replies, error: rErr } = await supabase
    .from('TICKET_REPLIES')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  if (rErr) {
    throw new Error(rErr.message);
  }

  return normalizeTicket({ ...data, userEmail: data.USERS?.email || data.user_email }, replies);
}

export async function replyTicket(id, message, userId=null, userEmail=null) {
  let resolvedUserId = userId;
  // If caller didn't provide userId, try to resolve from current session email -> find USERS.id
  if (!resolvedUserId) {
    try {
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;
      if (authUser?.email) {
        // Find internal USERS record by email (USERS.id is expected to be integer)
        const { data: udata, error: uErr } = await supabase
          .from('USERS')
          .select('id')
          .ilike('email', authUser.email)
          .maybeSingle();
        if (uErr) {
          // continue and throw below
        } else if (udata?.id) {
          resolvedUserId = udata.id;
        }
      }
    } catch (e) {
      // ignore and handle below
    }
  }

  if (!resolvedUserId) {
    throw new Error('Không tìm thấy user_id hợp lệ cho reply. Hãy đảm bảo tài khoản USERS tồn tại (email khớp) hoặc gọi replyTicket với userId integer.');
  }

  const payload = {
    ticket_id: id,
    user_id: resolvedUserId,
    message,
  };

  const { data: inserted, error: insErr } = await supabase
    .from('TICKET_REPLIES')
    .insert([payload])
    .select()
    .single();

  if (insErr) {
    throw new Error(insErr.message);
  }

  // Re-fetch ticket and replies to return updated ticket object
  return await getTicketById(id);
}

export async function updateTicketStatus(id, status) {
  const { data, error } = await supabase
    .from('SUPPORT_TICKETS')
    .update({ status })
    .eq('id', id)
    .select(`*, USERS (email)`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // fetch replies
  const { data: replies, error: rErr } = await supabase
    .from('TICKET_REPLIES')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true });

  if (rErr) {
    throw new Error(rErr.message);
  }

  return normalizeTicket({ ...data, userEmail: data.USERS?.email || data.user_email }, replies);
}

export async function deleteTicket(id) {
  // First delete replies to avoid foreign key issues, then delete the ticket
  const { error: rErr } = await supabase
    .from('TICKET_REPLIES')
    .delete()
    .eq('ticket_id', id);

  if (rErr) {
    throw new Error(rErr.message);
  }

  const { error: tErr } = await supabase
    .from('SUPPORT_TICKETS')
    .delete()
    .eq('id', id);

  if (tErr) {
    throw new Error(tErr.message);
  }

  return { success: true };
}
