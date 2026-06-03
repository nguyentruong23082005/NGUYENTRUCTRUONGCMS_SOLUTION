using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace CMS.Data.Entities
{
    public class Customer : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Password { get; set; }

        public int TokenVersion { get; set; } = 1;

        // Các danh sách bên dưới là quan hệ 1-nhiều: một khách có nhiều đơn hàng, địa chỉ, voucher, đánh giá.
        public virtual ICollection<Order>? Orders { get; set; }
        public virtual ICollection<CustomerAddress>? CustomerAddresses { get; set; }
        public virtual ICollection<CustomerVoucher>? CustomerVouchers { get; set; }
        public virtual ICollection<Review>? Reviews { get; set; }
    }
}
