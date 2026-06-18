using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Data.Entities
{
    public class PostCategory : BaseEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // Tên danh mục (vd: Tin Giáo Dục)
        public string? Description { get; set; } // Có thể để trống

        // Quan hệ: Một danh mục có nhiều bài viết
        public virtual ICollection<Post>? Posts { get; set; } // Nullable - không bắt buộc

        public string Slug { get; set; } = string.Empty;

        public int? ParentId { get; set; }
        public virtual PostCategory? Parent { get; set; }
        public virtual ICollection<PostCategory>? Children { get; set; }
    }
}
