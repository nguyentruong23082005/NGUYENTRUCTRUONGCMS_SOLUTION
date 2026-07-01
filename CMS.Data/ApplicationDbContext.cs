using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;

namespace CMS.Data
{
    // Lớp trung gian giữa C# và database, mỗi DbSet tương ứng một bảng.
    public class ApplicationDbContext : DbContext
    {
        // Nhận cấu hình kết nối database từ Program.cs (Dependency Injection).
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<PostCategory> PostCategories { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }

        public DbSet<CustomerAddress> CustomerAddresses { get; set; }
        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<CustomerVoucher> CustomerVouchers { get; set; }
        public DbSet<OptionGroup> OptionGroups { get; set; }
        public DbSet<OptionValue> OptionValues { get; set; }
        public DbSet<ProductOptionGroup> ProductOptionGroups { get; set; }
        public DbSet<OrderDetailOption> OrderDetailOptions { get; set; }
        public DbSet<Store> Stores { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<Banner> Banners { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Khóa chính kép cho các bảng trung gian (nhiều-nhiều)

            // CustomerVoucher: một khách không nhận trùng cùng một voucher.
            modelBuilder.Entity<CustomerVoucher>()
                .HasKey(cv => new { cv.CustomerId, cv.VoucherId });

            // FK: CustomerVoucher -> Customer.
            modelBuilder.Entity<CustomerVoucher>()
                .HasOne(cv => cv.Customer)
                .WithMany(c => c.CustomerVouchers)
                .HasForeignKey(cv => cv.CustomerId)
                .IsRequired(false);

            // FK: CustomerVoucher -> Voucher.
            modelBuilder.Entity<CustomerVoucher>()
                .HasOne(cv => cv.Voucher)
                .WithMany(v => v.CustomerVouchers)
                .HasForeignKey(cv => cv.VoucherId)
                .IsRequired(false);

            // ProductOptionGroup: một sản phẩm không gắn trùng cùng một nhóm tùy chọn.
            modelBuilder.Entity<ProductOptionGroup>()
                .HasKey(pog => new { pog.ProductId, pog.OptionGroupId });

            // FK: ProductOptionGroup -> Product.
            modelBuilder.Entity<ProductOptionGroup>()
                .HasOne(pog => pog.Product)
                .WithMany(p => p.ProductOptionGroups)
                .HasForeignKey(pog => pog.ProductId)
                .IsRequired(false);

            // FK: ProductOptionGroup -> OptionGroup.
            modelBuilder.Entity<ProductOptionGroup>()
                .HasOne(pog => pog.OptionGroup)
                .WithMany(og => og.ProductOptionGroups)
                .HasForeignKey(pog => pog.OptionGroupId)
                .IsRequired(false);

            // OrderDetailOption: một dòng chi tiết đơn hàng không lưu trùng cùng một option.
            modelBuilder.Entity<OrderDetailOption>()
                .HasKey(odo => new { odo.OrderDetailId, odo.OptionValueId });

            // FK: OrderDetailOption -> OrderDetail.
            modelBuilder.Entity<OrderDetailOption>()
                .HasOne(odo => odo.OrderDetail)
                .WithMany(od => od.OrderDetailOptions)
                .HasForeignKey(odo => odo.OrderDetailId)
                .OnDelete(DeleteBehavior.Cascade);

            // FK: OrderDetailOption -> OptionValue.
            modelBuilder.Entity<OrderDetailOption>()
                .HasOne(odo => odo.OptionValue)
                .WithMany(ov => ov.OrderDetailOptions)
                .HasForeignKey(odo => odo.OptionValueId)
                .IsRequired(false);

            // Unique Index: mã voucher không được trùng nhau.
            modelBuilder.Entity<Voucher>()
                .HasIndex(v => v.Code)
                .IsUnique();

            // Unique Index: tránh import trùng cùng một banner ở cùng vị trí.
            modelBuilder.Entity<Banner>()
                .HasIndex(b => new { b.ImageUrl, b.Position })
                .IsUnique();

            // Unique Index: tránh trùng bài viết cào từ Phúc Long
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.ExternalId)
                .IsUnique()
                .HasFilter("[ExternalId] IS NOT NULL");

            // Unique Index: tránh trùng cửa hàng cào từ Phúc Long
            modelBuilder.Entity<Store>()
                .HasIndex(s => s.StoreCode)
                .IsUnique()
                .HasFilter("[StoreCode] IS NOT NULL");

            // Unique Index: mỗi khách chỉ đánh giá 1 sản phẩm tối đa 1 lần.
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.CustomerId, r.ProductId })
                .IsUnique();

            // Configure Slugs (Buổi 6)
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Slug).HasMaxLength(150).IsRequired();
                entity.HasIndex(p => p.Slug).IsUnique();
            });

            modelBuilder.Entity<Post>(entity =>
            {
                entity.Property(p => p.Slug).HasMaxLength(150).IsRequired();
                entity.HasIndex(p => p.Slug).IsUnique();
            });

            modelBuilder.Entity<ProductCategory>(entity =>
            {
                entity.Property(c => c.Slug).HasMaxLength(150).IsRequired();
                entity.HasIndex(c => c.Slug).IsUnique();

                entity.HasOne(c => c.Parent)
                      .WithMany(c => c.Children)
                      .HasForeignKey(c => c.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PostCategory>(entity =>
            {
                entity.Property(c => c.Slug).HasMaxLength(150).IsRequired();
                entity.HasIndex(c => c.Slug).IsUnique();

                entity.HasOne(c => c.Parent)
                      .WithMany(c => c.Children)
                      .HasForeignKey(c => c.ParentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Tự động ẩn bản ghi đã xóa mềm (IsDeleted = true) khỏi mọi truy vấn.
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .HasQueryFilter(ConvertFilterExpression<BaseEntity>(e => !e.IsDeleted, entityType.ClrType));
                }
            }
        }

        // Chuyển biểu thức lọc từ BaseEntity sang đúng entity cụ thể (Product, Customer,...).
        private static LambdaExpression ConvertFilterExpression<TInterface>(
            Expression<Func<TInterface, bool>> filterExpression, Type entityType)
        {
            var newParam = Expression.Parameter(entityType);
            var newBody = ReplacingExpressionVisitor.Replace(filterExpression.Parameters.Single(), newParam, filterExpression.Body);
            return Expression.Lambda(newBody, newParam);
        }

        // Override SaveChanges để tự xử lý audit, soft delete và sinh slug trước khi lưu DB.
        public override int SaveChanges()
        {
            GenerateSlugs();
            ApplyAuditAndSoftDelete();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            GenerateSlugs();
            ApplyAuditAndSoftDelete();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void GenerateSlugs()
        {
            var entries = ChangeTracker.Entries();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added || entry.State == EntityState.Modified)
                {
                    if (entry.Entity is Product product)
                    {
                        var nameProperty = entry.Property(nameof(Product.Name));
                        if (string.IsNullOrWhiteSpace(product.Slug) || nameProperty.IsModified)
                        {
                            product.Slug = EnsureUniqueProductSlug(product.Name, product.Id);
                        }
                    }
                    else if (entry.Entity is Post post)
                    {
                        var titleProperty = entry.Property(nameof(Post.Title));
                        if (string.IsNullOrWhiteSpace(post.Slug) || titleProperty.IsModified)
                        {
                            post.Slug = EnsureUniquePostSlug(post.Title, post.Id);
                        }
                    }
                    else if (entry.Entity is ProductCategory productCategory)
                    {
                        var nameProperty = entry.Property(nameof(ProductCategory.Name));
                        if (string.IsNullOrWhiteSpace(productCategory.Slug) || nameProperty.IsModified)
                        {
                            productCategory.Slug = EnsureUniqueProductCategorySlug(productCategory.Name, productCategory.Id);
                        }
                    }
                    else if (entry.Entity is PostCategory postCategory)
                    {
                        var nameProperty = entry.Property(nameof(PostCategory.Name));
                        if (string.IsNullOrWhiteSpace(postCategory.Slug) || nameProperty.IsModified)
                        {
                            postCategory.Slug = EnsureUniquePostCategorySlug(postCategory.Name, postCategory.Id);
                        }
                    }
                }
            }
        }

        private string EnsureUniqueProductSlug(string name, int id)
        {
            var baseSlug = CMS.Data.Helpers.SlugHelper.Generate(name);
            var slug = baseSlug;
            var counter = 1;
            while (Products.IgnoreQueryFilters().Any(p => p.Slug == slug && p.Id != id))
            {
                slug = $"{baseSlug}-{counter++}";
            }
            return slug;
        }

        private string EnsureUniquePostSlug(string title, int id)
        {
            var baseSlug = CMS.Data.Helpers.SlugHelper.Generate(title);
            var slug = baseSlug;
            var counter = 1;
            while (Posts.IgnoreQueryFilters().Any(p => p.Slug == slug && p.Id != id))
            {
                slug = $"{baseSlug}-{counter++}";
            }
            return slug;
        }

        private string EnsureUniqueProductCategorySlug(string name, int id)
        {
            var baseSlug = CMS.Data.Helpers.SlugHelper.Generate(name);
            var slug = baseSlug;
            var counter = 1;
            while (ProductCategories.IgnoreQueryFilters().Any(c => c.Slug == slug && c.Id != id))
            {
                slug = $"{baseSlug}-{counter++}";
            }
            return slug;
        }

        private string EnsureUniquePostCategorySlug(string name, int id)
        {
            var baseSlug = CMS.Data.Helpers.SlugHelper.Generate(name);
            var slug = baseSlug;
            var counter = 1;
            while (PostCategories.IgnoreQueryFilters().Any(c => c.Slug == slug && c.Id != id))
            {
                slug = $"{baseSlug}-{counter++}";
            }
            return slug;
        }

        // Tự động gán CreatedAt/UpdatedAt và chuyển Delete thành xóa mềm.
        private void ApplyAuditAndSoftDelete()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            foreach (var entry in entries)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = DateTime.UtcNow;
                        entry.Entity.IsDeleted = false;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = DateTime.UtcNow;
                        break;
                    case EntityState.Deleted:
                        // Không xóa thật, đổi thành UPDATE với IsDeleted = true.
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDeleted = true;
                        entry.Entity.DeletedAt = DateTime.UtcNow;
                        break;
                }
            }
        }
    }
}
