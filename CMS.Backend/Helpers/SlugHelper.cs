namespace CMS.Backend.Helpers
{
    public static class SlugHelper
    {
        public static string Generate(string phrase)
        {
            return CMS.Data.Helpers.SlugHelper.Generate(phrase);
        }
    }
}
