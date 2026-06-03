using System.Text.RegularExpressions;

namespace CMS.Data.Helpers
{
    public static class SlugHelper
    {
        public static string Generate(string phrase)
        {
            if (string.IsNullOrWhiteSpace(phrase))
                return string.Empty;

            string str = phrase.ToLower().Trim();

            // Loại bỏ dấu tiếng Việt
            str = Regex.Replace(str, @"[áàảãạăắằẳẵặâấầẩẫậ]", "a");
            str = Regex.Replace(str, @"[éèẻẽẹêếềểễệ]", "e");
            str = Regex.Replace(str, @"[íìỉĩị]", "i");
            str = Regex.Replace(str, @"[óòỏõọôốồổỗộơớờởỡợ]", "o");
            str = Regex.Replace(str, @"[úùủũụưứừửữự]", "u");
            str = Regex.Replace(str, @"[ýỳỷỹỵ]", "y");
            str = Regex.Replace(str, @"[đ]", "d");

            // Loại bỏ ký tự đặc biệt
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");

            // Thay khoảng trắng/nhiều gạch ngang bằng 1 gạch ngang
            str = Regex.Replace(str, @"[\s-]+", "-");

            // Loại bỏ gạch ngang thừa ở đầu/cuối
            str = str.Trim('-');

            return str;
        }
    }
}
