using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Data.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } // Tên danh mục (vd: Tin Giáo Dục)
        public string? Description { get; set; } // Có thể để trống

        // Quan hệ: Một danh mục có nhiều bài viết
        public virtual ICollection<Post>? Posts { get; set; } // Nullable - không bắt buộc
    }
}
