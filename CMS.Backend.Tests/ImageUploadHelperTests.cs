using CMS.Backend.Helpers;
using Microsoft.AspNetCore.Http;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace CMS.Backend.Tests
{
    public sealed class ImageUploadHelperTests : IDisposable
    {
        private readonly string _originalDirectory;
        private readonly string _tempDirectory;

        public ImageUploadHelperTests()
        {
            _originalDirectory = Directory.GetCurrentDirectory();
            _tempDirectory = Path.Combine(Path.GetTempPath(), $"cms-upload-tests-{Guid.NewGuid():N}");
            Directory.CreateDirectory(_tempDirectory);
            Directory.SetCurrentDirectory(_tempDirectory);
        }

        [Fact]
        public void SaveImage_AcceptsValidPng()
        {
            var file = CreateFormFile("menu.png", "image/png", PngBytes());

            var result = ImageUploadHelper.SaveImage(file, filePrefix: "menu");

            Assert.True(result.Succeeded);
            Assert.NotNull(result.Url);
            Assert.StartsWith("/uploads/menu-", result.Url);
            Assert.EndsWith(".png", result.Url);
            Assert.True(File.Exists(Path.Combine(_tempDirectory, "wwwroot", result.Url.TrimStart('/'))));
        }

        [Fact]
        public void SaveImage_RejectsMismatchedContentType()
        {
            var file = CreateFormFile("menu.png", "text/plain", PngBytes());

            var result = ImageUploadHelper.SaveImage(file);

            Assert.False(result.Succeeded);
            Assert.Contains("không khớp", result.ErrorMessage);
        }

        [Fact]
        public void SaveImage_RejectsRenamedNonImage()
        {
            var file = CreateFormFile("payload.png", "image/png", new byte[] { 0x4D, 0x5A, 0x90, 0x00 });

            var result = ImageUploadHelper.SaveImage(file);

            Assert.False(result.Succeeded);
            Assert.Contains("không phải ảnh", result.ErrorMessage);
        }

        [Fact]
        public void SaveImage_RejectsOversizedFile()
        {
            var bytes = PngBytes().Concat(new byte[32]).ToArray();
            var file = CreateFormFile("large.png", "image/png", bytes);

            var result = ImageUploadHelper.SaveImage(file, maxBytes: 8);

            Assert.False(result.Succeeded);
            Assert.Contains("vượt quá", result.ErrorMessage);
        }

        [Theory]
        [InlineData("/uploads/product.png", true)]
        [InlineData("https://example.com/product.png", true)]
        [InlineData("http://example.com/product.png", true)]
        [InlineData("javascript:alert(1)", false)]
        [InlineData("/admin/private.png", false)]
        public void IsSafeImageUrl_OnlyAllowsUploadOrHttpUrls(string value, bool expected)
        {
            Assert.Equal(expected, ImageUploadHelper.IsSafeImageUrl(value));
        }

        public void Dispose()
        {
            Directory.SetCurrentDirectory(_originalDirectory);
            Directory.Delete(_tempDirectory, recursive: true);
        }

        private static FormFile CreateFormFile(string fileName, string contentType, byte[] bytes)
        {
            var stream = new MemoryStream(bytes);
            return new FormFile(stream, 0, bytes.Length, "upload", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = contentType
            };
        }

        private static byte[] PngBytes()
        {
            return new byte[]
            {
                0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D
            };
        }
    }
}
