using CMS.Backend.Helpers;
using CMS.Data.Entities;
using Xunit;

namespace CMS.Tests
{
    public class PasswordHasherTests
    {
        [Fact]
        public void HashAndPassword_ShouldVerifySuccessfully()
        {
            // Arrange
            var customer = new Customer { Email = "test@example.com" };
            var password = "SuperSecurePassword123";

            // Act
            var hash = PasswordHasher.Hash(customer, password);
            var isVerified = PasswordHasher.Verify(customer, hash, password);

            // Assert
            Assert.True(isVerified);
            Assert.NotEmpty(hash);
            Assert.NotEqual(password, hash);
        }

        [Fact]
        public void IncorrectPassword_ShouldNotVerify()
        {
            // Arrange
            var customer = new Customer { Email = "test@example.com" };
            var password = "SuperSecurePassword123";
            var wrongPassword = "WrongPassword123";

            // Act
            var hash = PasswordHasher.Hash(customer, password);
            var isVerified = PasswordHasher.Verify(customer, hash, wrongPassword);

            // Assert
            Assert.False(isVerified);
        }

        [Theory]
        [InlineData("", "password")]
        [InlineData("hash", "")]
        [InlineData("", "")]
        [InlineData(null, "password")]
        [InlineData("hash", null)]
        public void EmptyOrNullValues_ShouldReturnFalse(string? hash, string? password)
        {
            // Arrange
            var customer = new Customer { Email = "test@example.com" };

            // Act
            var isVerified = PasswordHasher.Verify(customer, hash!, password!);

            // Assert
            Assert.False(isVerified);
        }
    }
}
