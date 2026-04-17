// ================================================================
// MOCK DATA – Admin_FrontEnd
// Được sử dụng khi USE_MOCK = true trong các file services/
// Để kết nối API thật: đặt USE_MOCK = false trong từng service
// ================================================================

// ─── CANDIDATES ─────────────────────────────────────────────────
export const MOCK_CANDIDATES = [
    {
        id: 1,
        fullname: 'Nguyễn Văn An',
        city: 'Hà Nội',
        isActive: true,
        phone: '0901 234 567',
        gender: 'Nam',
        aboutMe: 'Lập trình viên backend 5 năm kinh nghiệm, thành thạo .NET Core và microservices.',
        personalLink: 'https://github.com/nguyenvanan',
        experiences: [
            { jobTitle: 'Senior Backend Developer', companyName: 'FPT Software', description: 'Phát triển hệ thống microservices .NET Core, xử lý 10M+ request/ngày.' },
            { jobTitle: 'Junior Developer', companyName: 'VNG Corp', description: 'Phát triển REST API cho hệ thống thanh toán trực tuyến.' },
        ],
        educations: [
            { major: 'Công nghệ Thông tin', schoolName: 'Đại học Bách Khoa Hà Nội', details: 'Tốt nghiệp 2018 – GPA 3.6/4.0' },
        ],
    },
    {
        id: 2,
        fullname: 'Trần Thị Bích Lan',
        city: 'Hồ Chí Minh',
        isActive: true,
        phone: '0912 345 678',
        gender: 'Nữ',
        aboutMe: 'UI/UX Designer với 3 năm kinh nghiệm thiết kế sản phẩm digital.',
        personalLink: 'https://behance.net/bichlan',
        experiences: [
            { jobTitle: 'UI/UX Designer', companyName: 'Tiki', description: 'Thiết kế giao diện ứng dụng mobile thương mại điện tử.' },
        ],
        educations: [
            { major: 'Thiết kế Đồ họa', schoolName: 'Đại học Mỹ thuật TP.HCM', details: 'Tốt nghiệp 2020' },
        ],
    },
    {
        id: 3,
        fullname: 'Lê Quang Minh',
        city: 'Đà Nẵng',
        isActive: false,
        phone: '0933 456 789',
        gender: 'Nam',
        aboutMe: 'Data Analyst, thành thạo Python, SQL và Power BI.',
        personalLink: null,
        experiences: [
            { jobTitle: 'Data Analyst', companyName: 'Shopee Vietnam', description: 'Phân tích dữ liệu kinh doanh và xây dựng dashboard báo cáo.' },
        ],
        educations: [
            { major: 'Kinh tế – Kỹ thuật số', schoolName: 'Đại học Kinh tế Đà Nẵng', details: 'Tốt nghiệp 2021' },
        ],
    },
    {
        id: 4,
        fullname: 'Phạm Thị Hương',
        city: 'Hà Nội',
        isActive: true,
        phone: '0944 567 890',
        gender: 'Nữ',
        aboutMe: 'Product Manager với nền tảng kỹ thuật phần mềm.',
        personalLink: 'https://linkedin.com/in/phamhuong',
        experiences: [
            { jobTitle: 'Product Manager', companyName: 'Grab Vietnam', description: 'Quản lý lộ trình sản phẩm cho mảng GrabFood.' },
            { jobTitle: 'Software Engineer', companyName: 'Base.vn', description: 'Phát triển tính năng SaaS B2B.' },
        ],
        educations: [
            { major: 'Khoa học Máy tính', schoolName: 'Đại học Quốc gia Hà Nội', details: 'Tốt nghiệp 2017 – Loại Giỏi' },
        ],
    },
    {
        id: 5,
        fullname: 'Võ Đình Khải',
        city: 'Hồ Chí Minh',
        isActive: true,
        phone: '0955 678 901',
        gender: 'Nam',
        aboutMe: 'DevOps Engineer, thành thạo AWS, Docker, Kubernetes.',
        personalLink: 'https://github.com/vodinhkhai',
        experiences: [
            { jobTitle: 'DevOps Engineer', companyName: 'KMS Technology', description: 'Xây dựng CI/CD pipeline và quản lý hạ tầng cloud.' },
        ],
        educations: [
            { major: 'Kỹ thuật Phần mềm', schoolName: 'Đại học Bách Khoa TP.HCM', details: 'Tốt nghiệp 2019' },
        ],
    },
    {
        id: 6,
        fullname: 'Ngô Thị Thanh Tuyền',
        city: 'Hải Phòng',
        isActive: false,
        phone: '0966 789 012',
        gender: 'Nữ',
        aboutMe: 'Business Analyst tại các dự án ERP và CRM lớn.',
        personalLink: null,
        experiences: [
            { jobTitle: 'Business Analyst', companyName: 'TMA Solutions', description: 'Thu thập yêu cầu, phân tích nghiệp vụ, viết tài liệu đặc tả.' },
        ],
        educations: [
            { major: 'Hệ thống Thông tin Quản lý', schoolName: 'Đại học Hải Phòng', details: 'Tốt nghiệp 2020' },
        ],
    },
    {
        id: 7,
        fullname: 'Bùi Văn Toàn',
        city: 'Hà Nội',
        isActive: true,
        phone: '0977 890 123',
        gender: 'Nam',
        aboutMe: 'Mobile Developer (React Native, Flutter) với 4 năm kinh nghiệm.',
        personalLink: 'https://github.com/buivantoan',
        experiences: [
            { jobTitle: 'Mobile Developer', companyName: 'Got It Vietnam', description: 'Phát triển ứng dụng giáo dục cross-platform bằng React Native.' },
        ],
        educations: [
            { major: 'Công nghệ Thông tin', schoolName: 'Học viện Kỹ thuật Quân sự', details: 'Tốt nghiệp 2019' },
        ],
    },
    {
        id: 8,
        fullname: 'Đỗ Ngọc Mai',
        city: 'Hồ Chí Minh',
        isActive: true,
        phone: '0988 901 234',
        gender: 'Nữ',
        aboutMe: 'Frontend Developer đam mê hiệu suất web và thiết kế tương tác.',
        personalLink: 'https://behance.net/dongocmai',
        experiences: [
            { jobTitle: 'Frontend Developer', companyName: 'Momo', description: 'Phát triển tính năng ví điện tử bằng React và TypeScript.' },
        ],
        educations: [
            { major: 'Truyền thông Đa phương tiện', schoolName: 'Đại học Văn Lang', details: 'Tốt nghiệp 2021' },
        ],
    },
];

// ─── EMPLOYERS ──────────────────────────────────────────────────
export const MOCK_EMPLOYERS = [
    {
        id: 1,
        name: 'FPT Software',
        city: 'Hà Nội',
        userEmail: 'hr@fpt.com.vn',
        status: 'approved',
        companyId: 1,
        reason: 'N/A',
    },
    {
        id: 2,
        name: 'Tiki Corporation',
        city: 'Hồ Chí Minh',
        userEmail: 'recruit@tiki.vn',
        status: 'pending',
        companyId: 2,
        reason: 'Đang chờ xác minh giấy phép kinh doanh.',
    },
    {
        id: 3,
        name: 'Shopee Vietnam',
        city: 'Hồ Chí Minh',
        userEmail: 'talent@shopee.vn',
        status: 'approved',
        companyId: 3,
        reason: 'N/A',
    },
    {
        id: 4,
        name: 'Dat Xanh Group',
        city: 'Hồ Chí Minh',
        userEmail: 'hr@datxanh.com.vn',
        status: 'pending',
        companyId: 4,
        reason: 'Chưa cung cấp giấy tờ pháp lý đầy đủ.',
    },
    {
        id: 5,
        name: 'VNG Corporation',
        city: 'Hồ Chí Minh',
        userEmail: 'careers@vng.com.vn',
        status: 'approved',
        companyId: 5,
        reason: 'N/A',
    },
    {
        id: 6,
        name: 'Lotus Pharma',
        city: 'Hà Nội',
        userEmail: 'admin@lotuspharma.vn',
        status: 'rejected',
        companyId: 6,
        reason: 'Giấy phép kinh doanh hết hạn.',
    },
    {
        id: 7,
        name: 'Dragon Capital',
        city: 'Hồ Chí Minh',
        userEmail: 'hr@dragoncapital.vn',
        status: 'banned',
        companyId: 7,
        reason: 'Vi phạm điều khoản sử dụng nền tảng.',
    },
];

// ─── TICKETS ────────────────────────────────────────────────────
export const MOCK_TICKETS = [
    {
        id: 1,
        subject: 'Không thể đăng nhập vào tài khoản',
        message: 'Tôi đã thử nhiều lần nhưng hệ thống vẫn báo sai mật khẩu, mặc dù tôi chắc chắn đã nhập đúng. Vui lòng hỗ trợ khẩn!',
        userEmail: 'nguyenvanan@gmail.com',
        status: 'open',
        replies: [],
    },
    {
        id: 2,
        subject: 'Hồ sơ không hiển thị cho nhà tuyển dụng',
        message: 'Tôi đã hoàn thành 100% hồ sơ nhưng nhà tuyển dụng nói không thấy hồ sơ của tôi trong kết quả tìm kiếm.',
        userEmail: 'bichlan.design@gmail.com',
        status: 'open',
        replies: [
            { id: 10, message: 'Chúng tôi đã kiểm tra và phát hiện tài khoản của bạn chưa được xác minh email. Vui lòng kiểm tra hộp thư.', replierEmail: 'admin@itviec.vn' },
        ],
    },
    {
        id: 3,
        subject: 'Yêu cầu xóa tài khoản',
        message: 'Tôi muốn xóa hoàn toàn tài khoản và tất cả dữ liệu cá nhân khỏi hệ thống theo quy định GDPR.',
        userEmail: 'lequangminh@gmail.com',
        status: 'closed',
        replies: [
            { id: 11, message: 'Yêu cầu của bạn đã được xử lý. Tài khoản và dữ liệu đã được xóa vĩnh viễn.', replierEmail: 'admin@itviec.vn' },
        ],
    },
    {
        id: 4,
        subject: 'Lỗi thanh toán gói Premium',
        message: 'Tôi đã bị trừ tiền nhưng tài khoản vẫn dùng gói Free. Mã giao dịch: TX-2026041201.',
        userEmail: 'hr@tiki.vn',
        status: 'open',
        replies: [],
    },
    {
        id: 5,
        subject: 'Không nhận được email xác nhận',
        message: 'Đã đăng ký tài khoản từ 3 ngày trước nhưng chưa nhận được email xác minh, kể cả trong spam.',
        userEmail: 'dongocmai@gmail.com',
        status: 'closed',
        replies: [
            { id: 12, message: 'Chúng tôi đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư đến.', replierEmail: 'admin@itviec.vn' },
            { id: 13, message: 'Đã nhận được, cảm ơn!', replierEmail: 'dongocmai@gmail.com' },
        ],
    },
];

// ─── AUTH ────────────────────────────────────────────────────────
// Tài khoản admin giả lập
export const MOCK_ADMIN = {
    email: 'admin@itviec.vn',
    password: 'Admin@123',
    token: 'mock-jwt-token-admin-2026',
    role: 'admin',
};
