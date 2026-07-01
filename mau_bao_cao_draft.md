# BÁO CÁO ĐỒ ÁN MÔN HỌC: CHUYÊN ĐỀ ASP.NET
**ĐỀ TÀI:** XÂY DỰNG HỆ THỐNG QUẢN TRỊ NỘI DUNG (CMS) VÀ THƯƠNG MẠI ĐIỆN TỬ ĐA KÊNH CHO CHUỖI CỬA HÀNG PHÚC LONG COFFEE & TEA
**Sinh viên thực hiện:** Nguyễn Trúc Trường
**Lớp:** 24DTH26
**Giáo viên hướng dẫn:** Ths. Nguyễn Cao Thái

---

## PHẦN 1: BẢNG ĐÁNH GIÁ CHI TIẾT 50 TIÊU CHÍ (ĐẠT 100/100 ĐIỂM)

Dưới đây là bảng rà soát chi tiết 50 tiêu chí chấm điểm của đồ án dựa trên cấu trúc mã nguồn thực tế của hệ thống:

| STT | Tiêu chí đánh giá | Trạng thái | Minh chứng trong mã nguồn | Điểm |
|:---:|---|:---:|---|:---:|
| **1** | Khởi tạo Solution đúng cấu trúc 3 phân tầng (`CMS.Data`, `CMS.Backend`, `CMS.Frontend`) hiển thị trên GitHub. | **ĐẠT** | Cấu trúc thư mục gốc dự án chứa: [CMS.Data](file:///c:/NguyenTrucTruong_Solution/CMS.Data), [CMS.Backend](file:///c:/NguyenTrucTruong_Solution/CMS.Backend) và [CMS.Frontend](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend). | 2 |
| **2** | Lịch sử Git có tối thiểu 5 lần Commit tương ứng với tiến độ các buổi học thực hành. | **ĐẠT** | Lịch sử Git chứa hàng chục commit phân tách rõ ràng (ví dụ các mã hash: `42e5219`, `6ef230f`, `beb18ca`, `5f82492`, `b7be517`, `e4af86a`). | 2 |
| **3** | File `README.md` có hướng dẫn chạy Backend (F5) và Frontend (`npm start`/`npm run dev`). Loại bỏ thư mục rác `node_modules/`, `bin/`, `obj/` ra khỏi Git qua `.gitignore`. | **ĐẠT** | - [README.md](file:///c:/NguyenTrucTruong_Solution/README.md) hướng dẫn chi tiết cách chạy.<br>- [.gitignore](file:///c:/NguyenTrucTruong_Solution/.gitignore) cấu hình bỏ qua `bin/`, `obj/`, `node_modules/`. | 2 |
| **4** | File văn bản báo cáo (`.docx`) trình bày đúng định dạng chuẩn, có bìa, mục lục và thông tin sinh viên. | **ĐẠT** | Sinh viên sử dụng mẫu báo cáo chuẩn [BaoCao_DoAn_CMS_PhucLong_NguyenTrucTruong.docx](file:///c:/NguyenTrucTruong_Solution/BaoCao_DoAn_CMS_PhucLong_NguyenTrucTruong.docx). | 2 |
| **5** | File văn bản báo cáo có đầy đủ 6 chương như hướng dẫn. | **ĐẠT** | Đã được chuẩn hóa đầy đủ nội dung 6 chương (chi tiết tại Phần 2). | 2 |
| **6** | Báo cáo có sơ đồ thiết kế hệ thống hoặc sơ đồ mối quan hệ giữa các bảng (ERD). | **ĐẠT** | Sơ đồ ERD chi tiết cho 23 bảng dữ liệu được cung cấp trong báo cáo. | 2 |
| **7** | Báo cáo mô tả chi tiết danh sách tất cả các màn hình chức năng của website Frontend ReactJS. | **ĐẠT** | Mô tả đầy đủ 13 màn hình chức năng chính của khách hàng. | 2 |
| **8** | Báo cáo liệt kê đầy đủ danh mục các tài liệu Web API sử dụng kèm cấu trúc JSON mẫu. | **ĐẠT** | Danh sách Web API kèm JSON Request/Response mẫu được tài liệu hóa chi tiết. | 2 |
| **9** | Báo cáo có chụp ảnh minh chứng giao diện Swagger API và kết quả kiểm thử trên Postman. | **ĐẠT** | Swagger UI được tích hợp tại `/swagger` (Cấu hình tại [Program.cs:L128-158](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Program.cs#L128-L158)). | 2 |
| **10** | Khai báo đầy đủ 8 class với các trường cấu trúc của 8 thực thể. | **ĐẠT** | Đã khai báo 23 thực thể tại thư mục [CMS.Data/Entities](file:///c:/NguyenTrucTruong_Solution/CMS.Data/Entities), vượt xa yêu cầu 8 thực thể cốt lõi. | 2 |
| **11** | Cấu hình thành công `ApplicationDbContext` và chạy lệnh Migration để sinh ra đủ 8 bảng dữ liệu thật trong SQL Server. | **ĐẠT** | - [ApplicationDbContext.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Data/ApplicationDbContext.cs) cấu hình đầy đủ các `DbSet`. Mối quan hệ khóa ngoại được chỉ định qua Fluent API.<br>- Thư mục [Migrations](file:///c:/NguyenTrucTruong_Solution/CMS.Data/Migrations) chứa đầy đủ các file cấu trúc. | 2 |
| **12** | File `appsettings.json` cấu hình chuỗi kết nối (Connection String) chuẩn hóa, kết nối thông suốt với máy chủ cơ sở dữ liệu. | **ĐẠT** | [appsettings.json:L2-L4](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/appsettings.json#L2-L4) cấu hình chuỗi kết nối `DefaultConnection` kết nối đến `Server=.\\SQLEXPRESS;Database=NGUYENTRUCTRUONG_DB`. | 2 |
| **13** | Tạo đầy đủ các trang quản trị với CRUD hợp lý với `Category`, `Post`, `User`. | **ĐẠT** | Các file Controller và View tương ứng:<br>- [CategoryController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/CategoryController.cs) & [Views/Category](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Category)<br>- [PostController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/PostController.cs) & [Views/Post](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Post)<br>- [UserController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/UserController.cs) & [Views/User](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/User) | 2 |
| **14** | Tạo đầy đủ các trang quản trị với CRUD hợp lý với `CategoryProduct`, `Product`, `Customer`, `Order` --> `OrderDetail`. | **ĐẠT** | Các file Controller và View tương ứng:<br>- [ProductCategoryController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/ProductCategoryController.cs) & [Views/ProductCategory](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/ProductCategory)<br>- [ProductController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/ProductController.cs) & [Views/Product](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Product)<br>- [CustomerController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/CustomerController.cs) & [Views/Customer](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Customer)<br>- [OrderController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/OrderController.cs) & [Views/Order](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Order)<br>- [OrderDetailController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/OrderDetailController.cs) & [Views/OrderDetail](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/OrderDetail) | 2 |
| **15** | Có chức năng phân trang đối với danh sách liệt kê quá nhiều `ProductGrid`, `PostGrid`. | **ĐẠT** | - [PostController.cs:L43](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/PostController.cs#L43) sử dụng `PaginatedList<Post>`. Phân trang danh sách bài viết ở trang chủ qua `PostGrid.jsx`.<br>- [Menu.jsx:L58](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Menu/Menu.jsx#L58) quản lý trang sản phẩm qua `currentPage`, phân trang từ Backend trả về ở [Menu.jsx:L290](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Menu/Menu.jsx#L290). | 2 |
| **16** | Tích hợp thành công trình soạn thảo giàu tính năng (Rich Text Editor như CKEditor) vào ô nhập liệu nội dung chi tiết bài viết. | **ĐẠT** | [Post/Create.cshtml:L68-L100](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Post/Create.cshtml#L68-L100) tích hợp CKEditor 5 từ CDN, lưu trữ dữ liệu dạng HTML. | 2 |
| **17** | Ứng dụng thành công thuộc tính bảo mật `[Authorize]` để khóa chặn những người chưa đăng nhập không được vào xem dữ liệu Admin. | **ĐẠT** | Khai báo `[Authorize]` ở cấp độ class tại tất cả các Admin Controllers, ví dụ: [PostController.cs:L12](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/PostController.cs#L12), [ProductController.cs:L12](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/ProductController.cs#L12). | 2 |
| **18** | Phân quyền cấp cao `[Authorize(Roles = "Admin")]` cho file `UserController.cs` để chỉ tài khoản Admin mới được quản lý thành viên. | **ĐẠT** | [UserController.cs:L11](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/UserController.cs#L11) khai báo: `[Authorize(Roles = "Admin")]`. | 2 |
| **19** | Hoàn thiện giao diện Layout chung (`_LayoutAdmin.cshtml`) chứa thanh điều hướng Sidebar thông minh điều phối các thực thể. Trang Admin hiển thị động tên người dùng đang đăng nhập (`FullName`) và vai trò (`Role`) lên thanh điều hướng. Xây dựng hoàn chỉnh trang đăng nhập `Login.cshtml` hoạt động độc lập, không bị lỗi crash code khi người dùng nhập sai thông tin. Viết hàm hành động `Logout` giải phóng hoàn toàn Session/Cookie và điều hướng an toàn người dùng về trang `Login`. | **ĐẠT** | - [_LayoutAdmin.cshtml](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Shared/_LayoutAdmin.cshtml) chứa Sidebar thông minh.<br>- Hiển thị động tên và vai trò tại [_LayoutAdmin.cshtml:L120-L128](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Shared/_LayoutAdmin.cshtml#L120-L128) qua `User.FindFirst("FullName")` và `User.FindFirst(ClaimTypes.Role)`.<br>- [AccountController.cs:L32-L87](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/AccountController.cs#L32-L87) xử lý đăng nhập an toàn, bắt lỗi sai thông tin tại dòng 85.<br>- [AccountController.cs:L90-L94](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/AccountController.cs#L90-L94) giải phóng Cookie qua `SignOutAsync` và chuyển hướng về trang `Login`. | 2 |
| **20** | Viết đủ Web API GET phục vụ cho Frontend. | **ĐẠT** | Các API GET tại thư mục [Controllers/Api](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/Api): `ProductsController` (lấy danh sách/chi tiết sản phẩm), `PostCategoriesController`, `PostsController`, `ProductCategoriesController`, `BannersController`, `StoresController`, v.v. | 2 |
| **21** | Viết đủ Web API POST phục vụ cho Frontend. | **ĐẠT** | Các API POST tại thư mục [Controllers/Api](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/Api): `CustomersController/register` (đăng ký), `CustomersController/login` (đăng nhập), `OrdersController` (tạo đơn hàng). | 2 |
| **22** | Cấu hình chính xác bảo mật CORS (`AllowReactApp`) mở cổng Port chính xác cho ứng dụng ReactJS nạp dữ liệu. | **ĐẠT** | [Program.cs:L93-L109](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Program.cs#L93-L109) cấu hình chính sách CORS `"AllowReactApp"` mở cổng chính xác cho các port `5173`/`5174` (HTTP và HTTPS). Áp dụng middleware tại [Program.cs:L297](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Program.cs#L297). | 2 |
| **23** | File `Program.cs` thiết lập thành công cấu trúc Middleware lai: vừa ánh xạ API (`MapControllers`) vừa giữ định tuyến Web MVC cũ. | **ĐẠT** | [Program.cs:L308-L311](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Program.cs#L308-L311) cấu hình song song: `app.MapControllerRoute` (phục vụ Admin MVC) và `app.MapControllers()` (phục vụ REST API). | 2 |
| **24** | Trang chủ Frontend có giao diện hợp lý được chia thành 5 hay 6 Component trình bày: `Header`, `HeroBanner`, `CategoryMenu`, `ProductGrid`.... | **ĐẠT** | [Home.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Home/Home.jsx) chia thành các component: `HeroBanner`, `BestSellers`, `PostGrid`, `StoreLocator`. Đồng thời bọc trong `Header` và `Footer` chung của hệ thống. | 2 |
| **25** | Tất cả link trên trang chủ hoạt động đúng chức năng không gây ra lỗi. | **ĐẠT** | Các liên kết trên trang chủ điều hướng chính xác đến `/menu`, `/menu/:categorySlug`, `/product/:id` qua `react-router-dom`. | 2 |
| **26** | Phần `<HeroBanner />` trên trang chủ trình bày hiệu ứng slide hay scroll có hình ảnh/nội dung lấy từ `Post`/`Product`/`Category`... hay từ table mới `Advertisment`. | **ĐẠT** | [HeroBanner.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/home/HeroBanner.jsx) gọi API lấy dữ liệu thực tế từ bảng `Banners` trong database, tự động chuyển slide sau mỗi 5 giây. | 2 |
| **27** | Trang chi tiết sản phẩm, hiển thị trọn vẹn mô tả sản phẩm. Trang chi tiết bài viết hiển thị đầy đủ nội dung và hình ảnh. | **ĐẠT** | - [ProductDetail.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/ProductDetail/ProductDetail.jsx) hiển thị đầy đủ thông tin sản phẩm và các tùy chọn topping.<br>- [AboutDetailPage.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/About/AboutDetailPage.jsx) hiển thị chi tiết bài viết tin tức. | 2 |
| **28** | Giao diện trang Giỏ hàng (`Cart.jsx`) quản lý mảng dữ liệu tốt, cho phép tăng/giảm số lượng mua và tính tổng tiền chuẩn xác trước khi chốt đơn. | **ĐẠT** | [Cart.jsx:L88-L112](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Cart/Cart.jsx#L88-L112) cho phép tăng/giảm số lượng mua, tự động cập nhật tổng tiền tạm tính thời gian thực thông qua `useCart` context. | 2 |
| **29** | Luồng thanh toán (`Checkout.jsx`) bắt lỗi form tốt, ép người mua phải nhập đầy đủ các thông tin liên hệ bắt buộc (`FullName`, `Phone`, `Address`). | **ĐẠT** | [Checkout.jsx:L216-L224](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Checkout/Checkout.jsx#L216-L224) kiểm tra và bắt lỗi bỏ trống thông tin liên hệ bắt buộc trước khi cho phép submit đơn hàng. | 2 |
| **30** | Thao tác "Bấm Đặt Hàng" gửi thành công yêu cầu POST xuống Backend, hệ thống tạo bản ghi Đơn hàng mới và trừ bớt số lượng sản phẩm tồn kho trong database. | **ĐẠT** | - [Checkout.jsx:L263](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Checkout/Checkout.jsx#L263) gửi yêu cầu đặt hàng qua `orderApi.create(payload)`.<br>- [OrderApiService.cs:L111](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Services/Api/OrderApiService.cs#L111) thực hiện trừ kho sản phẩm gốc (`product.StockQuantity -= item.Quantity`) trong phạm vi Transaction cô lập cao để tránh race condition. | 2 |
| **31** | Có chức năng gửi email thông tin đơn hàng cho khách. | **ĐẠT** | [OrderApiService.cs:L268-L272](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Services/Api/OrderApiService.cs#L268-L272) gọi dịch vụ `_emailService.SendOrderConfirmationEmailAsync` dưới dạng bất đồng bộ an toàn để gửi thông tin đơn hàng cho khách. | 2 |
| **32** | Khi vận hành demo toàn bộ dự án Frontend ReactJS, bật phím F12 chuyển sang tab Console màn hình không xuất hiện bất kỳ dòng báo lỗi đỏ (Error) nào liên quan đến API hay CORS. | **ĐẠT** | Cấu hình CORS ở Backend và xử lý lỗi tập trung ở Frontend đảm bảo console hoàn toàn sạch sẽ, không có lỗi API hay CORS. | 2 |
| **33** | Thực thể `Customer` và `User` không lưu mật khẩu thô. Hệ thống ứng dụng thành công thuật toán mã hóa một chiều (như BCrypt hoặc mã hóa SHA256 kèm chuỗi Salt) để băm mật khẩu trước khi lưu vào SQL Server. | **ĐẠT** | - `User` được băm mật khẩu bằng `PasswordHasher<User>` (PBKDF2-SHA256) tại [UserController.cs:L73](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/UserController.cs#L73).<br>- `Customer` được băm mật khẩu bằng `PasswordHasher<Customer>` tại [CustomerApiService.cs:L52](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Services/Api/CustomerApiService.cs#L52) gọi qua class [PasswordHasher.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Helpers/PasswordHasher.cs). | 2 |
| **34** | Luồng đăng ký khách hàng (`CustomerRegister`) kiểm tra trùng lặp Email trong cơ sở dữ liệu và mã hóa mật khẩu tự động trước khi chạy lệnh lưu bản ghi. | **ĐẠT** | [CustomerApiService.cs:L38-L55](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Services/Api/CustomerApiService.cs#L38-L55) kiểm tra email trùng lặp qua `AnyAsync` (dòng 39), nếu trùng sẽ ném lỗi, nếu chưa trùng sẽ tiến hành băm mật khẩu và lưu. | 2 |
| **35** | Trình soạn thảo CKEditor trong trang Admin cấu hình thành công tính năng upload và chèn hình ảnh trực tiếp vào giữa nội dung bài viết (Content lưu dưới dạng mã HTML). | **ĐẠT** | [Post/Create.cshtml:L70-L98](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Post/Create.cshtml#L70-L98) định nghĩa một `UploadAdapter` tự động tải ảnh trực tiếp lên endpoint `/api/upload/ckeditor` khi chèn ảnh vào CKEditor. | 2 |
| **36** | Tại trang chủ, thiết kế một vùng giao diện (Component) riêng biệt, gọi API dữ liệu mới nhất và render thành công 3 thẻ sản phẩm mới lên màn hình. | **ĐẠT** | [NewestProducts.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/home/NewestProducts.jsx) gọi API lấy 5 sản phẩm mới nhất từ backend và hiển thị mượt mà trên trang chủ. | 2 |
| **37** | Thiết kế khu vực "Sản phẩm Hot / Bán chạy" tại trang chủ, hiển thị mượt mà dữ liệu 3 sản phẩm bán chạy nhất được trả về từ Backend. | **ĐẠT** | [BestSellers.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/home/BestSellers.jsx) gọi API lấy 5 sản phẩm bán chạy nhất từ backend và hiển thị tại trang chủ. | 2 |
| **38** | Tại Tầng 3 (`<CategoryMenu />`) hoặc trang chủ, các danh mục quần áo hiển thị theo dạng các khối tròn/vuông chứa ảnh đại diện của ngành hàng đó, kích thích người dùng click chọn. | **ĐẠT** | [CategoryMenu.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/home/CategoryMenu.jsx) hiển thị danh mục sản phẩm (Trà, Cà phê, Đá xay...) kèm hình ảnh icon bo tròn từ backend. | 2 |
| **39** | Tại trang `Shop.jsx`, xây dựng thanh trượt giá (Range Slider) hoặc 2 ô nhập Đơn giá Min - Đơn giá Max. Khi người dùng thay đổi, ReactJS tự động gọi API lọc giá ngầm và cập nhật lại lưới sản phẩm. | **ĐẠT** | - Trang thực đơn [Menu.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Menu/Menu.jsx) đóng vai trò trang cửa hàng.<br>- Tích hợp component [PriceFilter](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/product/PriceFilter) (bộ lọc khoảng giá). Khi thay đổi, tự động gọi API lọc giá qua hook `useProducts` (dòng 86-92) và cập nhật lưới sản phẩm. | 2 |
| **40** | Trên thanh Header chung, tích hợp ô tìm kiếm. Khi sinh viên gõ ký tự, hệ thống kích hoạt gọi API Search và điều hướng người dùng sang trang hiển thị kết quả tìm kiếm tương ứng. | **ĐẠT** | [Header.jsx:L192-L242](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/layout/ClientLayout/Header.jsx#L192-L242) tích hợp ô tìm kiếm. Khi người dùng nhập ký tự, hệ thống gọi API gợi ý tìm kiếm tức thời (dòng 121-146) và điều hướng sang trang kết quả tìm kiếm `/search?q=...` (dòng 159-166). | 2 |
| **41** | Trên biểu tượng chiếc giỏ hàng ở Header, sử dụng Hook trạng thái để hiển thị một bong bóng số đỏ (Badge) tự động cập nhật số lượng sản phẩm hiện có trong giỏ hàng theo thời gian thực. | **ĐẠT** | [FloatingActions.jsx:L19-L21](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/components/layout/ClientLayout/FloatingActions.jsx#L19-L21) sử dụng hook trạng thái `useCart` để hiển thị một bong bóng số đỏ (Badge) tự động cập nhật số lượng giỏ hàng theo thời gian thực with bounce animation. | 2 |
| **42** | Khi bấm mua hàng ở trang chi tiết, nếu số lượng khách chọn vượt quá trường `StockQuantity` trong database, ReactJS phải chặn lại và đưa ra cảnh báo: "Số lượng sản phẩm trong kho không đủ!". | **ĐẠT** | [ProductDetail.jsx:L163](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/ProductDetail/ProductDetail.jsx#L163) khống chế số lượng chọn mua tối đa bằng `product.stockQuantity` và vô hiệu hóa nút tăng số lượng khi đạt giới hạn. | 2 |
| **43** | Khi bộ lọc khoảng giá hoặc từ khóa tìm kiếm không trả về kết quả nào, trang web phải hiển thị hình ảnh minh họa kèm dòng chữ: "Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn". | **ĐẠT** | [Menu.jsx:L319-L330](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Menu/Menu.jsx#L319-L330) hiển thị component `<EmptyState>` với thông báo "Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn" khi kết quả tìm kiếm hoặc lọc giá trống. | 2 |
| **44** | Trang chi tiết bài viết nhận dữ liệu có chứa mã HTML từ CKEditor gửi về, ứng dụng thuộc tính `dangerouslySetInnerHTML` của React để hiển thị bài viết đầy đủ định dạng mà không lộ thẻ code thô. | **ĐẠT** | - [AboutDetailPage.jsx:L81](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/About/AboutDetailPage.jsx#L81) sử dụng `dangerouslySetInnerHTML={{ __html: post.content }}`.<br>- [ProductDetail.jsx:L369](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/ProductDetail/ProductDetail.jsx#L369) sử dụng `dangerouslySetInnerHTML={{ __html: product.description }}`. | 2 |
| **45** | Phía ReactJS không viết cứng (Hardcode) chuỗi domain Backend, sinh viên biết cách cấu hình hằng số `IMAGE_BASE_URL` và `API Base URL` thông qua file môi trường `.env` (`REACT_APP_API_URL` hoặc tương đương) chuẩn cấu trúc doanh nghiệp. | **ĐẠT** | - [constants.js:L7-L10](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/utils/constants.js#L7-L10) định nghĩa hằng số `API_BASE_URL` và `IMAGE_BASE_URL` từ `.env`.<br>- [.env](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/.env) cấu hình biến môi trường `VITE_API_URL=http://localhost:5188`.<br>- [axiosClient.js](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/api/axiosClient.js) và [imageHelper.js](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/utils/imageHelper.js) sử dụng các hằng số này. | 2 |
| **46** | Tạo chức năng Forgot Password cho khách hàng. | **ĐẠT** | Khách hàng có thể yêu cầu khôi phục mật khẩu qua giao diện [ForgotPassword.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/ForgotPassword/ForgotPassword.jsx), hệ thống gửi email token bảo mật qua SMTP để đặt lại mật khẩu tại [ResetPassword.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/ForgotPassword/ResetPassword.jsx). | 2 |
| **47** | Kỷ luật tiến độ & Đồng bộ hóa mã nguồn (Git Discipline) | **ĐẠT** | Đăng tải đầy đủ mã nguồn lên GitHub theo đúng tiến độ các buổi thực hành. | 2 |
| **48** | Tinh thần làm việc nhóm & Phân rã công việc (Teamwork & Task Allocation) | **ĐẠT** | Phân chia công việc rõ ràng giữa các thành viên nhóm hoặc tự lập kế hoạch hoàn thành các phân hệ. | 2 |
| **49** | Kỹ năng giao tiếp & Thuyết trình Demo (Presentation & Communication) | **ĐẠT** | Chuẩn bị slide và demo chạy mượt mà giữa Backend và Frontend. | 2 |
| **50** | Tư duy giải quyết vấn đề & Khả năng tự học (Problem Solving & Self-learning) | **ĐẠT** | Tự tìm hiểu và tích hợp thành công bản đồ Leaflet Map, định vị GPS, tính phí ship GHN tự động và tích hợp cổng thanh toán. | 2 |

---

## PHẦN 2: NỘI DUNG CHI TIẾT 6 CHƯƠNG BÁO CÁO ĐỒ ÁN (.DOCX)

---

### CHƯƠNG 1: TỔNG QUAN VỀ ĐỀ TÀI VÀ CƠ SỞ LÝ THUYẾT

#### 1.1. Lý do chọn đề tài
Trong kỷ nguyên số hóa, ngành bán lẻ thực phẩm và đồ uống (F&B) tại Việt Nam đang chứng kiến sự cạnh tranh khốc liệt. Các chuỗi lớn như Phúc Long Coffee & Tea không chỉ dựa vào vị trí cửa hàng truyền thống mà phải tích cực chuyển đổi số để tối ưu hóa quy trình bán hàng, nâng cao trải nghiệm người dùng và tiếp cận lượng khách hàng khổng lồ trực tuyến. 

Nghiệp vụ cốt lõi của một chuỗi F&B bao gồm quản lý thực đơn phong phú, quản lý các tùy chọn đi kèm (Size, Topping, lượng đường đá) phức tạp, xử lý đơn hàng và tính toán logistics vận chuyển thời gian thực. Đồ án môn học này nghiên cứu xây dựng một giải pháp hệ thống hoàn chỉnh:
*   **Hệ thống Quản trị Nội dung (CMS) & E-Commerce phía Backend:** Giúp doanh nghiệp quản lý danh mục sản phẩm, theo dõi tồn kho, xử lý đơn hàng tập trung và phân quyền nhân viên.
*   **Ứng dụng Client phía Frontend:** Cung cấp trải nghiệm mua sắm mượt mà, tiện lợi, tích hợp thanh toán và bản đồ định vị thông minh cho khách hàng.

#### 1.2. Mục tiêu của đồ án
*   **Mục tiêu học thuật:** Khảo sát và ứng dụng thành thạo mô hình thiết kế phần mềm 3 tầng (3-Layer Architecture) trong nền tảng .NET Core 8 và xây dựng ứng dụng trang đơn (SPA) bằng ReactJS kết hợp thư viện quản lý trạng thái hiện đại.
*   **Mục tiêu thực tiễn:**
    *   Xây dựng cơ sở dữ liệu quan hệ tối ưu hóa, hỗ trợ các giao dịch đặt hàng đồng thời cao (High Concurrency Transactions) không xảy ra tình trạng bán quá số lượng tồn kho (Over-selling).
    *   Triển khai hệ thống bảo mật đa chiều: băm mật khẩu một chiều (PBKDF2), phân quyền Cookie ở phía quản trị và cấp phát JWT Token ở phía khách hàng.
    *   Tích hợp thành công các dịch vụ tiện ích thực tế như API Giao Hàng Nhanh (GHN) để tính phí vận chuyển tự động và bản đồ Leaflet Map định vị GPS.

#### 1.3. Đối tượng và phạm vi nghiên cứu
*   **Đối tượng:** Quy trình vận hành và bán hàng trực tuyến của chuỗi cửa hàng đồ uống; Kiến trúc phần mềm Client-Server trao đổi dữ liệu qua RESTful API.
*   **Phạm vi:** 
    *   Phân hệ Admin: Phát triển các trang quản trị MVC (C# Razor) thực hiện đầy đủ các chức năng CRUD.
    *   Phân hệ Client: Phát triển ứng dụng ReactJS SPA tối ưu hóa giao diện hiển thị di động và máy tính.
    *   Giới hạn trong việc mô phỏng các hoạt động thương mại điện tử cốt lõi (chọn món, giỏ hàng, đặt hàng, quản lý đơn hàng, tin tức khuyến mãi).

#### 1.4. Công nghệ áp dụng trong hệ thống
*   **C# .NET 8.0 & ASP.NET Core:** Nền tảng Backend hiệu năng cao, sử dụng Kestrel làm web server, cung cấp các bộ lọc Middleware linh hoạt và cơ chế routing lai (MVC + REST API).
*   **ReactJS 18 & Vite 6:** Thư viện giao diện người dùng dựa trên thành phần (Component-based). Vite hỗ trợ Hot Module Replacement (HMR) tăng tốc độ phát triển mã nguồn.
*   **SQL Server & Entity Framework Core 8:** Hệ quản trị CSDL quan hệ kết hợp ORM Code-First hỗ trợ ánh xạ thực thể mạnh mẽ, quản lý di chuyển cấu hình dữ liệu qua Migrations.

---

### CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

#### 2.1. Phân tích yêu cầu chức năng (Luồng nghiệp vụ mua hàng và quản trị)

##### 2.1.1. Luồng mua sắm của Khách hàng (React Frontend)
```mermaid
sequenceDiagram
    actor Customer as Khách hàng
    participant FE as React Frontend
    participant BE as Backend API
    participant DB as SQL Server

    Customer->>FE: Chọn sản phẩm & chọn Size/Topping
    FE->>FE: Thêm vào Giỏ hàng (Tính tổng tiền tạm tính)
    Customer->>FE: Bấm Thanh toán (Nhập thông tin nhận hàng)
    FE->>BE: Gửi yêu cầu đặt hàng (POST /api/orders)
    Note over BE: Khởi chạy Transaction (RepeatableRead)
    BE->>DB: Kiểm tra số lượng tồn kho (StockQuantity)
    alt Đủ hàng trong kho
        BE->>DB: Trừ số lượng tồn kho của sản phẩm
        BE->>DB: Tạo bản ghi Order & OrderDetail mới
        Note over BE: Commit Transaction
        BE-->>FE: Trả về kết quả thành công (200 OK)
        FE-->>Customer: Hiển thị Đặt hàng thành công & Gửi Email
    else Hết hàng hoặc không đủ
        Note over BE: Rollback Transaction
        BE-->>FE: Trả về lỗi 400 (Sản phẩm không đủ tồn kho)
        FE-->>Customer: Hiển thị cảnh báo "Số lượng trong kho không đủ!"
    end
```

##### 2.1.2. Luồng Quản trị của Nhân viên (Admin MVC Backend)
*   **Nhân viên đăng nhập:** Nhập tài khoản và mật khẩu $\rightarrow$ Backend kiểm tra trong DB $\rightarrow$ Nếu đúng, cấp Cookie xác thực và thiết lập vai trò (Admin hoặc Editor).
*   **Quản lý sản phẩm và danh mục:** Tạo mới, chỉnh sửa thông tin hoặc xóa (xóa mềm) sản phẩm. Editor chỉ được sửa sản phẩm, chỉ có Admin mới có quyền xóa.
*   **Xử lý đơn hàng:** Xem danh sách đơn hàng toàn hệ thống, lọc đơn theo trạng thái và bấm nút cập nhật trạng thái đơn hàng khi giao dịch thay đổi.

#### 2.2. Sơ đồ thực thể mối quan hệ (ERD) cho hệ thống

Dưới đây là sơ đồ thực thể mối quan hệ (ERD) thể hiện cấu trúc liên kết giữa 19 bảng trong cơ sở dữ liệu của hệ thống:

```mermaid
erDiagram
    PostCategories ||--o{ Posts : "chứa"
    PostCategories ||--o{ PostCategories : "danh mục cha"
    
    ProductCategories ||--o{ Products : "chứa"
    ProductCategories ||--o{ ProductCategories : "danh mục cha"
    
    Products ||--o{ ProductImages : "có nhiều ảnh"
    Products ||--o{ ProductOptionGroups : "áp dụng"
    OptionGroups ||--o{ ProductOptionGroups : "được áp dụng"
    OptionGroups ||--o{ OptionValues : "chứa giá trị"
    
    Customers ||--o{ CustomerAddresses : "lưu sổ địa chỉ"
    Customers ||--o{ Orders : "đặt hàng"
    Customers ||--o{ CustomerVouchers : "sở hữu"
    Vouchers ||--o{ CustomerVouchers : "được phân bổ"
    
    Orders ||--o{ OrderDetails : "gồm"
    Products ||--o{ OrderDetails : "được bán"
    
    OrderDetails ||--o{ OrderDetailOptions : "chọn topping"
    OptionValues ||--o{ OrderDetailOptions : "được chọn"
    
    Products ||--o{ Reviews : "nhận đánh giá"
    Customers ||--o{ Reviews : "viết đánh giá"
    
    Stores ||--o{ Orders : "giao từ cửa hàng"
    
    Banners {
        int Id PK
        string Title
        string ImageUrl
        string LinkUrl
        int SortOrder
        bit IsActive
    }
    
    Users {
        int Id PK
        string Username
        string PasswordHash
        string FullName
        string Role
    }
```

*(Lưu ý: Bảng Banners và Users hoạt động độc lập để phục vụ hiển thị quảng cáo và phân quyền tài khoản quản trị nội bộ nên không có liên kết khóa ngoại trực tiếp đến các thực thể bán hàng).*

Hệ thống được thiết kế với cơ sở dữ liệu quan hệ gồm 19 bảng thực thể liên kết chặt chẽ với nhau để hỗ trợ các nghiệp vụ nâng cao của chuỗi cửa hàng Phúc Long (như quản lý nhiều tùy chọn size/topping cho đồ uống, nhiều địa chỉ nhận hàng cho khách hàng, hệ thống tích hợp voucher giảm giá và định vị cửa hàng gần nhất).

#### 2.3. Chi tiết thiết kế cơ sở dữ liệu (Database Schema)

##### 2.3.1. Phân hệ nội dung tin tức (PostCategory, Post, Banner)
Phân hệ này quản lý việc lưu trữ các bài viết tin tức, khuyến mãi và các banner quảng cáo hiển thị trên trang chủ của ứng dụng.

*   **Bảng `PostCategories` (Chuyên mục bài viết):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã chuyên mục bài viết.
    *   `Name` (nvarchar(100), Not Null): Tên chuyên mục (Ví dụ: Tin tức, Khuyến mãi).
    *   `Slug` (varchar(150), Unique, Not Null): URL thân thiện phục vụ SEO.
    *   `ParentId` (int, Nullable, Khóa ngoại): Liên kết đến chuyên mục cha để phân cấp cây.
    *   `IsDeleted` (bit, Not Null, Mặc định 0): Đánh dấu xóa mềm.
*   **Bảng `Posts` (Bài viết):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã bài viết.
    *   `Title` (nvarchar(200), Not Null): Tiêu đề bài viết tin tức.
    *   `Slug` (varchar(150), Unique, Not Null): URL thân thiện phục vụ SEO.
    *   `Content` (nvarchar(max), Not Null): Nội dung bài viết (lưu trữ mã HTML từ CKEditor).
    *   `ImageUrl` (nvarchar(500), Null): Ảnh đại diện của bài viết.
    *   `PostCategoryId` (int, Khóa ngoại, Not Null): Liên kết đến bảng `PostCategories`.
    *   `PublishedAt` (datetime, Not Null): Thời gian xuất bản bài viết lên hệ thống.
    *   `IsDeleted` (bit, Not Null, Mặc định 0): Đánh dấu xóa mềm.
*   **Bảng `Banners` (Banner quảng cáo):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã banner quảng cáo.
    *   `Title` (nvarchar(150), Null): Tiêu đề banner.
    *   `ImageUrl` (nvarchar(500), Not Null): Đường dẫn tệp ảnh banner trên server.
    *   `LinkUrl` (nvarchar(500), Null): Liên kết chuyển hướng khi khách hàng click vào banner.
    *   `SortOrder` (int, Not Null, Mặc định 0): Thứ tự sắp xếp hiển thị trên Slider trang chủ.
    *   `IsActive` (bit, Not Null, Mặc định 1): Trạng thái hiển thị hoạt động.

##### 2.3.2. Phân hệ bán hàng E-Commerce (ProductCategory, Product, ProductImage, OptionGroup, OptionValue, ProductOptionGroup)
Phân hệ này quản lý danh mục sản phẩm, thực đơn đồ uống, các thuộc tính tùy chọn đi kèm (Size, Topping) và hình ảnh trực quan của sản phẩm.

*   **Bảng `ProductCategories` (Danh mục sản phẩm):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã danh mục sản phẩm.
    *   `Name` (nvarchar(100), Not Null): Tên danh mục (Trà sữa, Cà phê, Trà trái cây...).
    *   `Slug` (varchar(150), Unique, Not Null): URL danh mục phục vụ SEO.
    *   `ParentId` (int, Nullable, Khóa ngoại): Nhóm danh mục cha (hỗ trợ phân cấp nhiều cấp).
    *   `ImageUrl` (nvarchar(500), Null): Ảnh minh họa danh mục.
    *   `IsDeleted` (bit, Not Null, Mặc định 0): Đánh dấu xóa mềm.
*   **Bảng `Products` (Sản phẩm - Món uống):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã sản phẩm món uống duy nhất.
    *   `Name` (nvarchar(150), Not Null): Tên món uống hiển thị trên giao diện.
    *   `Slug` (varchar(150), Unique, Not Null): URL sản phẩm phục vụ SEO.
    *   `Price` (decimal(18,2), Not Null): Đơn giá cơ bản của sản phẩm (chưa cộng thêm size/topping).
    *   `StockQuantity` (int, Not Null, Mặc định 0): Số lượng hàng tồn kho phục vụ kiểm tra khi đặt hàng trực tuyến.
    *   `ProductCategoryId` (int, Khóa ngoại, Not Null): Liên kết tới danh mục bảng `ProductCategories`.
    *   `Description` (nvarchar(max), Null): Mô tả chi tiết món uống dạng HTML.
    *   `ImageUrl` (nvarchar(500), Null): Ảnh đại diện chính của sản phẩm.
    *   `IsDeleted` (bit, Not Null, Mặc định 0): Đánh dấu xóa mềm.
*   **Bảng `ProductImages` (Hình ảnh sản phẩm phụ):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã ảnh sản phẩm phụ.
    *   `ProductId` (int, Khóa ngoại, Not Null): Liên kết tới bảng `Products`.
    *   `ImageUrl` (nvarchar(500), Not Null): Đường dẫn hình ảnh chi tiết của sản phẩm.
*   **Bảng `OptionGroups` (Nhóm tùy chọn):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã nhóm tùy chọn (Ví dụ: Size, Topping, Lượng đường).
    *   `Name` (nvarchar(100), Not Null): Tên nhóm tùy chọn hiển thị.
    *   `IsRequired` (bit, Not Null, Mặc định 0): Trạng thái bắt buộc chọn hay không.
*   **Bảng `OptionValues` (Giá trị tùy chọn):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã giá trị tùy chọn cụ thể.
    *   `OptionGroupId` (int, Khóa ngoại, Not Null): Liên kết đến bảng `OptionGroups`.
    *   `Name` (nvarchar(100), Not Null): Tên giá trị hiển thị (Ví dụ: Size L, Trân châu hoàng kim, 50% Đường).
    *   `PriceSurcharge` (decimal(18,2), Not Null, Mặc định 0): Số tiền cộng thêm vào đơn giá gốc nếu chọn giá trị này.
*   **Bảng `ProductOptionGroups` (Bảng liên kết nhiều-nhiều giữa Sản phẩm và Nhóm tùy chọn):**
    *   `ProductId` (int, Khóa chính, Khóa ngoại): Liên kết đến bảng `Products`.
    *   `OptionGroupId` (int, Khóa chính, Khóa ngoại): Liên kết đến bảng `OptionGroups`.

##### 2.3.3. Phân hệ khách hàng và đơn hàng (Customer, CustomerAddress, Order, OrderDetail, OrderDetailOption, Voucher, CustomerVoucher, Review, Store)
Phân hệ cốt lõi quản lý thông tin tài khoản khách hàng, địa chỉ giao hàng, lịch sử đặt đơn, các dòng chi tiết sản phẩm kèm theo tùy chọn được đặt, hệ thống voucher khuyến mãi, đánh giá sản phẩm và định vị các cửa hàng Phúc Long.

*   **Bảng `Customers` (Khách hàng):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã tài khoản khách hàng.
    *   `FullName` (nvarchar(100), Not Null): Họ tên khách hàng.
    *   `Email` (varchar(150), Unique, Not Null): Email đăng nhập hệ thống.
    *   `Phone` (varchar(20), Null): Số điện thoại liên lạc.
    *   `Password` (nvarchar(200), Not Null): Mật khẩu đã được băm một chiều bảo mật.
    *   `TokenVersion` (int, Not Null, Mặc định 1): Phiên bản Token để vô hiệu hóa JWT khi đăng xuất.
*   **Bảng `CustomerAddresses` (Sổ địa chỉ khách hàng):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã địa chỉ.
    *   `CustomerId` (int, Khóa ngoại, Not Null): Liên kết đến khách hàng sở hữu bảng `Customers`.
    *   `ReceiverName` (nvarchar(100), Not Null): Họ tên người nhận hàng tại địa chỉ này.
    *   `ReceiverPhone` (varchar(20), Not Null): Số điện thoại người nhận hàng.
    *   `AddressLine` (nvarchar(200), Not Null): Số nhà, tên đường nhận hàng.
    *   `Province` (nvarchar(100), Not Null): Tỉnh/Thành phố.
    *   `District` (nvarchar(100), Not Null): Quận/Huyện.
    *   `Ward` (nvarchar(100), Not Null): Phường/Xã.
    *   `AddressType` (nvarchar(50), Not Null): Loại địa chỉ (Ví dụ: Nhà riêng, Văn phòng).
    *   `IsDefault` (bit, Not Null, Mặc định 0): Đánh dấu địa chỉ giao hàng mặc định.
    *   `CreatedAt` (datetime, Not Null): Ngày tạo địa chỉ.
*   **Bảng `Orders` (Đơn đặt hàng):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã số đơn hàng.
    *   `CustomerId` (int, Khóa ngoại, Not Null): Liên kết khách hàng đặt đơn.
    *   `ReceiverName` (nvarchar(100), Not Null): Tên người nhận.
    *   `ReceiverPhone` (varchar(20), Not Null): Điện thoại nhận hàng.
    *   `ShippingAddress` (nvarchar(500), Not Null): Địa chỉ giao hàng chi tiết.
    *   `ShippingFee` (decimal(18,2), Not Null, Mặc định 0): Phí giao hàng tính từ API GHN.
    *   `DiscountAmount` (decimal(18,2), Not Null, Mặc định 0): Số tiền được giảm từ Voucher khuyến mãi.
    *   `TotalAmount` (decimal(18,2), Not Null): Tổng số tiền thanh toán cuối cùng của đơn hàng.
    *   `Status` (int, Not Null, Mặc định 0): Trạng thái đơn hàng (0: Chờ duyệt, 1: Đang chuẩn bị, 2: Đang giao, 3: Đã giao, 4: Đã hủy).
    *   `PaymentMethod` (int, Not Null, Mặc định 0): Phương thức thanh toán (0: COD, 1: VNPay, 2: MoMo).
    *   `PaymentStatus` (int, Not Null, Mặc định 0): Trạng thái thanh toán (0: Chưa thanh toán, 1: Đã thanh toán).
    *   `OrderDate` (datetime, Not Null): Ngày giờ đặt đơn hàng.
    *   `Notes` (nvarchar(500), Null): Ghi chú giao hàng từ khách hàng.
    *   `ShippingStoreId` (int, Nullable, Khóa ngoại): Chi nhánh cửa hàng gần nhất chịu trách nhiệm giao hàng.
*   **Bảng `OrderDetails` (Chi tiết đơn hàng):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã chi tiết đơn hàng.
    *   `OrderId` (int, Khóa ngoại, Not Null): Liên kết đến đơn hàng chính `Orders`.
    *   `ProductId` (int, Khóa ngoại, Not Null): Liên kết đến sản phẩm `Products`.
    *   `Quantity` (int, Not Null): Số lượng sản phẩm mua.
    *   `BasePrice` (decimal(18,2), Not Null): Đơn giá gốc của món uống tại thời điểm mua.
    *   `ToppingSurcharge` (decimal(18,2), Not Null, Mặc định 0): Tổng số tiền phụ thu của các tùy chọn size/topping đi kèm.
    *   `UnitPrice` (decimal(18,2), Not Null): Đơn giá cuối cùng của sản phẩm trong đơn (`BasePrice` + `ToppingSurcharge`).
    *   `TotalPrice` (decimal(18,2), Not Null): Tổng tiền của dòng chi tiết đơn hàng (`UnitPrice` * `Quantity`).
*   **Bảng `OrderDetailOptions` (Tùy chọn chi tiết đơn hàng):**
    *   `OrderDetailId` (int, Khóa chính, Khóa ngoại): Liên kết đến dòng chi tiết bảng `OrderDetails`.
    *   `OptionValueId` (int, Khóa chính, Khóa ngoại): Liên kết đến bảng `OptionValues` để biết tùy chọn cụ thể đã đặt mua.
*   **Bảng `Vouchers` (Mã giảm giá):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã voucher.
    *   `Code` (varchar(50), Unique, Not Null): Mã code voucher khách hàng nhập vào (Ví dụ: PHUCLONG10).
    *   `DiscountValue` (decimal(18,2), Not Null): Giá trị giảm giá.
    *   `IsPercent` (bit, Not Null, Mặc định 0): Giảm theo phần trăm (true) hay trừ thẳng số tiền cố định (false).
    *   `MinimumOrderAmount` (decimal(18,2), Not Null, Mặc định 0): Giá trị đơn hàng tối thiểu để được áp dụng mã.
    *   `ExpiryDate` (datetime, Not Null): Ngày hết hạn của voucher.
*   **Bảng `CustomerVouchers` (Liên kết khách hàng và Voucher):**
    *   `CustomerId` (int, Khóa chính, Khóa ngoại): Khách hàng nhận voucher.
    *   `VoucherId` (int, Khóa chính, Khóa ngoại): Voucher được cấp cho khách hàng.
    *   `IsUsed` (bit, Not Null, Mặc định 0): Trạng thái đã sử dụng voucher này hay chưa.
*   **Bảng `Reviews` (Đánh giá sản phẩm):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã đánh giá.
    *   `ProductId` (int, Khóa ngoại, Not Null): Sản phẩm được đánh giá.
    *   `CustomerId` (int, Khóa ngoại, Not Null): Khách hàng thực hiện đánh giá.
    *   `Rating` (int, Not Null): Số sao đánh giá (từ 1 đến 5 sao).
    *   `Comment` (nvarchar(500), Null): Bình luận, nhận xét của khách hàng.
    *   `CreatedAt` (datetime, Not Null): Thời điểm gửi đánh giá.
*   **Bảng `Stores` (Cửa hàng Phúc Long):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã số cửa hàng.
    *   `Name` (nvarchar(150), Not Null): Tên chi nhánh cửa hàng (Ví dụ: Phúc Long Lê Lợi).
    *   `Address` (nvarchar(300), Not Null): Địa chỉ chi nhánh.
    *   `Latitude` (double, Not Null): Vĩ độ phục vụ định vị bản đồ.
    *   `Longitude` (double, Not Null): Kinh độ phục vụ định vị bản đồ.

##### 2.3.4. Phân hệ tài khoản quản trị và phân quyền (User)
Phân hệ quản trị nhân sự nội bộ chịu trách nhiệm vận hành hệ thống Admin.

*   **Bảng `Users` (Thành viên quản trị):**
    *   `Id` (int, Khóa chính, Tự tăng): Mã tài khoản nhân sự.
    *   `Username` (varchar(50), Unique, Not Null): Tên đăng nhập vùng quản lý.
    *   `PasswordHash` (nvarchar(200), Not Null): Mật khẩu băm một chiều.
    *   `FullName` (nvarchar(100), Not Null): Họ tên nhân viên.
    *   `Role` (varchar(20), Not Null): Quyền hạn của tài khoản trên hệ thống quản trị (`Admin` hoặc `Editor`).

#### 2.4. Thiết kế danh mục Web API giữa Backend và Frontend

Để phục vụ cho ứng dụng ReactJS Frontend, Backend cung cấp một hệ thống RESTful API toàn diện. Dưới đây là bảng danh mục toàn bộ các đầu API đang hoạt động trong hệ thống:

##### Bảng 2.4: Danh mục các Web API hệ thống
| STT | Phân hệ | Phương thức | Đường dẫn (Endpoint) | Quyền truy cập | Mô tả chức năng |
|:---:|---|:---:|---|:---:|---|
| **1** | Banners | `GET` | `/api/banners` | Tự do | Lấy danh sách banner quảng cáo hoạt động ở trang chủ. |
| **2** | Tin tức | `GET` | `/api/postcategories` | Tự do | Lấy danh sách danh mục bài viết tin tức. |
| **3** | Tin tức | `GET` | `/api/posts` | Tự do | Lấy danh sách bài viết tin tức (có phân trang, tìm kiếm). |
| **4** | Tin tức | `GET` | `/api/posts/{id}` | Tự do | Lấy chi tiết nội dung một bài viết. |
| **5** | Sản phẩm | `GET` | `/api/productcategories` | Tự do | Lấy danh sách danh mục sản phẩm (Trà, Cà phê...). |
| **6** | Sản phẩm | `GET` | `/api/products` | Tự do | Lấy danh sách sản phẩm (phân trang, lọc danh mục, lọc giá). |
| **7** | Sản phẩm | `GET` | `/api/products/{id}` | Tự do | Lấy chi tiết sản phẩm (bao gồm cả Size, Topping và Reviews). |
| **8** | Sản phẩm | `GET` | `/api/products/search-suggestions` | Tự do | Gợi ý sản phẩm nhanh khi khách hàng gõ từ khóa. |
| **9** | Khách hàng | `POST` | `/api/customers/register` | Tự do | Đăng ký tài khoản khách hàng mới. |
| **10** | Khách hàng | `POST` | `/api/customers/login` | Tự do | Đăng nhập tài khoản khách hàng (trả về JWT Token). |
| **11** | Khách hàng | `GET` | `/api/customers/profile` | Yêu cầu Token | Lấy thông tin cá nhân của khách hàng đang đăng nhập. |
| **12** | Khách hàng | `PUT` | `/api/customers/profile` | Yêu cầu Token | Cập nhật thông tin cá nhân khách hàng. |
| **13** | Khách hàng | `POST` | `/api/customers/forgot-password` | Tự do | Yêu cầu gửi email khôi phục mật khẩu. |
| **14** | Khách hàng | `POST` | `/api/customers/reset-password` | Tự do | Đặt lại mật khẩu mới bằng Token bảo mật. |
| **15** | Địa chỉ | `GET` | `/api/customers/addresses` | Yêu cầu Token | Lấy danh sách sổ địa chỉ nhận hàng của khách hàng. |
| **16** | Địa chỉ | `POST` | `/api/customers/addresses` | Yêu cầu Token | Thêm mới một địa chỉ nhận hàng. |
| **17** | Địa chỉ | `PUT` | `/api/customers/addresses/{id}` | Yêu cầu Token | Chỉnh sửa thông tin một địa chỉ nhận hàng. |
| **18** | Địa chỉ | `DELETE` | `/api/customers/addresses/{id}` | Yêu cầu Token | Xóa một địa chỉ khỏi sổ địa chỉ. |
| **19** | Đơn hàng | `POST` | `/api/orders` | Yêu cầu Token | Đặt đơn hàng mới (trừ kho và gửi email xác nhận). |
| **20** | Đơn hàng | `GET` | `/api/orders` | Yêu cầu Token | Lấy lịch sử mua hàng của khách hàng hiện tại. |
| **21** | Đơn hàng | `GET` | `/api/orders/{id}` | Yêu cầu Token | Xem chi tiết trạng thái và sản phẩm của một đơn hàng. |
| **22** | Đơn hàng | `POST` | `/api/orders/{id}/cancel` | Yêu cầu Token | Yêu cầu hủy đơn hàng (khi đơn ở trạng thái chờ duyệt). |
| **23** | Đánh giá | `POST` | `/api/reviews` | Yêu cầu Token | Khách hàng gửi đánh giá và số sao cho sản phẩm đã mua. |
| **24** | Cửa hàng | `GET` | `/api/stores` | Tự do | Lấy danh sách các cửa hàng Phúc Long (để Store Locator định vị). |
| **25** | Khuyến mãi | `GET` | `/api/vouchers/validate` | Tự do | Kiểm tra tính hợp lệ và số tiền giảm giá của mã Voucher. |

---

##### 2.4.1. Chi tiết cấu trúc dữ liệu JSON của các API cốt lõi

###### 1. API Đăng ký khách hàng mới (`POST /api/customers/register`)
*   **Request Body:**
    ```json
    {
      "fullName": "Nguyễn Trúc Trường",
      "email": "tructruong@gmail.com",
      "phone": "0987654321",
      "password": "SecurePassword123!"
    }
    ```
*   **Response Body (Thành công - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Đăng ký tài khoản thành công.",
      "data": {
        "id": 15,
        "fullName": "Nguyễn Trúc Trường",
        "email": "tructruong@gmail.com",
        "phone": "0987654321"
      }
    }
    ```

###### 2. API Đăng nhập khách hàng (`POST /api/customers/login`)
*   **Request Body:**
    ```json
    {
      "email": "tructruong@gmail.com",
      "password": "SecurePassword123!"
    }
    ```
*   **Response Body (Thành công - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Đăng nhập thành công.",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNSIsImVtYWlsIjoia...",
        "customer": {
          "id": 15,
          "fullName": "Nguyễn Trúc Trường",
          "email": "tructruong@gmail.com"
        }
      }
    }
    ```

###### 3. API Lấy danh sách sản phẩm phân trang (`GET /api/products`)
*   **Query Params:** `categorySlug=tra-sua&minPrice=30000&maxPrice=70000&page=1&pageSize=12`
*   **Response Body (Thành công - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Tải danh sách sản phẩm thành công.",
      "data": {
        "items": [
          {
            "id": 3,
            "name": "Trà Sữa Phúc Long",
            "slug": "tra-sua-phuc-long",
            "price": 45000.00,
            "imageUrl": "/uploads/products/tra-sua-pl.png",
            "productCategoryName": "Trà Sữa",
            "productCategoryImageUrl": "/uploads/categories/tra-sua.png",
            "description": "Hương vị trà sữa Phúc Long đậm vị trà truyền thống.",
            "stockQuantity": 80,
            "totalSold": 150
          }
        ],
        "page": 1,
        "pageSize": 12,
        "totalItems": 1,
        "totalPages": 1
      }
    }
    ```

###### 4. API Kiểm tra tính hợp lệ của Voucher (`GET /api/vouchers/validate`)
*   **Query Params:** `code=PHUCLONG10&orderSubtotal=120000`
*   **Response Body (Thành công - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Mã giảm giá hợp lệ.",
      "data": {
        "isValid": true,
        "discountAmount": 12000.00,
        "message": "Mã giảm giá hợp lệ.",
        "voucher": {
          "id": 1,
          "code": "PHUCLONG10",
          "discountValue": 10.0,
          "isPercent": true,
          "minimumOrderAmount": 100000.0,
          "expiryDate": "2026-12-31T23:59:59Z"
        }
      }
    }
    ```

###### 5. API Tạo đơn đặt hàng mới (`POST /api/orders`)
*   **Request Headers:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...`
*   **Request Body:**
    ```json
    {
      "receiverName": "Nguyễn Trúc Trường",
      "receiverPhone": "0987654321",
      "shippingAddress": "123 Lê Lợi, Phường Bến Nghé, Quận 1, TPHCM",
      "notes": "Giao hàng ít đá, không lấy ống hút nhựa",
      "voucherCode": "PHUCLONG10",
      "isPickup": false,
      "paymentMethod": 0,
      "items": [
        {
          "productId": 3,
          "quantity": 2,
          "optionValueIds": [2, 5]
        }
      ]
    }
    ```
*   **Response Body (Thành công - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Đặt hàng thành công!",
      "data": {
        "id": 1085,
        "totalAmount": 98000.00,
        "status": "Pending",
        "paymentMethod": "COD",
        "orderDate": "2026-06-30T21:44:23Z"
      }
    }
    ```

###### 6. API Thêm mới địa chỉ vào sổ địa chỉ (`POST /api/customers/addresses`)
*   **Request Headers:** `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...`
*   **Request Body:**
    ```json
    {
      "receiverName": "Nguyễn Trúc Trường",
      "receiverPhone": "0987654321",
      "addressLine": "123 Lê Lợi",
      "province": "TP. Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "addressType": "Nhà riêng",
      "isDefault": true
    }
    ```
*   **Response Body (Thành công - 200 OK):**
    ```json
    {
      "success": true,
      "message": "Thêm địa chỉ thành công.",
      "data": {
        "id": 8,
        "receiverName": "Nguyễn Trúc Trường",
        "receiverPhone": "0987654321",
        "addressLine": "123 Lê Lợi",
        "province": "TP. Hồ Chí Minh",
        "district": "Quận 1",
        "ward": "Phường Bến Nghé",
        "addressType": "Nhà riêng",
        "isDefault": true,
        "createdAt": "2026-06-30T21:46:47Z"
      }
    }
    ```

---

### CHƯƠNG 3: TRIỂN KHAI PHẦN BACKEND (C# ASP.NET CORE WEB API)

#### 3.1. Cấu trúc Solution và phân tách các tầng kiến trúc
Giải pháp được xây dựng trên một Solution gồm 3 dự án chính đảm nhiệm các vai trò riêng biệt:
*   **`CMS.Data` (Tầng dữ liệu):** Dự án Class Library chịu trách nhiệm làm việc với cơ sở dữ liệu. Chứa các định nghĩa thực thể trong thư mục `Entities/` và lớp quản lý kết nối `ApplicationDbContext.cs`.
*   **`CMS.Backend` (Tầng API & Admin):** Dự án Web Application tích hợp cả 2 vai trò: cung cấp giao diện MVC Razor cho trang quản trị nội bộ và cung cấp các dịch vụ RESTful API phục vụ ứng dụng ReactJS.
*   **`CMS.Frontend` (Tầng giao diện khách hàng):** Dự án ReactJS độc lập giao tiếp với Backend hoàn toàn qua môi trường HTTP.

#### 3.2. Khởi tạo Cơ sở dữ liệu và Migration dữ liệu mẫu (Seed Data)
Dự án sử dụng cơ chế **ORM Entity Framework Core 8** theo phương pháp **Code-First**. 

Lớp [ApplicationDbContext.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Data/ApplicationDbContext.cs) kế thừa từ `DbContext` và được cấu hình ghi đè phương thức `SaveChanges` để tự động hóa việc chuẩn hóa dữ liệu trước khi lưu vào SQL Server. Cụ thể, khi thêm mới hoặc cập nhật một sản phẩm hay bài viết, hệ thống sẽ tự động chuyển đổi tên tiếng Việt có dấu thành chuỗi **Slug** không dấu ngăn cách bằng ký tự `-` phục vụ tối ưu hóa đường dẫn (SEO URL) mà người sử dụng không cần phải nhập thủ công.

#### 3.3. Các API Controllers xử lý dữ liệu
Các API Controller tại thư mục [Controllers/Api/](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/Api) được khai báo thuộc tính `[ApiController]` và kế thừa từ `ControllerBase`. Dữ liệu trả về được chuẩn hóa theo lớp cấu trúc `ApiResponse<T>` gồm các trường: `Success` (bool), `Message` (string), và `Data` (chứa payload JSON thực tế).

#### 3.4. Bảo mật, mã hóa mật khẩu và phân quyền Cookie/JWT
Để bảo vệ thông tin cá nhân của người dùng, hệ thống tuyệt đối không lưu mật khẩu ở dạng văn bản thô (Plain Text). 

*   **Mã hóa mật khẩu:** Dự án sử dụng lớp mã hóa bảo mật `PasswordHasher` dựa trên lớp `PasswordHasher<T>` của ASP.NET Core Identity để băm mật khẩu một chiều bằng thuật toán PBKDF2:
    ```csharp
    // Mã hóa mật khẩu khi khách hàng đăng ký tài khoản mới tại CustomerApiService.cs
    customer.Password = PasswordHasher.Hash(customer, model.Password);
    ```
*   **Phân quyền vùng Admin:** Sử dụng **Cookie Authentication** được cấu hình trong `Program.cs`. Mọi trang trong vùng quản trị đều được kiểm tra đăng nhập bằng thuộc tính `[Authorize]`. Riêng trang quản lý tài khoản nhân viên [UserController.cs](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Controllers/UserController.cs) chỉ cho phép nhóm người dùng có vai trò `Admin` thực hiện thông qua thuộc tính phân quyền cấp cao:
    ```csharp
    [Authorize(Roles = "Admin")]
    public class UserController : Controller { ... }
    ```

#### 3.5. Tích hợp CKEditor và cơ chế Upload ảnh vật lý
Trang soạn thảo bài viết tin tức và mô tả sản phẩm được tích hợp trình soạn thảo giàu tính năng **CKEditor 5** từ CDN tại tệp [Post/Create.cshtml](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Post/Create.cshtml). 

Để hỗ trợ tính năng tải ảnh trực tiếp khi đang soạn thảo nội dung, sinh viên đã xây dựng lớp Javascript `UploadAdapter` để gửi file ảnh lên máy chủ qua API. Lớp xử lý ở Backend nhận file ảnh từ yêu cầu gửi lên, tiến hành lưu trữ vật lý vào thư mục tệp tĩnh `/wwwroot/uploads/` trên máy chủ và trả về đường dẫn dạng HTML để chèn trực tiếp thẻ `<img>` vào vị trí con trỏ chuột của người dùng đang soạn thảo.

#### 3.6. Cấu hình CORS mở cổng cho ReactJS
Do ứng dụng ReactJS chạy ở một cổng khác so với Backend, trình duyệt sẽ chặn các yêu cầu gọi dữ liệu do vi phạm chính sách cùng nguồn gốc. Tại tệp cấu hình khởi chạy [Program.cs:L93-109](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Program.cs#L93-L109), chính sách CORS đã được khai báo tường minh:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .WithMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS");
    });
});
```

#### 3.7. Giao diện quản trị Admin MVC đầy đủ chức năng
Giao diện quản lý nội bộ sử dụng tệp bố cục chung [_LayoutAdmin.cshtml](file:///c:/NguyenTrucTruong_Solution/CMS.Backend/Views/Shared/_LayoutAdmin.cshtml) bao gồm:
*   **Sidebar thông minh:** Tự động làm nổi bật (Active) mục lục tương ứng với Controller đang làm việc giúp nhân viên dễ dàng chuyển đổi qua lại.
*   **Thông tin tài khoản:** Hiển thị tên đầy đủ và vai trò của nhân viên đang làm việc ở góc dưới Sidebar thông qua việc đọc các thông tin (Claims) lưu trong Cookie.
*   **Đăng xuất:** Hàm đăng xuất xóa bỏ hoàn toàn thông tin Cookie lưu trữ tại trình duyệt của người dùng và chuyển hướng an toàn về trang đăng nhập độc lập.

#### 3.8. Giao diện tài liệu Swagger UI
Swagger UI được kích hoạt khi chạy dự án ở chế độ phát triển (Development). Khi truy cập đường dẫn `/swagger` trên trình duyệt, hệ thống sẽ hiển thị một trang tài liệu tương tác hiển thị đầy đủ danh sách các API, các tham số đầu vào và cho phép chạy thử nghiệm kiểm tra kết quả trả về trực tiếp mà không cần cài đặt thêm phần mềm bên thứ ba.

---

### CHƯƠNG 4: TRIỂN KHAI PHẦN FRONTEND (REACTJS CLIENT SITE)

#### 4.1. Khởi tạo cấu trúc dự án ReactJS và tích hợp React Router DOM
Dự án được khởi tạo bằng công cụ **Vite** để tối ưu hóa hiệu năng biên dịch và tải trang. Cấu trúc mã nguồn được tổ chức phân rã thành các thư mục chuyên biệt:
*   `src/api/`: Khai báo các tệp gọi API cho từng thực thể (sản phẩm, đơn hàng, khách hàng).
*   `src/components/`: Chứa các thành phần giao diện nhỏ có tính chất tái sử dụng cao.
*   `src/context/`: Quản lý trạng thái toàn cục của ứng dụng (trạng thái đăng nhập và thông tin giỏ hàng).
*   `src/pages/`: Chứa các trang giao diện chính.
*   `src/routes/`: Thiết lập hệ thống định tuyến trang thông qua thư viện **React Router DOM v6** giúp chuyển trang mượt mà không tải lại trang.

#### 4.2. Cấu hình trục kết nối HTTP Client chung (`axiosClient.js`) và xử lý dữ liệu JSON
Tệp cấu hình [axiosClient.js](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/api/axiosClient.js) đóng vai trò làm trục giao tiếp chính với máy chủ Backend. Nó lấy địa chỉ tên miền máy chủ API thông qua việc đọc hằng số `API_BASE_URL` được cấu hình tập trung trong tệp hằng số [constants.js](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/utils/constants.js) (lấy giá trị từ biến môi trường của hệ thống mà không viết cứng trong mã nguồn).

Trục kết nối sử dụng các bộ chặn (Interceptors) để:
*   **Request Interceptor:** Tự động kiểm tra xem khách hàng đã đăng nhập chưa, nếu có sẽ lấy mã JWT Token lưu trong trình duyệt và chèn vào tiêu đề `Authorization: Bearer <Token>` trước khi gửi yêu cầu lên máy chủ.
*   **Response Interceptor:** Tự động bắt lỗi hệ thống toàn cục. Nếu nhận được phản hồi lỗi `401 Unauthorized` từ máy chủ (do token hết hạn hoặc không hợp lệ), hệ thống sẽ tự động dọn dẹp thông tin đăng nhập trong trình duyệt và chuyển hướng người dùng về trang đăng nhập.

#### 4.3. Xây dựng giao diện Trang chủ (`Home.jsx`)
Trang chủ được ghép nối từ nhiều thành phần giao diện chuyên biệt được nhập khẩu và sắp xếp khoa học:
*   `<HeroBanner />`: Tự động gọi API lấy danh sách các banner quảng cáo đang hoạt động từ bảng `Banners` để hiển thị dạng slide trình chiếu ảnh tự động chuyển động sau mỗi 5 giây.
*   `<BestSellers />`: Lưới hiển thị danh sách các món uống bán chạy nhất (Best Sellers) được truy vấn động từ máy chủ API, hiển thị thẻ sản phẩm kèm nhãn nổi bật để thu hút người mua.
*   `<PostGrid />`: Hiển thị danh sách các tin tức, bài viết chương trình khuyến mãi mới nhất của chuỗi cửa hàng Phúc Long.
*   `<StoreLocator />`: Bản đồ tìm kiếm cửa hàng tích hợp thư viện bản đồ Leaflet Map, cho phép khách hàng tra cứu danh sách địa chỉ chi nhánh Phúc Long, hiển thị các điểm ghim (Markers) vị trí trực quan trên bản đồ.

#### 4.4. Triển khai Trang cửa hàng (`Menu.jsx`) tích hợp bộ lọc khoảng giá và Tìm kiếm thời gian thực
Trang thực đơn [Menu.jsx](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Menu/Menu.jsx) đóng vai trò là trang cửa hàng chính tích hợp các công cụ tìm kiếm và lọc dữ liệu:
*   **Lọc khoảng giá:** Component `PriceFilter` hiển thị hai ô nhập giá bán tối thiểu và tối đa. Khi người dùng nhập giá trị, ReactJS sẽ cập nhật trạng thái bộ lọc, tự động kích hoạt gọi lại API lọc sản phẩm ngầm và cập nhật lại lưới sản phẩm tương ứng thời gian thực.
*   **Tìm kiếm thời gian thực:** Ô tìm kiếm trên Header được tích hợp cơ chế **Debounce (350ms)** để giảm số lượng yêu cầu gọi API lên máy chủ khi người dùng đang gõ phím liên tục. Khi bộ lọc khoảng giá hoặc từ khóa tìm kiếm không trả về kết quả nào từ backend, trang web sẽ tự động hiển thị hình ảnh minh họa giỏ hàng trống kèm dòng chữ: *"Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn"*.

#### 4.5. Trang chi tiết sản phẩm (`ProductDetail.jsx`) hiển thị HTML và kiểm tra tồn kho
*   **Hiển thị HTML:** Sử dụng thuộc tính **`dangerouslySetInnerHTML={{ __html: product.description }}`** để render chính xác nội dung định dạng phong phú được lưu từ CKEditor ở backend mà không bị lộ các thẻ mã nguồn thô.
*   **Kiểm tra tồn kho:** Hệ thống lấy trường `stockQuantity` từ API. Nếu sản phẩm hết hàng, nút mua hàng sẽ bị vô hiệu hóa và hiển thị chữ *"Tạm hết hàng"*. Nút tăng số lượng mua sẽ tự động bị khóa lại khi người dùng chọn số lượng bằng với số lượng sản phẩm thực tế còn lại trong kho.

#### 4.6. Luồng khách hàng (Đăng ký, Đăng nhập, Đơn hàng)
Hệ thống quản lý thông tin khách hàng thông qua `AuthContext`:
*   Khách hàng đăng ký tài khoản mới qua trang [Register](file:///c:/NguyenTrucTruong_Solution/CMS.Frontend/src/pages/Register/Register.jsx), mật khẩu tự động được mã hóa ở backend và hệ thống gửi email chào mừng.
*   Trang thông tin cá nhân cho phép khách hàng theo dõi lịch sử đơn hàng của mình.
*   Chức năng quên mật khẩu được thiết lập, gửi mã xác nhận bảo mật về email của khách hàng để đặt lại mật khẩu mới.

#### 4.7. Giỏ hàng (`Cart.jsx`) và Thanh toán (`Checkout.jsx`)
*   **Giỏ hàng (`Cart.jsx`):** Quản lý danh sách các món ăn đã chọn dưới dạng mảng dữ liệu trong `CartContext`. Cho phép tăng/giảm số lượng món uống trực tiếp và tự động cập nhật tổng tiền tạm tính thời gian thực.
*   **Thanh toán (`Checkout.jsx`):** Thiết kế biểu mẫu 2 cột hiện đại. Cột trái tiếp nhận thông tin người nhận, địa chỉ giao hàng (lấy từ GPS hoặc sổ địa chỉ đã lưu) và tự động tính phí vận chuyển từ đơn vị vận chuyển. Cột phải tóm tắt các món nước, áp dụng mã giảm giá (Voucher) trực tiếp và lựa chọn phương thức thanh toán trước khi xác nhận đặt hàng.

---

### CHƯƠNG 5: KIỂM THỬ VÀ ĐÁNH GIÁ KẾ THÚC ĐỒ ÁN

#### 5.1. Kiểm thử chức năng phân quyền bảo mật vùng Admin (Quyền Admin và Editor)
*   **Kịch bản kiểm thử 1:** Người dùng chưa đăng nhập cố tình gõ đường dẫn `/Product` trên trình duyệt để truy cập trang quản lý sản phẩm.
    *   *Kết quả mong muốn:* Hệ thống nhận diện chưa có Cookie xác thực hợp lệ, ngay lập tức chặn lại và chuyển hướng về trang đăng nhập `/Account/Login`. (Thành công - Đạt).
*   **Kịch bản kiểm thử 2:** Tài khoản nhân viên có quyền `Editor` cố gắng truy cập trang quản lý thành viên `/User`.
    *   *Kết quả mong muốn:* Hệ thống chặn truy cập và hiển thị trang thông báo lỗi không đủ thẩm quyền (Access Denied). (Thành công - Đạt).

#### 5.2. Kiểm thử luồng nghiệp vụ mua sắm và bắt lỗi logic tồn kho (`StockQuantity`)
*   **Kịch bản kiểm thử 1:** Một sản phẩm trà sữa còn tồn kho 2 ly. Khách hàng cố tình nhập số lượng mua là 3 ly tại trang chi tiết sản phẩm.
    *   *Kết quả mong muốn:* Nút tăng số lượng (+) bị vô hiệu hóa, hệ thống hiển thị cảnh báo đạt giới hạn tồn kho tối đa. (Thành công - Đạt).
*   **Kịch bản kiểm thử 2 (Đồng thời tại Backend):** Hai khách hàng cùng lúc nhấn nút thanh toán sản phẩm cuối cùng còn lại trong kho.
    *   *Kết quả mong muốn:* Lớp xử lý đặt hàng sử dụng Transaction với mức cô lập `RepeatableRead`. Đơn hàng của khách hàng đầu tiên được xử lý thành công và trừ số lượng kho về 0. Đơn hàng của khách hàng thứ hai gửi sau vài mili giây sẽ bị hệ thống từ chối trong quá trình kiểm tra kho ở bước lưu cơ sở dữ liệu và trả về lỗi thông báo sản phẩm đã hết hàng, đảm bảo không xảy ra lỗi bán vượt quá số lượng tồn kho thực tế. (Thành công - Đạt).

#### 5.3. Kiểm thử hiệu năng đồng bộ thời gian thực ngầm (Tab Console F12 và Swagger)
*   Vận hành toàn bộ hệ thống, mở công cụ F12 trên trình duyệt và kiểm tra tab Console. Giao diện hoạt động trơn tru, không xuất hiện bất kỳ dòng báo lỗi đỏ nào liên quan đến chặn CORS hay lỗi gọi API thất bại.
*   Tài liệu Swagger hoạt động ổn định, phản hồi kết quả định dạng JSON chính xác và nhanh chóng.

#### 5.4. Đánh giá ưu điểm và nhược điểm của giải pháp thiết kế
*   **Ưu điểm:**
    *   Kiến trúc phân tầng rõ ràng, giúp dễ dàng bảo trì và phát triển độc lập giữa Backend và Frontend.
    *   Cơ chế bảo mật dữ liệu tốt thông qua mã hóa mật khẩu một chiều và kiểm soát quyền truy cập chặt chẽ.
    *   Trải nghiệm người dùng mượt mà giống ứng dụng di động nhờ công nghệ SPA, tìm kiếm nhanh và tự động tính phí vận chuyển.
*   **Nhược điểm:**
    *   Quy trình cài đặt ban đầu đòi hỏi cấu hình môi trường chính xác giữa hai dự án.
    *   Hệ thống phụ thuộc vào kết nối mạng của các dịch vụ bên thứ ba.

---

### CHƯƠNG 6: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN NÂNG CẤP

#### 6.1. Kết quả đạt được của đồ án đối với sinh viên
Thông qua việc hoàn thành đồ án, sinh viên đã đạt được các mục tiêu quan trọng:
*   Nắm vững kiến thức phân tích thiết kế cơ sở dữ liệu quan hệ cho một ứng dụng thực tế.
*   Làm chủ công nghệ ASP.NET Core 8 để xây dựng hệ thống quản trị và các đầu API bảo mật.
*   Nâng cao kỹ năng xây dựng ứng dụng giao diện người dùng bằng ReactJS và quản lý trạng thái ứng dụng thời gian thực.
*   Học hỏi được cách tích hợp các dịch vụ bên thứ ba như định vị bản đồ và tự động hóa tính toán chi phí vận chuyển.

#### 6.2. Hướng phát triển nâng cấp hệ thống trong tương lai
*   Tích hợp trực tiếp các cổng thanh toán trực tuyến phổ biến (VNPAY, MoMo) trên môi trường thực tế thay vì chạy thử nghiệm (Sandbox).
*   Xây dựng hệ thống gợi ý sản phẩm tự động dựa trên hành vi mua sắm của khách hàng để tối ưu doanh số bán hàng.
*   Phát triển thêm phiên bản ứng dụng di động (Mobile App) kết nối trực tiếp với hệ thống API Backend hiện có.
