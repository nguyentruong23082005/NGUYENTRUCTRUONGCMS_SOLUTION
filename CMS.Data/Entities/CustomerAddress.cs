using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CMS.Data.Entities
{
    public class CustomerAddress : BaseEntity
    {
        [Key]
        public int Id { get; set; }

        public int CustomerId { get; set; }

        // Thông tin người nhận, có thể khác thông tin tài khoản Customer.
        public string ReceiverName { get; set; }
        public string ReceiverPhone { get; set; }
        public string AddressLine { get; set; }
        public string Province { get; set; }
        public string District { get; set; }
        public string Ward { get; set; }
        public string AddressType { get; set; } // Home, Office, etc.
        public bool IsDefault { get; set; }

        // Navigation property: địa chỉ này thuộc về khách hàng nào.
        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }
    }
}
