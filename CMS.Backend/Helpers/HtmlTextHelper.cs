using System.Net;
using System.Text.RegularExpressions;

namespace CMS.Backend.Helpers
{
    public static class HtmlTextHelper
    {
        public static string StripHtml(string? html)
        {
            if (string.IsNullOrWhiteSpace(html)) return string.Empty;

            // Xóa toàn bộ tag HTML
            var withoutTags = Regex.Replace(html, "<.*?>", " ");
            
            // Decode các thực thể HTML (ví dụ: &amp; -> &)
            var decoded = WebUtility.HtmlDecode(withoutTags);
            
            // Thu gọn khoảng trắng thừa
            return Regex.Replace(decoded, @"\s+", " ").Trim();
        }
    }
}
