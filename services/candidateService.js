// ================================================================
// candidateService.js – Quản lý ứng viên
// USE_MOCK = true  → dùng dữ liệu giả lập từ mockData.js
// USE_MOCK = false → gọi API thật qua api.js
// ================================================================

// [MOCK] import dữ liệu giả lập
import { MOCK_CANDIDATES } from '../mockData';

// [API] import client thật — bật khi USE_MOCK = false
// import api from '../api';

// ⚠️ Đổi thành false để kết nối backend thật
const USE_MOCK = true;

/**
 * Lấy danh sách ứng viên
 * @returns {Array}
 */
export const getCandidates = async () => {
    if (USE_MOCK) {
        // [MOCK] Trả về danh sách ứng viên từ mockData
        await new Promise(r => setTimeout(r, 400));
        return [...MOCK_CANDIDATES];
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.get('/Candidates?page=1&pageSize=50');
    // return resp.data;
};

/**
 * Lấy chi tiết một ứng viên theo id
 * @param {string|number} id
 * @returns {Object|null}
 */
export const getCandidateById = async (id) => {
    if (USE_MOCK) {
        // [MOCK] Tìm ứng viên theo id trong mock data
        await new Promise(r => setTimeout(r, 300));
        return MOCK_CANDIDATES.find(c => c.id.toString() === id.toString()) || null;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.get(`/Candidates/${id}`);
    // return resp.data;
};

/**
 * Bật/tắt trạng thái ứng viên (active ↔ inactive)
 * @param {string|number} id
 */
export const toggleCandidateStatus = async (id) => {
    if (USE_MOCK) {
        // [MOCK] Đảo isActive trong mảng mock (ảnh hưởng session hiện tại)
        await new Promise(r => setTimeout(r, 400));
        const candidate = MOCK_CANDIDATES.find(c => c.id.toString() === id.toString());
        if (candidate) candidate.isActive = !candidate.isActive;
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.post(`/Candidates/${id}/toggle-status`);
};

/**
 * Tạo ứng viên mới
 * @param {{ Fullname, Email, Password, JobTitle, ExperienceYears }} payload
 */
export const createCandidate = async (payload) => {
    if (USE_MOCK) {
        // [MOCK] Giả lập thêm ứng viên mới (không persist sau khi reload)
        await new Promise(r => setTimeout(r, 500));
        const newCandidate = {
            id: Date.now(),
            fullname: payload.Fullname,
            city: null,
            isActive: true,
            phone: null,
            gender: null,
            aboutMe: null,
            personalLink: null,
            experiences: [],
            educations: [],
        };
        MOCK_CANDIDATES.push(newCandidate);
        return newCandidate;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.post('/Candidates', payload);
    // return resp.data;
};

/**
 * Xóa ứng viên
 * @param {string|number} id
 */
export const deleteCandidate = async (id) => {
    if (USE_MOCK) {
        // [MOCK] Xóa ứng viên khỏi mảng mock theo id
        await new Promise(r => setTimeout(r, 400));
        const idx = MOCK_CANDIDATES.findIndex(c => c.id.toString() === id.toString());
        if (idx !== -1) MOCK_CANDIDATES.splice(idx, 1);
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.delete(`/Candidates/${id}`);
};
