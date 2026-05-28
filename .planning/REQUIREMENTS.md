# Requirements

**Gathered:** 2026-05-26
**Status:** Scoped

<rules>
- Do not edit this section.
- ID format: REQ-[category]-[number]
- Use these IDs in ROADMAP.md and PLAN.md
</rules>

<reqs>
## Phase 5: Validation & Security
- **REQ-SEC-01**: Tích hợp ASP.NET Core Identity để phân quyền và quản lý tài khoản.
- **REQ-SEC-02**: Xây dựng trang Đăng nhập cho Admin.
- **REQ-SEC-03**: Áp dụng Data Annotations để validate dữ liệu đầu vào trên các Form.

## Phase 6: WebAPI RESTful
- **REQ-API-01**: Cấu hình Controllers cho WebAPI.
- **REQ-API-02**: Định nghĩa các Route, HTTP Methods (GET, POST, PUT, DELETE) cho Post, Category, Product.
- **REQ-API-03**: Đảm bảo API trả về định dạng JSON chuẩn.

## Phase 7: Frontend ReactJS Setup
- **REQ-FE-01**: Khởi tạo dự án React (Vite/CRA) trong `CMS.Frontend`.
- **REQ-FE-02**: Xây dựng các UI Component tĩnh cơ bản (Ví dụ: Card hiển thị bài viết).

## Phase 8: Frontend API Integration
- **REQ-FE-03**: Sử dụng Axios và `useEffect` để gọi API từ `CMS.Backend`.
- **REQ-FE-04**: Hiển thị danh sách bài viết/sản phẩm thực tế từ Database lên ReactJS.

## Phase 9: Routing SPA
- **REQ-FE-05**: Tích hợp `react-router-dom` để điều hướng SPA.
- **REQ-FE-06**: Xây dựng trang chi tiết Bài viết/Sản phẩm nhận tham số ID từ URL.

## Phase 10: gRPC (Advanced)
- **REQ-ADV-01**: Thiết lập gRPC Service trong ASP.NET Core.
- **REQ-ADV-02**: Viết Client gọi gRPC đơn giản.

## Phase 11: Debug & Optimization
- **REQ-OPT-01**: Fix các lỗi giao diện và API.
- **REQ-OPT-02**: Tối ưu SEO cơ bản cho ReactJS.
</reqs>
