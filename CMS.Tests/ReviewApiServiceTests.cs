using CMS.Backend.Models.Dtos;
using CMS.Backend.Services.Api;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CMS.Tests
{
    public class ReviewApiServiceTests
    {
        private ApplicationDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task CreateReviewAsync_ProductNotFound_ThrowsException()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new ReviewApiService(db);
            int customerId = 1;

            var dto = new CreateReviewDto { ProductId = 99, Rating = 5, Comment = "Good" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateReviewAsync(customerId, dto));
            Assert.Equal("Sản phẩm không tồn tại.", ex.Message);
        }

        [Fact]
        public async Task CreateReviewAsync_CustomerNotFound_ThrowsException()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new ReviewApiService(db);
            int customerId = 99;

            var p = new Product { Name = "Tea", Price = 30000, StockQuantity = 10, Slug = "tea" };
            db.Products.Add(p);
            await db.SaveChangesAsync();

            var dto = new CreateReviewDto { ProductId = p.Id, Rating = 5, Comment = "Good" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateReviewAsync(customerId, dto));
            Assert.Equal("Khách hàng không tồn tại hoặc đã bị xóa.", ex.Message);
        }

        [Fact]
        public async Task CreateReviewAsync_AlreadyReviewed_ThrowsException()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new ReviewApiService(db);

            var customer = new Customer { FullName = "Nguyen Van A", Email = "a@a.com" };
            var p = new Product { Name = "Tea", Price = 30000, StockQuantity = 10, Slug = "tea" };
            db.Customers.Add(customer);
            db.Products.Add(p);
            await db.SaveChangesAsync();

            // Seed an existing review
            var review = new Review { CustomerId = customer.Id, ProductId = p.Id, Rating = 4, Comment = "First review" };
            db.Reviews.Add(review);
            await db.SaveChangesAsync();

            var dto = new CreateReviewDto { ProductId = p.Id, Rating = 5, Comment = "Another review" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateReviewAsync(customer.Id, dto));
            Assert.Equal("Bạn đã đánh giá sản phẩm này rồi.", ex.Message);
        }

        [Fact]
        public async Task CreateReviewAsync_HasNotPurchased_ThrowsException()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new ReviewApiService(db);

            var customer = new Customer { FullName = "Nguyen Van A", Email = "a@a.com" };
            var p = new Product { Name = "Tea", Price = 30000, StockQuantity = 10, Slug = "tea" };
            db.Customers.Add(customer);
            db.Products.Add(p);
            await db.SaveChangesAsync();

            // Order exists but is in Pending state (not Completed/Delivered)
            var order = new Order { CustomerId = customer.Id, Status = OrderStatus.Pending };
            order.OrderDetails.Add(new OrderDetail { ProductId = p.Id, Quantity = 1, UnitPrice = 30000 });
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var dto = new CreateReviewDto { ProductId = p.Id, Rating = 5, Comment = "Excellent tea" };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateReviewAsync(customer.Id, dto));
            Assert.Equal("Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng và đơn hàng được hoàn thành hoặc giao hàng thành công.", ex.Message);
        }

        [Fact]
        public async Task CreateReviewAsync_ValidReview_Succeeds()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new ReviewApiService(db);

            var customer = new Customer { FullName = "Nguyen Van A", Email = "a@a.com" };
            var p = new Product { Name = "Tea", Price = 30000, StockQuantity = 10, Slug = "tea" };
            db.Customers.Add(customer);
            db.Products.Add(p);
            await db.SaveChangesAsync();

            // Order is Completed
            var order = new Order { CustomerId = customer.Id, Status = OrderStatus.Completed };
            order.OrderDetails.Add(new OrderDetail { ProductId = p.Id, Quantity = 1, UnitPrice = 30000 });
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            var dto = new CreateReviewDto { ProductId = p.Id, Rating = 5, Comment = "Excellent tea" };

            // Act
            var result = await service.CreateReviewAsync(customer.Id, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Nguyen Van A", result.CustomerName);
            Assert.Equal(5, result.Rating);
            Assert.Equal("Excellent tea", result.Comment);

            var reviewInDb = await db.Reviews.FirstOrDefaultAsync(r => r.Id == result.Id);
            Assert.NotNull(reviewInDb);
            Assert.Equal(customer.Id, reviewInDb.CustomerId);
            Assert.Equal(p.Id, reviewInDb.ProductId);
        }

        [Fact]
        public async Task GetProductReviewsAsync_ReturnsPagedReviews()
        {
            // Arrange
            using var db = CreateInMemoryDbContext();
            var service = new ReviewApiService(db);
            int productId = 1;

            var c1 = new Customer { FullName = "User 1", Email = "u1@test.com" };
            var c2 = new Customer { FullName = "User 2", Email = "u2@test.com" };
            db.Customers.AddRange(c1, c2);
            await db.SaveChangesAsync();

            var r1 = new Review { ProductId = productId, CustomerId = c1.Id, Rating = 4, Comment = "Nice" };
            var r2 = new Review { ProductId = productId, CustomerId = c2.Id, Rating = 5, Comment = "Super" };
            db.Reviews.AddRange(r1, r2);
            await db.SaveChangesAsync();

            r1.CreatedAt = DateTime.UtcNow.AddMinutes(-5);
            await db.SaveChangesAsync();

            // Act
            var result = await service.GetProductReviewsAsync(productId, page: 1, pageSize: 10);

            // Assert
            Assert.Equal(2, result.Count);
            // Verify ordering by descending CreatedAt
            Assert.Equal("User 2", result.First().CustomerName);
            Assert.Equal("Super", result.First().Comment);
        }
    }
}
