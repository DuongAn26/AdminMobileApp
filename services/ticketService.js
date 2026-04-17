// ================================================================
// ticketService.js – Quản lý vé hỗ trợ
// USE_MOCK = true  → dùng dữ liệu giả lập từ mockData.js
// USE_MOCK = false → gọi API thật qua api.js
// ================================================================

// [MOCK] import dữ liệu giả lập
import { MOCK_TICKETS } from '../mockData';

// [API] import client thật — bật khi USE_MOCK = false
// import api from '../api';

// ⚠️ Đổi thành false để kết nối backend thật
const USE_MOCK = true;

/**
 * Lấy danh sách tất cả vé hỗ trợ
 * @returns {Array}
 */
export const getTickets = async () => {
    if (USE_MOCK) {
        // [MOCK] Trả về danh sách vé từ mockData
        await new Promise(r => setTimeout(r, 400));
        return [...MOCK_TICKETS];
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp = await api.get('/Support/tickets');
    // return resp.data;
};

/**
 * Lấy chi tiết một vé theo id
 * @param {string|number} id
 * @returns {Object|null}
 */
export const getTicketById = async (id) => {
    if (USE_MOCK) {
        // [MOCK] Tìm vé theo id trong mock data
        await new Promise(r => setTimeout(r, 300));
        return MOCK_TICKETS.find(t => t.id.toString() === id.toString()) || null;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // const resp   = await api.get('/Support/tickets');
    // const found  = resp.data.find(t => t.id.toString() === id.toString());
    // return found || null;
};

/**
 * Gửi phản hồi admin cho một vé
 * @param {string|number} ticketId
 * @param {string}        message
 */
export const replyTicket = async (ticketId, message) => {
    if (USE_MOCK) {
        // [MOCK] Thêm reply vào mảng mock ticket (ảnh hưởng session hiện tại)
        await new Promise(r => setTimeout(r, 500));
        const ticket = MOCK_TICKETS.find(t => t.id.toString() === ticketId.toString());
        if (ticket) {
            ticket.replies = ticket.replies || [];
            ticket.replies.push({
                id: Date.now(),
                message,
                replierEmail: 'admin@itviec.vn',
            });
            ticket.status = 'closed';
        }
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.post('/Support/tickets/reply', {
    //     ticketId: parseInt(ticketId),
    //     message,
    // });
};

/**
 * Cập nhật trạng thái vé
 * @param {string|number} ticketId
 * @param {'open'|'in_progress'|'closed'} status
 */
export const updateTicketStatus = async (ticketId, status) => {
    if (USE_MOCK) {
        // [MOCK] Cập nhật status trong mảng mock (ảnh hưởng session hiện tại)
        await new Promise(r => setTimeout(r, 300));
        const ticket = MOCK_TICKETS.find(t => t.id.toString() === ticketId.toString());
        if (ticket) ticket.status = status;
        return;
    }

    // [API] Gọi endpoint thật — bỏ comment khi USE_MOCK = false
    // await api.patch(`/Support/tickets/${ticketId}/status`, { status });
};
