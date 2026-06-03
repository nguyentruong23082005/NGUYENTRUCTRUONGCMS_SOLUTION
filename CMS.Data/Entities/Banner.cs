using System;

namespace CMS.Data.Entities
{
    // Lưu banner/slider hiển thị trên trang chủ hoặc các vị trí quảng cáo khác.
    public class Banner : BaseEntity
    {
        public int Id { get; set; }

        public string Title { get; set; }  // Tên banner để quản trị dễ nhận biết.

        public string ImageUrl { get; set; }  // Đường dẫn ảnh banner.

        public string? LinkUrl { get; set; }  // Link khi người dùng bấm vào banner, có thể trỏ tới bài khuyến mãi hoặc trang khác.

        public string Position { get; set; }  // Vị trí hiển thị banner, ví dụ: HomeHero = slider chính trang chủ.

        public int SortOrder { get; set; }  // Thứ tự hiển thị trong cùng một vị trí.

        public bool IsActive { get; set; }  // Cho phép bật/tắt banner mà không cần xóa dữ liệu.

        public DateTime? StartsAt { get; set; }  // Thời điểm bắt đầu hiển thị, để trống nếu luôn hiển thị.

        public DateTime? EndsAt { get; set; }  // Thời điểm kết thúc hiển thị, để trống nếu không giới hạn.
    }
}
