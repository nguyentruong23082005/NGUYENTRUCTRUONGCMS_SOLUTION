using CMS.Backend.Controllers.Api;
using CMS.Backend.Models.Api;
using CMS.Backend.Services.Api;
using CMS.Data;
using CMS.Data.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS.Backend.Tests
{
    public sealed class ProductSearchServiceTests
    {
        [Fact]
        public async Task GetPagedAsync_SearchesProductNameDescriptionAndCategoryName()
        {
            await using var db = CreateDbContext();
            var teaCategory = new ProductCategory
            {
                Name = "Tra sua",
                Slug = "tra-sua"
            };
            var cakeCategory = new ProductCategory
            {
                Name = "Banh ngot",
                Slug = "banh-ngot"
            };

            db.ProductCategories.AddRange(teaCategory, cakeCategory);
            await db.SaveChangesAsync();

            db.Products.AddRange(
                new Product
                {
                    Name = "Oolong vai",
                    Description = "Huong vai tuoi",
                    Price = 45000,
                    StockQuantity = 10,
                    Slug = "oolong-vai",
                    ProductCategoryId = teaCategory.Id
                },
                new Product
                {
                    Name = "Chocolate cake",
                    Description = "Banh kem cacao",
                    Price = 55000,
                    StockQuantity = 5,
                    Slug = "chocolate-cake",
                    ProductCategoryId = cakeCategory.Id
                });
            await db.SaveChangesAsync();

            var service = new ProductApiService(db);

            var result = await service.GetPagedAsync(new ProductQuery
            {
                Keyword = "tra",
                Page = 1,
                PageSize = 12
            });

            Assert.Single(result.Items);
            Assert.Equal("Oolong vai", result.Items.Single().Name);
        }

        [Fact]
        public async Task GetPagedAsync_AppliesSearchWithPriceRange()
        {
            await using var db = CreateDbContext();
            var category = new ProductCategory
            {
                Name = "Tra trai cay",
                Slug = "tra-trai-cay"
            };
            db.ProductCategories.Add(category);
            await db.SaveChangesAsync();

            db.Products.AddRange(
                new Product
                {
                    Name = "Tra dao",
                    Description = "Dao tuoi",
                    Price = 39000,
                    StockQuantity = 10,
                    Slug = "tra-dao",
                    ProductCategoryId = category.Id
                },
                new Product
                {
                    Name = "Tra vai dac biet",
                    Description = "Size lon",
                    Price = 59000,
                    StockQuantity = 8,
                    Slug = "tra-vai-dac-biet",
                    ProductCategoryId = category.Id
                });
            await db.SaveChangesAsync();

            var service = new ProductApiService(db);

            var result = await service.GetPagedAsync(new ProductQuery
            {
                Keyword = "tra",
                MinPrice = 50000,
                MaxPrice = 65000,
                Page = 1,
                PageSize = 12
            });

            Assert.Single(result.Items);
            Assert.Equal("Tra vai dac biet", result.Items.Single().Name);
        }

        private static ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase($"product-search-{Guid.NewGuid():N}")
                .Options;

            return new ApplicationDbContext(options);
        }
    }

    public sealed class ProductsControllerSearchTests
    {
        [Fact]
        public async Task Search_MapsQParameterToKeywordAndReturnsPagedResult()
        {
            var service = new CapturingProductApiService();
            var controller = new ProductsController(service);

            var response = await controller.Search("tra dao", new ProductQuery
            {
                Page = 2,
                PageSize = 5,
                MinPrice = 30000,
                MaxPrice = 60000
            });

            var okResult = Assert.IsType<OkObjectResult>(response);
            var apiResponse = Assert.IsType<ApiResponse>(okResult.Value);

            Assert.True(apiResponse.Success);
            Assert.Equal("tra dao", service.CapturedQuery?.Keyword);
            Assert.Equal(2, service.CapturedQuery?.Page);
            Assert.Equal(5, service.CapturedQuery?.PageSize);
            Assert.Equal(30000, service.CapturedQuery?.MinPrice);
            Assert.Equal(60000, service.CapturedQuery?.MaxPrice);
        }

        private sealed class CapturingProductApiService : IProductApiService
        {
            public ProductQuery? CapturedQuery { get; private set; }

            public Task<PagedResult<CMS.Backend.Models.Dtos.ProductDto>> GetPagedAsync(ProductQuery query)
            {
                CapturedQuery = query;
                return Task.FromResult(new PagedResult<CMS.Backend.Models.Dtos.ProductDto>(
                    Array.Empty<CMS.Backend.Models.Dtos.ProductDto>(),
                    query.Page,
                    query.PageSize,
                    0));
            }

            public Task<CMS.Backend.Models.Dtos.ProductDto?> GetByIdAsync(int id)
            {
                return Task.FromResult<CMS.Backend.Models.Dtos.ProductDto?>(null);
            }

            public Task<CMS.Backend.Models.Dtos.ProductDto?> GetBySlugAsync(string slug)
            {
                return Task.FromResult<CMS.Backend.Models.Dtos.ProductDto?>(null);
            }
        }
    }
}
