import { supabase } from './supabase';

// Hàm chuẩn hóa cấu trúc dữ liệu trả về cho UI
const normalizeCandidate = (data) => {
  if (!data) return null;
  
  // Trích xuất kỹ năng từ mảng Join sang mảng chuỗi đơn giản cho UI tag
  const skillsArray = data.CANDIDATE_SKILLS 
    ? data.CANDIDATE_SKILLS.map(cs => cs.SKILLS?.name).filter(Boolean)
    : [];

  return {
    id: data.id,
    user_id: data.user_id,
    fullname: data.fullname,
    phone: data.phone,
    city: data.city,
    avatar_url: data.avatar_url,
    personal_link: data.personal_link,
    dob: data.dob,
    gender: data.gender,
    address: data.address,
    about_me: data.about_me,
    
    // Dữ liệu join từ các bảng con
    email: data.USERS?.email,
    isActive: data.USERS?.is_active ?? true,
    skills: skillsArray,
    resumes: data.RESUMES || [],
    educations: data.CANDIDATE_EDUCATIONS || [],
    experiences: data.CANDIDATE_EXPERIENCES || [],
    projects: data.CANDIDATE_PROJECTS || [],
    certificates: data.CANDIDATE_CERTIFICATES || [],
    
    // Tạo mảng lịch sử ứng tuyển đã được map thông tin Job & Company
    applications: data.APPLICATIONS ? data.APPLICATIONS.map(app => ({
      id: app.id,
      status: app.status,
      applyDate: app.applied_at,
      jobTitle: app.JOB_POSTINGS?.title,
      companyName: app.JOB_POSTINGS?.COMPANIES?.name
    })) : [],

    // Đếm số lượng để làm Thống kê hoạt động ở góc Overview
    stats: {
      totalApplications: data.APPLICATIONS ? data.APPLICATIONS.length : 0,
      totalSavedJobs: data.SAVED_JOBS ? data.SAVED_JOBS.length : 0,
      totalResumes: data.RESUMES ? data.RESUMES.length : 0,
      createdAt: null
    }
  };
};

// 1. LẤY DANH SÁCH ỨNG VIÊN (Kèm trạng thái Active từ USERS)
export async function getCandidates() {
  const { data, error } = await supabase
    .from('CANDIDATES')
    .select(`
      id, fullname, city,
      USERS (is_active)
    `);

  if (error) throw new Error(error.message);

  return data.map(item => ({
    id: item.id,
    fullname: item.fullname,
    city: item.city,
    isActive: item.USERS?.is_active ?? true
  }));
}

// 2. TRUY VẤN CHI TIẾT ỨNG VIÊN (Join tất cả bảng con phục vụ UI)
export async function getCandidateById(id) {
  if (!id) throw new Error("Thiếu ID ứng viên");

  const { data, error } = await supabase
    .from('CANDIDATES')
    .select(`
      *,
      USERS (email, is_active),
      RESUMES (*),
      CANDIDATE_EDUCATIONS (*),
      CANDIDATE_EXPERIENCES (*),
      CANDIDATE_PROJECTS (*),
      CANDIDATE_CERTIFICATES (*),
      SAVED_JOBS (job_id),
      CANDIDATE_SKILLS (
        SKILLS (name)
      ),
      APPLICATIONS (
        id, status, applied_at,
        JOB_POSTINGS (
          title,
          COMPANIES (name)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return normalizeCandidate(data);
}

// 3. KHỞI TẠO TÀI KHOẢN (Đúng luồng: Tạo AUTH trước -> Lấy user_id -> Tạo CANDIDATE)
export async function createCandidate(candidate) {
  // BƯỚC A: Đăng ký tài khoản vào bảng USERS trước để lấy khóa ngoại user_id
  const { data: userData, error: userError } = await supabase
    .from('USERS')
    .select('id')
    .eq('email', candidate.Email.trim())
    .maybeSingle();

  let targetUserId;

  if (!userData) {
    // Nếu chưa có tài khoản email này, tiến hành tạo mới trong bảng USERS
    const { data: newUser, error: createAuthError } = await supabase
      .from('USERS')
      .insert([{ 
          email: candidate.Email.trim(), 
          password_hash: candidate.Password, // Nên hash ở thực tế
          role: 'candidate',
          is_active: true 
      }])
      .select()
      .single();

    if (createAuthError) throw new Error("Lỗi tạo Auth User: " + createAuthError.message);
    targetUserId = newUser.id;
  } else {
    targetUserId = userData.id;
  }

  // BƯỚC B: Chỉ đẩy các trường hợp lệ vào bảng CANDIDATES
  const { data: candidateData, error: candidateError } = await supabase
    .from('CANDIDATES')
    .insert([{
        user_id: targetUserId,
        fullname: candidate.Fullname.trim()
    }])
    .select()
    .single();

  if (candidateError) throw new Error("Lỗi tạo hồ sơ Candidate: " + candidateError.message);

  // Lấy ngược lại toàn bộ thông tin vừa tạo để trả về UI
  return getCandidateById(candidateData.id);
}

// 4. BẬT / KHÓA TÀI KHOẢN (Cập nhật trạng thái is_active ở bảng USERS)
export async function toggleCandidateStatus(id) {
  // Lấy thông tin hiện tại để biết user_id và trạng thái hiện tại
  const currentDetails = await getCandidateById(id);
  if (!currentDetails?.user_id) throw new Error("Không tìm thấy thông tin tài khoản liên kết.");

  const newStatus = currentDetails.isActive === false;

  // Cập nhật trạng thái đảo ngược vào bảng USERS (chứ không phải bảng CANDIDATES)
  const { error } = await supabase
    .from('USERS')
    .update({ is_active: newStatus })
    .eq('id', currentDetails.user_id);

  if (error) throw new Error(error.message);

  return { ...currentDetails, isActive: newStatus };
}

// 5. XÓA ỨNG VIÊN
export async function deleteCandidate(id) {
  const { error } = await supabase
    .from('CANDIDATES')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { success: true };
}