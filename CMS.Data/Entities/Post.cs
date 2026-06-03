using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Data.Entities
{
    public class Post : BaseEntity
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;         // Tiêu đề bài viết
        public string Content { get; set; } = string.Empty;       // Nội dung chi tiết
        public string? ImageUrl { get; set; }     // Hình ảnh đại diện (có thể để trống)
        
        public string? ExternalId { get; set; }     // ID bài viết từ nguồn ngoài
        public string? SourceUrl { get; set; }      // URL gốc bài viết
        public DateTime? PublishedAt { get; set; }  // Ngày đăng thật của bài viết

        // Khóa ngoại liên kết tới PostCategory
        public int PostCategoryId { get; set; }
        public virtual PostCategory? PostCategory { get; set; }  // Nullable - không bắt buộc khi tạo

        public string Slug { get; set; } = string.Empty;
    }
}
