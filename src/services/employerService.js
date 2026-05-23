import { supabase } from './supabase';

const normalizeEmployer = (employer) => ({ ...employer });

// Đã thêm Join USERS để màn hình danh sách hiển thị được Email
export async function getEmployers() {
  const { data, error } = await supabase
    .from('COMPANIES')
    .select(`
      *,
      USERS (email, is_active)
    `)
    .order('id', { ascending: false });

  if (error) throw new Error(error.message);
  
  // Format lại để UI nhận được thuộc tính userEmail
  return data.map(item => ({
      ...item,
      userEmail: item.USERS?.email,
      // Some DB schemas don't have USERS.status. Derive userStatus from is_active for UI filters.
      userStatus: item.USERS?.is_active === false ? 'blocking' : (item.USERS?.status || (item.USERS?.is_active ? 'active' : null)),
      is_active: item.USERS?.is_active,
  }));
}

export async function getEmployerById(id) {
  if (!id) throw new Error("Thiếu ID nhà tuyển dụng");

  const { data, error } = await supabase
    .from('COMPANIES')
    .select(`
      id, name, logo_url, city, status, 
      USERS (email, is_active), 
      JOB_POSTINGS (id)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Format lại dữ liệu cho đúng định dạng UI cần
  return {
      id: data.id,
      name: data.name,
      logo_url: data.logo_url,
      city: data.city,
      status: data.status,
      email: data.USERS?.email,
      is_active: data.USERS?.is_active,
      user_status: data.USERS?.status,
      job_count: data.JOB_POSTINGS ? data.JOB_POSTINGS.length : 0, 
  };
}

// Hàm Tạo mới Nhà tuyển dụng (Xử lý lưu vào 2 bảng)
export async function createEmployer(employerData) {
  const inputEmail = employerData.email.trim().toLowerCase();

  // BƯỚC 1: Kiểm tra xem Email đã tồn tại trong bảng USERS chưa
  const { data: existingUser, error: checkError } = await supabase
    .from('USERS')
    .select('id')
    .eq('email', inputEmail)
    .maybeSingle();

  if (checkError) throw new Error("Lỗi kiểm tra hệ thống: " + checkError.message);
  if (existingUser) {
    throw new Error("Email này đã được sử dụng. Vui lòng nhập email khác!");
  }

  // BƯỚC 2: Tạo tài khoản bên bảng USERS
  const { data: newUser, error: createAuthError } = await supabase
    .from('USERS')
    .insert([{ 
        email: inputEmail, 
        password_hash: employerData.password, 
        role: 'employer',
        // Admin-created accounts should be active by default
        is_active: true
    }])
    .select()
    .single();

  if (createAuthError) throw new Error("Không thể tạo tài khoản xác thực: " + createAuthError.message);

  // BƯỚC 3: Dùng newUser.id để tạo thông tin bên bảng COMPANIES
  const { data: companyData, error: companyError } = await supabase
    .from('COMPANIES')
    .insert([{
        user_id: newUser.id, // Liên kết với tài khoản vừa tạo
        name: employerData.name.trim(),
        city: employerData.city || null,
        logo_url: employerData.logoUrl || null,
        // Admin-created companies start as approved
        status: 'approved'
    }])
    .select()
    .single();

  if (companyError) {
    // Nếu tạo Company thất bại, xóa User vừa tạo để tránh rác DB
    await supabase.from('USERS').delete().eq('id', newUser.id);
    throw new Error("Lỗi khởi tạo doanh nghiệp: " + companyError.message);
  }

  // Gọi lại hàm getEmployerById để lấy cục dữ liệu trả về
  return getEmployerById(companyData.id);
}

export async function approveEmployer(id) {
  // Cập nhật trạng thái company
  const { data: company, error: compErr } = await supabase
    .from('COMPANIES')
    .update({ status: 'approved' })
    .eq('id', id)
    .select('id, user_id')
    .single();

  if (compErr) throw new Error(compErr.message);

  // Nếu company được liên kết tới user, bật is_active trên USERS
  if (company?.user_id) {
    const { error: userErr } = await supabase
      .from('USERS')
      .update({ is_active: true })
      .eq('id', company.user_id);
    if (userErr) throw new Error(userErr.message);
  }

  return getEmployerById(id);
}

export async function rejectEmployer(id) {
  // Cập nhật trạng thái company
  const { data: company, error: compErr } = await supabase
    .from('COMPANIES')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select('id, user_id')
    .single();

  if (compErr) throw new Error(compErr.message);

  // Nếu có liên kết user, tắt is_active trên USERS (block)
  if (company?.user_id) {
    const { error: userErr } = await supabase
      .from('USERS')
      .update({ is_active: false })
      .eq('id', company.user_id);
    if (userErr) throw new Error(userErr.message);
  }

  return getEmployerById(id);
}

// Chặn employer (block): set company.status = 'blocking' và USERS.is_active = false
export async function blockEmployer(id) {
  const { data: company, error: compErr } = await supabase
    .from('COMPANIES')
    .update({ status: 'blocking' })
    .eq('id', id)
    .select('id, user_id')
    .single();

  if (compErr) throw new Error(compErr.message);

  if (company?.user_id) {
    const { error: userErr } = await supabase
      .from('USERS')
      .update({ is_active: false })
      .eq('id', company.user_id);
    if (userErr) throw new Error(userErr.message);
  }

  return getEmployerById(id);
}

// Bỏ chặn employer: phục hồi trạng thái company.status => 'approved' và USERS.is_active = true
export async function unblockEmployer(id) {
  const { data: company, error: compErr } = await supabase
    .from('COMPANIES')
    .update({ status: 'approved' })
    .eq('id', id)
    .select('id, user_id')
    .single();

  if (compErr) throw new Error(compErr.message);

  if (company?.user_id) {
    const { error: userErr } = await supabase
      .from('USERS')
      .update({ is_active: true })
      .eq('id', company.user_id);
    if (userErr) throw new Error(userErr.message);
  }

  return getEmployerById(id);
}

export async function deleteEmployer(id) {
  const { error } = await supabase.from('COMPANIES').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

// Block the related user account by company id: set USERS.status = 'blocking' and is_active = false
export async function blockUserForCompany(id) {
  const { data: company, error: compErr } = await supabase
    .from('COMPANIES')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (compErr) throw new Error(compErr.message);

  if (company?.user_id) {
    const { error: userErr } = await supabase
      .from('USERS')
      // Some schemas don't have USERS.status column; only toggle is_active
      .update({ is_active: false })
      .eq('id', company.user_id);
    if (userErr) throw new Error(userErr.message);
  }

  return getEmployerById(id);
}

// Unblock the related user account: set USERS.status = 'approved' and is_active = true
export async function unblockUserForCompany(id) {
  const { data: company, error: compErr } = await supabase
    .from('COMPANIES')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (compErr) throw new Error(compErr.message);

  if (company?.user_id) {
    const { error: userErr } = await supabase
      .from('USERS')
      // Only toggle is_active to reactivate
      .update({ is_active: true })
      .eq('id', company.user_id);
    if (userErr) throw new Error(userErr.message);
  }

  return getEmployerById(id);
}

// Suspend company postings: set COMPANIES.status = 'suspend'
export async function suspendCompany(id) {
  const { data, error } = await supabase
    .from('COMPANIES')
    .update({ status: 'suspend' })
    .eq('id', id)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return getEmployerById(id);
}

// Unsuspend company: restore status to 'approved'
export async function unsuspendCompany(id) {
  const { data, error } = await supabase
    .from('COMPANIES')
    .update({ status: 'approved' })
    .eq('id', id)
    .select('id')
    .single();

  if (error) throw new Error(error.message);
  return getEmployerById(id);
}
