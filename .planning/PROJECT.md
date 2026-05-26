# [CMS] ASP.NET Core & ReactJS Full-stack CMS

## What This Is
Hệ thống quản trị nội dung (CMS) và Website bán hàng tích hợp tin tức, sử dụng kiến trúc 3 lớp: Data (EF Core), Backend (ASP.NET Core MVC/WebAPI), và Frontend (ReactJS).

## Core Value
Cung cấp một nền tảng đầy đủ từ CSDL, API đến giao diện người dùng, hỗ trợ quản lý sản phẩm, bài viết, đơn hàng và khách hàng.

## Requirements

### Validated
- ✓ [Buổi 1] Khởi tạo dự án, thiết lập Solution 3 lớp và các Entity (Category, Post, User, Product, Customer, Order, OrderDetail).
- ✓ [Buổi 2] Kết nối CSDL SQL Server, cấu hình EF Core và chạy Migration thành công.
- ✓ [Buổi 3] Truy vấn LINQ, các hàm xử lý dữ liệu cơ bản.
- ✓ [Buổi 4] Xây dựng giao diện Quản trị (Admin) bằng ASP.NET Core MVC (Controller, View, HTML Helpers).

### Active
- [ ] [Buổi 5] Validation & ASP.NET Core Identity (Phân quyền, đăng nhập Admin).
- [ ] [Buổi 6] Xây dựng WebAPI RESTful Service (Cung cấp dữ liệu cho ReactJS).
- [ ] [Buổi 7] Thiết lập Frontend ReactJS và Component cơ bản.
- [ ] [Buổi 8] Tích hợp Axios gọi API từ Backend hiển thị lên giao diện ReactJS.
- [ ] [Buổi 9] Điều hướng SPA bằng React Router Dom.
- [ ] [Buổi 10] Tích hợp gRPC Service (Nâng cao).
- [ ] [Buổi 11] Hoàn thiện ứng dụng, Debug và tối ưu SEO.

### Out of Scope
- [TBA] Các tính năng không nằm trong tài liệu hướng dẫn.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sử dụng ASP.NET Core MVC cho Admin | Giúp quản trị viên quản lý dữ liệu nhanh chóng với Razor Views | ✓ Đã hoàn thành (Buổi 4) |
| Sử dụng ReactJS cho Frontend | Tách biệt giao diện người dùng, ứng dụng SPA mượt mà | Đang chờ thực hiện |
| Sử dụng SQL Server + EF Core | Lưu trữ dữ liệu cấu trúc tốt, dễ quản lý Migration | ✓ Đã hoàn thành (Buổi 2) |

## Evolution
This document evolves at phase transitions and milestone boundaries.
