using System;

namespace CMS.Data.Entities
{
    // Lớp cha dùng chung cho các bảng cần lưu lịch sử tạo/sửa và hỗ trợ xóa mềm.
    public abstract class BaseEntity
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Xóa mềm: dữ liệu vẫn còn trong DB, chỉ bị ẩn khỏi truy vấn thông thường.
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
    }
}
