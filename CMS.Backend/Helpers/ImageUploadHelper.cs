using Microsoft.AspNetCore.Http;

namespace CMS.Backend.Helpers
{
    public sealed record ImageUploadResult(bool Succeeded, string? Url, string? ErrorMessage);

    public static class ImageUploadHelper
    {
        public const long DefaultMaxBytes = 5 * 1024 * 1024;

        private static readonly IReadOnlyDictionary<string, string[]> AllowedContentTypes =
            new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                [".jpg"] = new[] { "image/jpeg" },
                [".jpeg"] = new[] { "image/jpeg" },
                [".png"] = new[] { "image/png" },
                [".webp"] = new[] { "image/webp" },
                [".gif"] = new[] { "image/gif" }
            };

        public static ImageUploadResult SaveImage(
            IFormFile file,
            string relativeFolder = "uploads",
            string filePrefix = "image",
            long maxBytes = DefaultMaxBytes,
            bool allowGif = false)
        {
            var validationError = ValidateImage(file, maxBytes, allowGif, out var extension);
            if (validationError != null)
            {
                return new ImageUploadResult(false, null, validationError);
            }

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativeFolder);
            Directory.CreateDirectory(uploadsRoot);

            var safePrefix = NormalizeFilePrefix(filePrefix);
            var fileName = $"{safePrefix}-{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadsRoot, fileName);

            using (var stream = new FileStream(filePath, FileMode.CreateNew))
            {
                file.CopyTo(stream);
            }

            var urlPath = "/" + relativeFolder.Replace("\\", "/").Trim('/') + "/" + fileName;
            return new ImageUploadResult(true, urlPath, null);
        }

        public static bool IsSafeImageUrl(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            if (value.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return Uri.TryCreate(value, UriKind.Absolute, out var uri)
                && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
        }

        private static string? ValidateImage(IFormFile file, long maxBytes, bool allowGif, out string extension)
        {
            extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (file.Length <= 0)
            {
                return "File rỗng.";
            }

            if (file.Length > maxBytes)
            {
                return $"Ảnh không được vượt quá {maxBytes / 1024 / 1024}MB.";
            }

            if (!AllowedContentTypes.ContainsKey(extension) || (!allowGif && extension == ".gif"))
            {
                return allowGif
                    ? "Chỉ chấp nhận ảnh JPG, PNG, GIF hoặc WebP."
                    : "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.";
            }

            var contentType = file.ContentType?.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(contentType) || !AllowedContentTypes[extension].Contains(contentType))
            {
                return "Nội dung tệp không khớp định dạng ảnh đã chọn.";
            }

            if (!HasKnownImageSignature(file, extension))
            {
                return "Tệp tải lên không phải ảnh hợp lệ.";
            }

            return null;
        }

        private static bool HasKnownImageSignature(IFormFile file, string extension)
        {
            Span<byte> buffer = stackalloc byte[12];
            using var stream = file.OpenReadStream();
            var read = stream.Read(buffer);
            var bytes = buffer[..read];

            return extension switch
            {
                ".jpg" or ".jpeg" => bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
                ".png" => bytes.Length >= 8
                    && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47
                    && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A,
                ".gif" => bytes.Length >= 6
                    && bytes[0] == 0x47 && bytes[1] == 0x49 && bytes[2] == 0x46
                    && bytes[3] == 0x38 && (bytes[4] == 0x37 || bytes[4] == 0x39) && bytes[5] == 0x61,
                ".webp" => bytes.Length >= 12
                    && bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46
                    && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50,
                _ => false
            };
        }

        private static string NormalizeFilePrefix(string value)
        {
            var safe = new string(value
                .ToLowerInvariant()
                .Select(ch => char.IsLetterOrDigit(ch) || ch == '-' ? ch : '-')
                .ToArray())
                .Trim('-');

            return string.IsNullOrWhiteSpace(safe) ? "image" : safe;
        }
    }
}
