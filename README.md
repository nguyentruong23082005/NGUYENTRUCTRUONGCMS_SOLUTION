# NGUYÊN TRÚC TRƯỜNG - ĐỒ ÁN CMS FULL-STACK BÁN HÀNG TÍCH HỢP TIN TỨC

Dự án này là hệ thống Quản trị nội dung (CMS) và Bán hàng hoàn chỉnh tích hợp tin tức, được thiết kế và xây dựng theo kiến trúc phân lớp chuyên nghiệp sử dụng .NET 8.0, ASP.NET Core MVC, WebAPI, Entity Framework Core và ReactJS.

---

## 🛠 Công nghệ sử dụng
*   **Database**: Microsoft SQL Server
*   **Data Access**: Entity Framework Core (Code First Migration)
*   **Backend API/MVC**: ASP.NET Core (.NET 8.0)
*   **Security**: Cookie-based Authentication & Phân quyền hệ thống (Admin / Editor)
*   **Frontend**: ReactJS (Vite, TailwindCSS)

---

## 🏗 Kiến trúc dự án (3 lớp)
Giải pháp được tổ chức thành 3 Project độc lập:
1.  **CMS.Data (Class Library)**: Lớp truy cập dữ liệu, định nghĩa thực thể (Entities), cấu hình Fluent API, Global Query Filter (Soft Delete), và quản lý Migration.
2.  **CMS.Backend (ASP.NET Core MVC & WebAPI)**: Lớp ứng dụng quản trị (Admin Panel MVC) và cung cấp các RESTful WebAPI cho Frontend.
3.  **CMS.Frontend (ReactJS SPA)**: Ứng dụng client-side viết bằng ReactJS kết nối qua WebAPI để phục vụ người xem tin tức và mua hàng.

---

## 📁 Chi tiết nội dung các buổi học (Syllabus)

### Buổi 1: Khởi tạo cấu trúc đồ án & Thiết kế Thực thể (Entities)
*   **Mục tiêu**: Thiết lập cấu trúc Solution 3 lớp và định nghĩa các thực thể dữ liệu ban đầu.
*   **Nội dung thực hiện**:
    *   Tạo Blank Solution chứa 3 dự án độc lập: `CMS.Data`, `CMS.Backend`, và `CMS.Frontend` (ReactJS).
    *   Tham chiếu liên kết: `CMS.Backend` tham chiếu đến `CMS.Data`.
    *   Thiết kế 8 Class thực thể cốt lõi trong thư mục `Entities`:
        1.  `Category`: Danh mục tin tức (Id, Name, Description, Posts).
        2.  `Post`: Bài viết tin tức (Id, Title, Content, ImageUrl, CreatedDate, CategoryId).
        3.  `User`: Người dùng quản trị (Id, Username, PasswordHash, FullName, Role).
        4.  `CategoryProduct`: Danh mục sản phẩm (Id, Name, Description, Products).
        5.  `Product`: Thông tin sản phẩm (Id, Name, Description, Price, StockQuantity, ImageUrl, CategoryProductId).
        6.  `Customer`: Khách hàng mua hàng (Id, FullName, Email, Phone, Address, Password, Orders).
        7.  `Order`: Đơn hàng (Id, OrderDate, CustomerId, Status, Notes, OrderDetails).
        8.  `OrderDetail`: Chi tiết đơn hàng (Id, OrderId, ProductId, Quantity, UnitPrice).

### Buổi 2: Kết nối Cơ sở dữ liệu với Entity Framework Core
*   **Mục tiêu**: Cài đặt EF Core, thiết lập DbContext và thực hiện Code First Migration sinh cơ sở dữ liệu.
*   **Nội dung thực hiện**:
    *   Cài đặt các gói thư viện NuGet cần thiết:
        *   `Microsoft.EntityFrameworkCore.SqlServer`
        *   `Microsoft.EntityFrameworkCore.Tools`
    *   Xây dựng lớp `ApplicationDbContext` kế thừa từ `DbContext` để đăng ký các `DbSet` thực thể.
    *   Cấu hình chuỗi kết nối (Connection String) SQL Server trong file `appsettings.json`.
    *   Thực hiện chạy các lệnh Package Manager Console để sinh CSDL tự động:
        *   `Add-Migration InitialCreate`
        *   `Update-Database`

### Buổi 3: Truy vấn LINQ & Thao tác dữ liệu chuyên sâu (CRUD)
*   **Mục tiêu**: Thành thạo các hàm xử lý dữ liệu và viết logic nghiệp vụ.
*   **Nội dung thực hiện**:
    *   Viết truy vấn LINQ sử dụng các hàm lọc dữ liệu (`Where`), sắp xếp (`OrderBy`/`OrderByDescending`), và tìm kiếm (`FirstOrDefault`).
    *   Áp dụng kỹ thuật **Eager Loading** sử dụng phương thức `.Include()` để JOIN dữ liệu bảng (ví dụ: Load thông tin Category đi kèm trong Post).
    *   Xây dựng hoàn chỉnh luồng xử lý Thêm - Xóa - Sửa cho Danh mục (`Category`) và Bài viết (`Post`).
    *   Phân biệt luồng xử lý phương thức `GET` (hiển thị trang nhập liệu) và `POST` (nhận dữ liệu từ form và ghi xuống database thông qua `SaveChanges`).

### Buổi 4: Xây dựng giao diện quản trị (Admin Panel MVC)
*   **Mục tiêu**: Tạo trang giao diện Razor View và Sidebar điều hướng phân chia Layout quản trị.
*   **Nội dung thực hiện**:
    *   Thiết lập file Layout chung chuyên biệt dành riêng cho quản trị viên: `_LayoutAdmin.cshtml`.
    *   Sử dụng Bootstrap chia khung giao diện:
        *   Cột trái (`col-md-3`): Sidebar điều hướng nhanh các trang quản lý.
        *   Cột phải (`col-md-9`): Phần hiển thị nội dung động qua `@RenderBody()`.
    *   Thiết kế Dashboard trang chủ quản trị: hiển thị thống kê tổng quan số lượng bài viết, thành viên, và sản phẩm.
    *   Hoàn thiện các trang danh sách và form biểu mẫu CRUD cho `Category`, `Post`, và `User`.

### Buổi 5: Bảo mật & Phân quyền hệ thống (Security & Identity)
*   **Mục tiêu**: Triển khai cơ chế xác thực người dùng và phân chia vai trò quản trị.
*   **Nội dung thực hiện**:
    *   Cấu hình dịch vụ xác thực Cookie (`CookieAuthentication`) trong file `Program.cs`.
    *   Thiết lập ràng buộc kiểm tra đăng nhập trên các Controller quản trị bằng thẻ bảo mật `[Authorize]`.
    *   Triển khai phân quyền truy cập theo vai trò (Role-based Authorization) giữa `Admin` và `Editor`.
    *   Xây dựng Controller và giao diện trang đăng nhập/đăng xuất cho quản trị viên.
    *   Thực hiện băm mật khẩu bảo mật (Password Hashing) thay vì lưu mật khẩu thô để đảm bảo an toàn thông tin.

### Buổi 6: Xây dựng WebAPI RESTful Service (WebAPI RESTful)
*   **Mục tiêu**: Xây dựng hệ thống RESTful WebAPI phục vụ cho ứng dụng Single Page Application (ReactJS) cùng cơ chế xác thực và bảo mật nâng cao.
*   **Nội dung thực hiện**:
    *   Cấu hình cơ chế xác thực JWT Bearer trong `Program.cs` kết hợp với sự kiện `OnTokenValidated` để kiểm tra phiên bản token (`TokenVersion`) nhằm hỗ trợ thu hồi token từ xa (Token Revocation) khi khách hàng đăng xuất hoặc đổi mật khẩu.
    *   Xây dựng các API nghiệp vụ chính:
        *   `CustomersController`: Đăng ký, đăng nhập, lấy thông tin cá nhân và đăng xuất an toàn.
        *   `CustomerAddressesController`: Quản lý sổ địa chỉ CRUD và tự động thiết lập địa chỉ mặc định duy nhất.
        *   `VouchersController`: Kiểm tra và xác thực tính hợp lệ của mã giảm giá (5 điều kiện bao gồm hạn dùng, giá trị đơn tối thiểu, trạng thái hoạt động, và lịch sử sử dụng).
        *   `OrdersController`: Quản lý đặt hàng, lịch sử đơn hàng và yêu cầu hủy đơn hàng.
        *   `ReviewsController`: Xử lý đánh giá sản phẩm có ràng buộc mua hàng và chống spam.
    *   Tối ưu hóa tranh chấp tồn kho bằng cơ chế khóa bi quan (Pessimistic Locking) trong SQL Server sử dụng chỉ dẫn `UPDLOCK, ROWLOCK`.
    *   Cấu hình Swagger tự động xử lý JWT Bearer Scheme và viết bộ kiểm thử tự động (Unit Tests) với EF Core InMemory Database.

### Buổi 7: Thiết lập Frontend ReactJS & Giao diện tĩnh Phúc Long (ReactJS Setup)
*   **Mục tiêu**: Khởi tạo dự án ReactJS (Vite) và thiết kế hệ thống giao diện, các thành phần giao diện tĩnh mô phỏng thương hiệu Phúc Long.
*   **Nội dung thực hiện**:
    *   Khởi tạo dự án ReactJS với Vite trong thư mục `CMS.Frontend`, gỡ bỏ gói Shopify Polaris và cài đặt các thư viện bổ sung (`react-router-dom`, `axios`).
    *   Thiết lập CSS Hệ thống giao diện (Design System) Phúc Long trong `index.css` định nghĩa các biến màu chủ đạo (`#006F3C` - xanh lá đậm, `#0C713D` - xanh hover, `#B71C1C` - đỏ nhấn, `#ECEFF1` - xám nhạt) và các quy tắc typography (Arimo, Roboto).
    *   Xây dựng cấu trúc định tuyến SPA với `react-router-dom` qua các trang trống: Trang chủ, Thực đơn, Giỏ hàng, Thanh toán, Đăng nhập, Đăng ký, Cá nhân, Cửa hàng.
    *   Thiết lập quản lý trạng thái toàn cục bằng Context API:
        *   `CartContext`: Quản lý giỏ hàng (thêm, sửa số lượng, xóa) và lưu trữ giỏ hàng trong `localStorage`.
        *   `AuthContext`: Quản lý trạng thái đăng nhập và thông tin người dùng.
    *   Xây dựng các UI Components tĩnh cốt lõi cho Trang chủ: Header, Footer, HeroBanner, CategoryMenu, ProductCard, StoreLocator, PostGrid.

### Buổi 8: Tích hợp API & Kết nối Frontend với Backend WebAPI (API Integration)
*   **Mục tiêu**: Kết nối ứng dụng ReactJS với hệ thống WebAPI để xử lý dữ liệu động thực tế từ cơ sở dữ liệu.
*   **Nội dung thực hiện**:
    *   Cấu hình biến môi trường `.env` (`VITE_API_URL`) và khởi tạo Axios Client tự động đính kèm token JWT vào header `Authorization` cho các yêu cầu bảo mật.
    *   Xây dựng các dịch vụ API frontend (`authApi`, `productApi`, `categoryApi`, `orderApi`, `storeApi`, `voucherApi`, v.v.) gọi trực tiếp đến các Endpoint tương ứng trên Backend.
    *   Phát triển các custom hooks (`useAuth`, `useCart`, `useProducts`, `useOrders`, v.v.) để đóng gói logic tương tác dữ liệu và quản lý trạng thái tải.
    *   Thay thế toàn bộ dữ liệu mockup bằng dữ liệu thực tế từ Database trên các trang: Menu, Chi tiết sản phẩm (hiển thị tùy chọn size, toppings, đánh giá), Giỏ hàng (đồng bộ giỏ hàng, áp dụng Voucher), Thanh toán (chọn địa chỉ giao hàng, phương thức thanh toán, tạo đơn hàng), Cá nhân (lịch sử đơn hàng, sổ địa chỉ) và Danh sách cửa hàng.
    *   Cập nhật cơ sở dữ liệu và API Backend: bổ sung liên kết danh mục cha (Parent Category) và ảnh danh mục, hỗ trợ tải ảnh sản phẩm lên thư mục Server.

### Buổi 9: Bản đồ Cửa hàng, Khôi phục Mật khẩu & Quản lý nâng cao (Advanced Features & Integration)
*   **Mục tiêu**: Tích hợp bản đồ trực quan, hệ thống gửi email khôi phục mật khẩu, quản lý địa chỉ nâng cao và viết bộ kiểm thử tự động.
*   **Nội dung thực hiện**:
    *   **Bản đồ & Định vị (Leaflet Map & Geolocation)**: Tích hợp bản đồ Leaflet tương tác, hiển thị danh sách cửa hàng Phúc Long trên bản đồ, tự động định vị vị trí người dùng (`useGeolocation`) và vẽ tuyến đường ngắn nhất từ vị trí người dùng đến cửa hàng (`useRouting`).
    *   **Khôi phục mật khẩu qua Email (Forgot/Reset Password)**: Thiết lập dịch vụ gửi Email qua SMTP (`EmailService`) ở Backend, xây dựng luồng khôi phục mật khẩu bảo mật qua mã xác thực (Reset Password Token), hoàn thiện giao diện Forgot Password và Reset Password ở Frontend.
    *   **Quản lý địa chỉ & Bản đồ hành chính nâng cao**: Tích hợp bộ dropdown Tỉnh/Thành - Quận/Huyện - Phường/Xã cho cả trang Admin (Quản lý cửa hàng) và Client (Trang cá nhân & Thanh toán), tích hợp thư viện `addressMapper` xử lý đồng bộ địa chỉ cũ/mới của TP.HCM (Quận 2, 9, Thủ Đức cũ sáp nhập thành TP. Thủ Đức).
    *   **Quản lý hình ảnh**: Xây dựng `ImageUploadHelper` hỗ trợ tải ảnh danh mục, sản phẩm trực tiếp lên Server Backend.
    *   **Kiểm thử phần mềm (Unit Testing)**: Xây dựng dự án `CMS.Backend.Tests` triển khai các ca kiểm thử tự động (Unit Test) cho các dịch vụ nghiệp vụ chính.

---

## 🚀 Hướng dẫn khởi chạy dự án

### 1. Cài đặt môi trường phát triển
Yêu cầu hệ thống cần cài đặt:
1.  **Visual Studio 2022** (Có tích chọn workload *ASP.NET and web development* và *.NET desktop development*).
2.  **Microsoft SQL Server** (Bản Express hoặc LocalDB).
3.  **SQL Server Management Studio (SSMS)** để quản lý CSDL trực quan.
4.  **Node.js (LTS)** để chạy ứng dụng ReactJS Frontend.

### 2. Cấu hình Chuỗi kết nối CSDL (Connection String)
Mở file `appsettings.json` trong dự án `CMS.Backend` và điều chỉnh cấu hình kết nối SQL Server của bạn:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=NGUYENTRUCTRUONG_DB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

### 3. Đồng bộ hóa Database
Chạy lệnh sau tại thư mục gốc của giải pháp bằng Command Prompt hoặc PowerShell để khởi tạo CSDL:
```powershell
dotnet ef database update --project CMS.Data --startup-project CMS.Backend
```

### 4. Khởi chạy Backend (Admin Panel MVC)
```powershell
dotnet run --project CMS.Backend
```
*   Ứng dụng Backend chạy mặc định tại cổng: `http://localhost:5000` (hoặc cổng được cấu hình).
*   Trang quản trị admin: truy cập trực tiếp bằng đường dẫn `/Category`, `/Post` hoặc `/User` để đăng nhập.

### 5. Khởi chạy Frontend (ReactJS)
Mở Terminal tại thư mục `CMS.Frontend`:
```powershell
cd CMS.Frontend
npm install
npm run dev
```
*   Trang chủ ReactJS sẽ chạy tại: `http://localhost:5173` (hoặc cổng mặc định của Vite).
