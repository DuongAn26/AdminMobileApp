// ================================================================
// employerService.js – Quản lý nhà tuyển dụng
// USE_MOCK = true  → dùng dữ liệu giả lập từ mockData.js
// USE_MOCK = false → gọi API thật qua api.js
// ================================================================

// [MOCK] import dữ liệu giả lập
import { MOCK_EMPLOYERS } from '../mockData';

// [API] import client thật — bật khi USE_MOCK = false
// import api from '../api';

// ⚠️ Đổi thành false để kết nối backend thật
const USE_MOCK = true;

/**
 * Lấy danh sách nhà tuyển dụng
 * @returns {Array}
 */
export const getEmployers = async () => {
    if (USE_MOCK) {
        // [MOCK] Trả về danh sách nhà tuyển dụng từ mockData
        await new Promise(r => setTimeout(r, 400));
        return [...MOCK_EMPLOYERS];
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.get('/Employers');
    // return resp.data;
};

/**
 * Lấy chi tiết nhà tuyển dụng theo id (dùng companyId)
 * @param {string|number} id
 * @returns {Object|null}
 */
export const getEmployerById = async (id) => {
    if (USE_MOCK) {
        // [MOCK] Tìm nhà tuyển dụng theo companyId trong mock data
        await new Promise(r => setTimeout(r, 300));
        return MOCK_EMPLOYERS.find(e => e.companyId.toString() === id.toString()) || null;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.get('/Employers/reports');
    // const list  = resp.data;
    // return list.find(t => t.companyId.toString() === id.toString()) || null;
};

/**
 * Duyệt nhà tuyển dụng
 * @param {string|number} id
 */
export const approveEmployer = async (companyId) => {
    if (USE_MOCK) {
        // [MOCK] Cập nhật status theo companyId (khớp với route param truyền vào)
        await new Promise(r => setTimeout(r, 400));
        const employer = MOCK_EMPLOYERS.find(e => e.companyId.toString() === companyId.toString());
        if (employer) employer.status = 'approved';
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.post(`/Employers/${companyId}/approve`);
};

/**
 * Từ chối nhà tuyển dụng
 * @param {string|number} id
 */
export const rejectEmployer = async (companyId) => {
    if (USE_MOCK) {
        // [MOCK] Cập nhật status theo companyId (khớp với route param truyền vào)
        await new Promise(r => setTimeout(r, 400));
        const employer = MOCK_EMPLOYERS.find(e => e.companyId.toString() === companyId.toString());
        if (employer) employer.status = 'rejected';
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.post(`/Employers/${companyId}/reject`);
};

/**
 * Xóa nhà tuyển dụng
 * @param {string|number} companyId
 */
export const deleteEmployer = async (companyId) => {
    if (USE_MOCK) {
        // [MOCK] Xóa nhà tuyển dụng khỏi mảng mock theo companyId
        await new Promise(r => setTimeout(r, 400));
        const idx = MOCK_EMPLOYERS.findIndex(e => e.companyId.toString() === companyId.toString());
        if (idx !== -1) MOCK_EMPLOYERS.splice(idx, 1);
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.delete(`/Employers/${companyId}`);
};
