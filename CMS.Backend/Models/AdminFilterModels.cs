using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace CMS.Backend.Models
{
    // Customer
    public class CustomerFilterModel
    {
        public string? Search { get; set; }
    }
    public class CustomerIndexViewModel
    {
        public PaginatedList<Customer> Customers { get; set; } = null!;
        public CustomerFilterModel Filter { get; set; } = null!;
    }

    // Voucher
    public class VoucherFilterModel
    {
        public string? Search { get; set; }
    }
    public class VoucherIndexViewModel
    {
        public PaginatedList<Voucher> Vouchers { get; set; } = null!;
        public VoucherFilterModel Filter { get; set; } = null!;
    }

    // Post Category (Category)
    public class CategoryFilterModel
    {
        public string? Search { get; set; }
    }
    public class CategoryIndexViewModel
    {
        public PaginatedList<PostCategory> Categories { get; set; } = null!;
        public CategoryFilterModel Filter { get; set; } = null!;
    }

    // Product Category
    public class ProductCategoryFilterModel
    {
        public string? Search { get; set; }
    }
    public class ProductCategoryIndexViewModel
    {
        public PaginatedList<ProductCategory> Categories { get; set; } = null!;
        public ProductCategoryFilterModel Filter { get; set; } = null!;
    }

    // Option Group
    public class OptionGroupFilterModel
    {
        public string? Search { get; set; }
    }
    public class OptionGroupIndexViewModel
    {
        public PaginatedList<OptionGroup> OptionGroups { get; set; } = null!;
        public OptionGroupFilterModel Filter { get; set; } = null!;
    }

    // Option Value
    public class OptionValueFilterModel
    {
        public string? Search { get; set; }
    }
    public class OptionValueIndexViewModel
    {
        public PaginatedList<OptionValue> OptionValues { get; set; } = null!;
        public OptionValueFilterModel Filter { get; set; } = null!;
    }

    // Review
    public class ReviewFilterModel
    {
        public string? Search { get; set; }
        public int? Rating { get; set; }
    }
    public class ReviewIndexViewModel
    {
        public PaginatedList<Review> Reviews { get; set; } = null!;
        public ReviewFilterModel Filter { get; set; } = null!;
    }

    // User
    public class UserFilterModel
    {
        public string? Search { get; set; }
    }
    public class UserIndexViewModel
    {
        public PaginatedList<User> Users { get; set; } = null!;
        public UserFilterModel Filter { get; set; } = null!;
    }
}
