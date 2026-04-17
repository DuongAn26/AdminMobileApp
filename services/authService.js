// ================================================================
// authService.js – Xác thực đăng nhập
// USE_MOCK = true  → dùng tài khoản giả lập từ mockData.js
// USE_MOCK = false → gọi API thật qua api.js
// ================================================================

// [MOCK] import dữ liệu giả lập
import { MOCK_ADMIN } from '../mockData';

// [API] import client thật — bật khi USE_MOCK = false
// import api from '../api';

// ⚠️ Đổi thành false để kết nối backend thật
const USE_MOCK = true;

/**
 * Đăng nhập admin
 * @returns {{ token: string, role: string }}
 */
export const login = async (email, password) => {
    if (USE_MOCK) {
        // [MOCK] Kiểm tra thông tin đăng nhập giả lập
        //        Chấp nhận bất kỳ email/password hợp lệ (không rỗng) với role admin
        await new Promise(r => setTimeout(r, 600)); // giả lập độ trễ mạng
        if (!email.trim() || !password.trim()) {
            throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
        }
        // Giả lập: tài khoản không phải admin
        if (email === 'user@gmail.com') {
            return { role: 'user', token: '' };
        }
        // Mọi tài khoản khác đều được coi là admin trong mock mode
        return { role: 'admin', token: MOCK_ADMIN.token };
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.post('/Auth/login', { email, password });
    // const role  = resp.data.Role  || resp.data.role;
    // const token = resp.data.Token || resp.data.token;
    // return { role, token };
};
