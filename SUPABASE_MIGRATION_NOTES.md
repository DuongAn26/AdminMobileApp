# Supabase Migration Notes

## Những file đã thay đổi

### 1. `src/services/authService.js`
- Loại bỏ import `MOCK_ADMIN` từ `src/mockData.js`.
- Chuyển authentication sang Supabase Auth.
- Hàm `login` giờ dùng `supabase.auth.signInWithPassword({ email, password })`.
- Trả về `role` từ `data.user?.app_metadata?.role || 'admin'` và `token` từ `data.session?.access_token`.

### 2. `src/services/candidateService.js`
- Loại bỏ hoàn toàn `mockData`.
- Thay `getCandidates`, `getCandidateById`, `deleteCandidate`, `createCandidate`, `toggleCandidateStatus` bằng truy vấn Supabase.
- Dùng `supabase.from('candidates').select('*')` để lấy danh sách.
- Dùng `.eq('id', id).single()` để lấy chi tiết.
- Cập nhật `toggleCandidateStatus` bằng cách lấy candidate hiện tại rồi update `isActive`.
- Thêm `normalizeCandidate` để đảm bảo các trường JSON như `experiences`, `educations`, `projects`, `certificates`, `applications`, `resumes`, `stats` luôn tồn tại.

### 3. `src/services/employerService.js`
- Loại bỏ toàn bộ `mockData`.
- Thay bằng truy vấn Supabase cho `getEmployers`, `getEmployerById`, `approveEmployer`, `rejectEmployer`.
- Dùng `supabase.from('employers').select('*')` và `.update({ status: 'APPROVED' })` / `.update({ status: 'REJECTED' })`.

### 4. `src/services/ticketService.js`
- Loại bỏ `mockData` hoàn toàn.
- Chuyển sang Supabase cho `getTickets`, `getTicketById`, `replyTicket`, `updateTicketStatus`.
- `replyTicket` cập nhật mảng `replies` trong bảng `tickets` bằng `Date.now()` làm `id` tạm.

### 5. `src/screens/tabs/ProfileScreen.jsx`
- Giữ nguyên UI nhưng loại bỏ import `MOCK_ADMIN`.
- Thay `INITIAL_PROFILE.email = MOCK_ADMIN.email` bằng địa chỉ email cứng `admin@itviec.vn`.
- Điều này giúp xóa hết phụ thuộc `mockData` trong UI.

## File mock cũ đã xóa
- `src/mockData.js` đã bị xóa vì không còn import hoặc sử dụng ở bất kỳ file nào.

## Giải thích

### Vì sao cần thay đổi?
Trước đây, ứng dụng dùng dữ liệu giả (`mockData`) để hiển thị candidate, employer, ticket và admin profile.
Việc chuyển sang Supabase giúp:
- sử dụng dữ liệu thật từ database
- giảm thiểu logic giả lập trong code
- chuẩn hóa truy vấn bằng API Supabase
- cho phép xóa file mockData không còn cần thiết

### Những dòng code quan trọng đã thay đổi
- `import { MOCK_* } from '../mockData';` → `import { supabase } from './supabase';`
- `if (USE_MOCK) { ... }` toàn bộ logic giả lập đã bị loại bỏ.
- các hàm `getCandidates`, `getCandidateById`, `getEmployers`, `getEmployerById` giờ dùng `.select('*')` và `.eq('id', id).single()`.
- hàm `createCandidate` giờ chèn dữ liệu vào Supabase bằng `.insert([payload]).select().single()`.
- hàm `replyTicket` giờ cập nhật trường JSON `replies` trong Supabase.

## Ghi chú

- Nếu schema Supabase của bạn dùng tên trường khác, bạn cần điều chỉnh các trường trong `candidateService.js` và `employerService.js` tương ứng.
- `src/services/supabase.js` đã cấu hình `AsyncStorage` và `react-native-url-polyfill`; chỉ việc dùng đúng `supabaseUrl` và `supabaseAnonKey`.
