# NGUYENTRUCTRUONG CMS Solution

Hệ thống **CMS + bán hàng Phúc Long clone** gồm Admin MVC, REST API và React SPA. Dự án dùng ASP.NET Core .NET 8, Entity Framework Core, SQL Server và React Vite để quản lý sản phẩm, danh mục, bài viết, khách hàng, giỏ hàng, đơn hàng, voucher, đánh giá, cửa hàng và bản đồ.

---

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend MVC/API | ASP.NET Core 8.0 |
| ORM | Entity Framework Core 8 |
| Database | Microsoft SQL Server / LocalDB |
| Authentication | Cookie Auth cho Admin, JWT Bearer cho API khách hàng |
| API Docs | Swagger / Swashbuckle |
| Frontend | React 18 + Vite 6 |
| Routing | React Router DOM |
| HTTP Client | Axios |
| Map | Leaflet + React Leaflet |
| Test | xUnit, EF Core InMemory, coverlet |

---

## 2. Kiến trúc tổng quan

Solution được chia thành các project chính:

| Project | Vai trò |
|---|---|
| `CMS.Data` | Entity, DbContext, migration, cấu hình quan hệ dữ liệu |
| `CMS.Backend` | Admin MVC, REST API, service nghiệp vụ, upload ảnh, JWT/Cookie auth |
| `CMS.Backend.Tests` | Unit test cho backend service/API logic |
| `CMS.Frontend` | React SPA cho khách hàng: trang chủ, menu, giỏ hàng, checkout, profile, cửa hàng |

Luồng chính:

```txt
React SPA -> Axios API Client -> ASP.NET Core API -> Service Layer -> EF Core -> SQL Server
Admin MVC -> Controller/View -> Service/DbContext -> SQL Server
```

---

## 3. Cấu trúc thư mục

```txt
NguyenTrucTruong_Solution/
├── CMS.Backend/                     # ASP.NET Core MVC + WebAPI
│   ├── Controllers/                 # Controller MVC quản trị và Controller API
│   │   └── Api/                     # REST API cho React frontend
│   ├── Helpers/                     # Helper upload ảnh, xử lý file, tiện ích backend
│   ├── Models/                      # ViewModel, DTO, request/response models
│   │   ├── Api/                     # ApiResponse, query model
│   │   ├── Dtos/                    # DTO trả về cho API
│   │   └── ViewModels/              # ViewModel cho MVC Admin
│   ├── Services/                    # Service nghiệp vụ backend
│   │   └── Api/                     # Service phục vụ REST API
│   ├── Views/                       # Razor Views cho Admin MVC
│   ├── wwwroot/                     # Static files, ảnh upload, css/js admin
│   ├── Program.cs                   # Cấu hình DI, Auth, Swagger, MVC/API pipeline
│   └── appsettings.json             # Connection string và cấu hình backend
│
├── CMS.Data/                        # Class Library dữ liệu
│   ├── Configurations/              # Fluent API configurations
│   ├── Entities/                    # Entity: Product, Order, Customer, Voucher, Store...
│   ├── Migrations/                  # EF Core migrations
│   └── ApplicationDbContext.cs      # DbContext chính
│
├── CMS.Backend.Tests/               # Unit tests backend
│   └── *.cs                         # Test service/API bằng xUnit + InMemory DB
│
├── CMS.Frontend/                    # React Vite SPA
│   ├── public/                      # Static assets public
│   ├── src/
│   │   ├── api/                     # Axios clients theo module
│   │   ├── assets/                  # Ảnh, icon, tài nguyên frontend
│   │   ├── components/              # Component dùng lại
│   │   │   ├── common/              # Loading, EmptyState, modal, ScrollToTop...
│   │   │   ├── home/                # Hero, category menu, newest/best sellers
│   │   │   ├── layout/              # Header, Footer, ClientLayout
│   │   │   ├── product/             # ProductCard, QuickOrderModal
│   │   │   ├── store/               # Store locator, Leaflet map
│   │   │   └── order/               # Order list/detail components
│   │   ├── context/                 # AuthContext, CartContext
│   │   ├── hooks/                   # Custom hooks: products, orders, geolocation...
│   │   ├── pages/                   # Page-level routes
│   │   ├── services/                # Service gọi API nghiệp vụ
│   │   ├── utils/                   # Helper format, constants, product option logic
│   │   ├── App.jsx                  # Router chính
│   │   └── main.jsx                 # Entry point React
│   ├── package.json                 # npm scripts/dependencies
│   └── vite.config.js               # Vite config
│
├── scripts/                         # Script hỗ trợ dữ liệu/tự động hóa
├── NGUYENTRUCTRUONGCMS_SOLUTION.sln # Visual Studio solution
└── README.md                        # Tài liệu dự án
```

---

## 4. Chức năng chính

### Admin MVC

- Đăng nhập/đăng xuất quản trị bằng Cookie Authentication.
- Phân quyền quản trị theo role.
- Quản lý bài viết và danh mục bài viết.
- Quản lý sản phẩm, danh mục sản phẩm, ảnh sản phẩm.
- Quản lý option group/option value: size, topping, đường, đá, trà.
- Quản lý đơn hàng, chi tiết đơn hàng, trạng thái đơn hàng.
- Quản lý khách hàng, địa chỉ khách hàng, đánh giá.
- Quản lý voucher, banner, cửa hàng, tồn kho.

### Frontend React

- Trang chủ phong cách Phúc Long.
- Menu sản phẩm có phân trang, lọc, tìm kiếm.
- Chi tiết sản phẩm với option size/topping/đường/đá.
- Logic size giống Phúc Long thật: size hiện tại `0 đ`, size khác là chênh lệch `+...đ` hoặc `-...đ` theo backend.
- Popup đặt mua nhanh từ card sản phẩm.
- Giỏ hàng, checkout, áp dụng voucher.
- Đăng ký, đăng nhập, profile, lịch sử đơn hàng.
- Sổ địa chỉ và chọn địa chỉ giao hàng.
- Danh sách cửa hàng, bản đồ Leaflet, định vị người dùng.
- Forgot password / reset password qua email.

---

## 5. REST API hiện có

> Base URL mặc định tùy cấu hình backend, ví dụ: `https://localhost:xxxx` hoặc `http://localhost:5000`.
>
> Frontend cấu hình bằng biến môi trường `VITE_API_URL`.

### Banner

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/banners` | Lấy banner đang active |

### Customer Auth/Profile

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/customers/register` | Đăng ký khách hàng |
| POST | `/api/customers/login` | Đăng nhập khách hàng, nhận JWT |
| GET | `/api/customers/profile` | Lấy thông tin cá nhân |
| PUT | `/api/customers/profile` | Cập nhật thông tin cá nhân |
| POST | `/api/customers/logout` | Đăng xuất / thu hồi token |
| POST | `/api/customers/forgot-password` | Gửi yêu cầu quên mật khẩu |
| POST | `/api/customers/reset-password` | Đặt lại mật khẩu |

### Customer Addresses

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/customers/addresses` | Lấy danh sách địa chỉ |
| GET | `/api/customers/addresses/{id}` | Lấy chi tiết địa chỉ |
| POST | `/api/customers/addresses` | Tạo địa chỉ mới |
| PUT | `/api/customers/addresses/{id}` | Cập nhật địa chỉ |
| DELETE | `/api/customers/addresses/{id}` | Xóa địa chỉ |
| POST | `/api/customers/addresses/{id}/set-default` | Đặt địa chỉ mặc định |

### Orders

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/orders` | Đặt hàng |
| GET | `/api/orders` | Lấy lịch sử đơn hàng của khách hàng |
| GET | `/api/orders/{id}` | Lấy chi tiết đơn hàng |
| POST | `/api/orders/{id}/cancel` | Hủy đơn hàng |

### Products

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/products` | Lấy danh sách sản phẩm phân trang/lọc/sắp xếp |
| GET | `/api/products/search?q=...` | Tìm kiếm sản phẩm |
| GET | `/api/products/{id}` | Lấy chi tiết sản phẩm theo id |
| GET | `/api/products/by-slug/{slug}` | Lấy chi tiết sản phẩm theo slug |
| GET | `/api/products/newest?count=5` | Lấy sản phẩm mới nhất |
| GET | `/api/products/best-sellers?count=3` | Lấy sản phẩm bán chạy |

Query phổ biến của `/api/products`:

| Query | Ý nghĩa |
|---|---|
| `page` | Trang hiện tại |
| `pageSize` | Số item mỗi trang |
| `categoryId` | Lọc theo id danh mục |
| `categorySlug` | Lọc theo slug danh mục |
| `keyword` | Từ khóa tìm kiếm |
| `minPrice`, `maxPrice` | Lọc khoảng giá |
| `sortBy`, `sortOrder` | Sắp xếp |

### Product Categories

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/product-categories` | Lấy danh sách danh mục sản phẩm |
| GET | `/api/product-categories/tree` | Lấy cây danh mục sản phẩm |

### Posts

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/posts` | Lấy danh sách bài viết phân trang |
| GET | `/api/posts/{id}` | Lấy chi tiết bài viết theo id |
| GET | `/api/posts/by-slug/{slug}` | Lấy chi tiết bài viết theo slug |

### Post Categories

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/post-categories` | Lấy danh mục bài viết |
| GET | `/api/post-categories/tree` | Lấy cây danh mục bài viết |

### Reviews

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/products/{productId}/reviews` | Lấy đánh giá của sản phẩm |
| POST | `/api/reviews` | Tạo đánh giá sản phẩm |

### Stores

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/stores` | Lấy danh sách cửa hàng |

### Vouchers

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/vouchers` | Lấy voucher khả dụng |
| GET | `/api/vouchers/validate?code=...` | Kiểm tra mã voucher |

---

## 6. API Admin MVC / Upload đáng chú ý

Các controller MVC trong `CMS.Backend/Controllers` phục vụ trang quản trị:

- `AccountController`: đăng nhập/đăng xuất admin.
- `CategoryController`, `PostController`: quản lý tin tức.
- `ProductCategoryController`, `ProductController`: quản lý sản phẩm.
- `OptionGroupController`, `OptionValueController`: quản lý option sản phẩm.
- `OrderController`, `OrderDetailController`: quản lý đơn hàng.
- `CustomerController`, `CustomerAddressController`: quản lý khách hàng/địa chỉ.
- `VoucherController`, `BannerController`, `StoreController`, `StockController`, `ReviewController`, `UserController`.

Endpoint upload CKEditor:

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/upload/ckeditor` | Upload ảnh cho CKEditor |

---

## 7. Cài đặt và chạy dự án

### Yêu cầu môi trường

- .NET SDK 8.0
- Visual Studio 2022 hoặc Rider/VS Code
- SQL Server hoặc SQL Server LocalDB
- Node.js LTS
- npm

### Backend

Cấu hình connection string trong `CMS.Backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=NGUYENTRUCTRUONG_DB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

Chạy migration/database:

```powershell
dotnet ef database update --project CMS.Data --startup-project CMS.Backend
```

Chạy backend:

```powershell
dotnet run --project CMS.Backend
```

Swagger thường nằm tại:

```txt
/swagger
```

### Frontend

Tạo file `.env` trong `CMS.Frontend` nếu cần:

```env
VITE_API_URL=https://localhost:xxxx/api
```

Cài package và chạy dev:

```powershell
cd CMS.Frontend
npm install
npm run dev
```

Build production:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

---

## 8. Lệnh thường dùng

| Lệnh | Thư mục chạy | Mô tả |
|---|---|---|
| `dotnet restore` | root | Restore NuGet packages |
| `dotnet build` | root | Build toàn bộ solution |
| `dotnet test` | root | Chạy unit test backend |
| `dotnet run --project CMS.Backend` | root | Chạy backend MVC/API |
| `npm install` | `CMS.Frontend` | Cài dependencies frontend |
| `npm run dev` | `CMS.Frontend` | Chạy React dev server |
| `npm run build` | `CMS.Frontend` | Build frontend production |
| `npm run lint` | `CMS.Frontend` | Kiểm tra lint frontend |

---

## 9. Ghi chú bảo mật

- Không commit connection string thật, SMTP password, JWT secret hoặc API key.
- JWT dùng cho API khách hàng; Cookie Auth dùng cho Admin MVC.
- Các endpoint cần đăng nhập phải gửi header:

```txt
Authorization: Bearer <access_token>
```

- Voucher, đặt hàng, đánh giá cần validate phía backend, không tin dữ liệu từ frontend.
- Tồn kho khi đặt hàng cần xử lý trong transaction để tránh bán quá số lượng.

---

## 10. Tiến độ theo buổi

| Buổi | Nội dung chính |
|---|---|
| Buổi 1 | Khởi tạo solution 3 lớp, entity cơ bản |
| Buổi 2 | EF Core, DbContext, migration, SQL Server |
| Buổi 3 | LINQ, CRUD, eager loading |
| Buổi 4 | Admin MVC layout, dashboard, CRUD quản trị |
| Buổi 5 | Cookie Auth, phân quyền Admin/Editor |
| Buổi 6 | REST API, JWT, order/voucher/review/customer APIs |
| Buổi 7 | React Vite, layout Phúc Long, Context API |
| Buổi 8 | Tích hợp frontend với backend API, checkout/profile/menu |
| Buổi 9 | Leaflet map, forgot/reset password, địa chỉ nâng cao, quick order, logic size giống Phúc Long |

---

## 11. Tác giả

- Sinh viên: **Nguyễn Trúc Trường**
- Repository: `nguyentruong23082005/NGUYENTRUCTRUONGCMS_SOLUTION`
