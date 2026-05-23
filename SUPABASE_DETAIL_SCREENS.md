# Hướng dẫn step-by-step: Đổ dữ liệu Supabase ra CandidateDetailScreen và EmployerDetailScreen

## Mục tiêu
Tạo dữ liệu thật từ Supabase cho:
- `src/screens/candidates/CandidateDetailScreen.jsx`
- `src/screens/employers/EmployerDetailScreen.jsx`

## Bước 1: Xác nhận Supabase đã cấu hình đúng

Mở `src/services/supabase.js` và đảm bảo đã điền:
- `supabaseUrl`
- `supabaseAnonKey`

Nếu chưa, thay bằng giá trị từ Supabase Project Settings.

## Bước 2: Chuẩn bị bảng trong Supabase

### Bảng `candidates`
Nên có ít nhất các trường:
- `id` (int, primary key, auto increment)
- `fullname` (text)
- `email` (text)
- `phone` (text)
- `gender` (text)
- `city` (text)
- `address` (text)
- `personalLink` (text)
- `aboutMe` (text)
- `dob` (date hoặc timestamp)
- `isActive` (boolean)
- `experiences` (jsonb) - nếu lưu mảng kinh nghiệm
- `educations` (jsonb) - nếu lưu mảng học vấn
- `projects` (jsonb) - nếu dùng tab dự án
- `certificates` (jsonb) - nếu dùng tab chứng chỉ
- `applications` (jsonb) - nếu dùng tab ứng tuyển
- `resumes` (jsonb) - nếu dùng tab CV
- `stats` (jsonb) - nếu dùng thống kê

### Bảng `employers`
Nên có ít nhất các trường:
- `id` (int, primary key, auto increment)
- `name` (text)
- `logo_url` (text)
- `email` (text)
- `city` (text)
- `status` (text)
- `is_active` (boolean)
- `created_at` (timestamp)
- `job_count` (int)

## Bước 3: Sửa service `src/services/candidateService.js`

Thay toàn bộ các hàm lấy dữ liệu giả trong file bằng Supabase.

### Ví dụ đầy đủ
```js
import { supabase } from './supabase';

export async function getCandidates() {
  const { data, error } = await supabase
    .from('candidates')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getCandidateById(id) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function toggleCandidateStatus(id) {
  const candidate = await getCandidateById(id);
  const { data, error } = await supabase
    .from('candidates')
    .update({ isActive: !candidate.isActive })
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
```

### Ghi chú
- Nếu bạn đang dùng `deleteCandidate` hoặc `createCandidate`, thay tương tự bằng lệnh `.delete()` / `.insert()`.
- Nếu các trường như `experiences`, `educations`, `projects`, `certificates`, `applications`, `resumes` là JSON, Supabase sẽ trả về chúng dưới dạng object/array.

## Bước 4: Sửa `src/screens/candidates/CandidateDetailScreen.jsx`

Hiện tại file đã gọi hàm `getCandidateById(id)` mặc định. Bạn chỉ cần đảm bảo service trả đúng dữ liệu từ Supabase.

### Kiểm tra các bước
1. Đảm bảo `getCandidateById(id)` import đúng:
```js
import { getCandidateById, getCandidates, toggleCandidateStatus } from '../../services/candidateService';
```
2. Đảm bảo `fetchDetail` nhận `id` từ URL:
```js
const { id } = useLocalSearchParams();
```
3. Đảm bảo `candidate` được set dữ liệu trả về từ Supabase:
```js
const data = await getCandidateById(id);
setCandidate(data);
```
4. Load lại dữ liệu khi `id` thay đổi:
```js
useEffect(() => {
  fetchDetail();
  fetchIsActive();
}, [id]);
```

### Nếu muốn data thêm chi tiết
- Nếu Supabase trả `experiences` và `educations` là JSON array, màn hình sẽ hiển thị các tab tương ứng.
- Nếu không có `candidate.projects`, hãy xóa hoặc ẩn tab `projects` trong `TABS`.

## Bước 5: Sửa service `src/services/employerService.js`

Thay bằng Supabase:

```js
import { supabase } from './supabase';

export async function getEmployerById(id) {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function approveEmployer(id) {
  const { data, error } = await supabase
    .from('employers')
    .update({ status: 'APPROVED' })
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function rejectEmployer(id) {
  const { data, error } = await supabase
    .from('employers')
    .update({ status: 'REJECTED' })
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}
```

## Bước 6: Sửa `src/screens/employers/EmployerDetailScreen.jsx`

File hiện tại đã gọi `getEmployerById(id)`.

### Kiểm tra lại các bước
1. Mở file và xác định `useLocalSearchParams()` đã đang lấy đúng `id`.
2. Mở `useEffect` và đảm bảo `fetchDetail()` gọi:
```js
const data = await getEmployerById(id);
if (data) setReport(data);
```
```
3. Kiểm tra các trường dữ liệu hiển thị trong UI:
- `report.logo_url`
- `report.name`
- `report.email`
- `report.city`
- `report.created_at`
- `report.job_count`
- `report.status`
- `report.is_active`
```

### Nếu Supabase trả khác tên trường
Ví dụ nếu bảng dùng `logoUrl` thay vì `logo_url`, hãy đổi UI thành `report.logoUrl`.

## Bước 7: Test trực tiếp

1. Chạy project bằng `npm start` hoặc `expo start`.
2. Vào trang danh sách `Candidates`.
3. Chọn một ứng viên để vào `CandidateDetailScreen`.
4. Kiểm tra dữ liệu hiển thị chính xác.
5. Vào trang `Employers`, chọn một nhà tuyển dụng để vào `EmployerDetailScreen`.
6. Kiểm tra dữ liệu hiển thị chính xác.

## Gợi ý debug

- Nếu màn hình luôn `Đang tải...`, kiểm tra lỗi console.
- Nếu `report` hoặc `candidate` undefined, kiểm tra query Supabase và trường `id`.
- Nếu JSON field không hiển thị, kiểm tra dữ liệu trong Supabase Editor.

## Tổng kết

1. Điền `supabaseUrl` và `supabaseAnonKey` trong `src/services/supabase.js`.
2. Chuyển `getCandidateById` và `getEmployerById` về Supabase.
3. Giữ nguyên UI hiện tại nếu dữ liệu Supabase trả về đúng kiểu.
4. Test thật kỹ bằng các màn hình chi tiết của ứng viên và nhà tuyển dụng.
