using CMS.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace CMS.Backend.Helpers
{
    public static class PasswordHasher
    {
        private static readonly PasswordHasher<Customer> _hasher = new();

        public static string Hash(Customer customer, string password)
        {
            return _hasher.HashPassword(customer, password);
        }

        public static bool Verify(Customer customer, string hashedPassword, string providedPassword)
        {
            if (string.IsNullOrEmpty(hashedPassword) || string.IsNullOrEmpty(providedPassword))
                return false;

            return _hasher.VerifyHashedPassword(customer, hashedPassword, providedPassword) != PasswordVerificationResult.Failed;
        }
    }
}
