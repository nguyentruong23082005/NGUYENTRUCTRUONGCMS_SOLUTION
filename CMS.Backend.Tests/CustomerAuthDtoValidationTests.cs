using System.ComponentModel.DataAnnotations;
using CMS.Backend.Models.Dtos;

namespace CMS.Backend.Tests
{
    public sealed class CustomerAuthDtoValidationTests
    {
        [Theory]
        [InlineData("huongdan")]
        [InlineData("huongdan@")]
        [InlineData("huongdan@example")]
        [InlineData("huongdannaptheff@gmai.co")]
        [InlineData("huongdannaptheff@gmail.co")]
        [InlineData("huongdannaptheff@gmal.com")]
        public void RegisterDto_ShouldRejectInvalidEmails(string email)
        {
            var dto = new RegisterDto
            {
                FullName = "Nguyen Van A",
                Email = email,
                Password = "123456"
            };

            var results = Validate(dto);

            Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterDto.Email)));
        }

        [Fact]
        public void RegisterDto_ShouldAcceptValidEmail()
        {
            var dto = new RegisterDto
            {
                FullName = "Nguyen Van A",
                Email = "test@example.com",
                Password = "123456"
            };

            var results = Validate(dto);

            Assert.DoesNotContain(results, result => result.MemberNames.Contains(nameof(RegisterDto.Email)));
        }

        [Theory]
        [InlineData("26514")]
        [InlineData("012345678")]
        [InlineData("012345678901")]
        [InlineData("01234abcde")]
        public void RegisterDto_ShouldRejectInvalidVietnamesePhoneNumbers(string phone)
        {
            var dto = new RegisterDto
            {
                FullName = "Nguyen Van A",
                Email = "test@example.com",
                Phone = phone,
                Password = "123456"
            };

            var results = Validate(dto);

            Assert.Contains(results, result => result.MemberNames.Contains(nameof(RegisterDto.Phone)));
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("0123456789")]
        [InlineData("01234567890")]
        public void RegisterDto_ShouldAcceptEmptyOrValidVietnamesePhoneNumbers(string? phone)
        {
            var dto = new RegisterDto
            {
                FullName = "Nguyen Van A",
                Email = "test@example.com",
                Phone = phone,
                Password = "123456"
            };

            var results = Validate(dto);

            Assert.DoesNotContain(results, result => result.MemberNames.Contains(nameof(RegisterDto.Phone)));
        }

        private static List<ValidationResult> Validate(object model)
        {
            var context = new ValidationContext(model);
            var results = new List<ValidationResult>();
            Validator.TryValidateObject(model, context, results, validateAllProperties: true);
            return results;
        }
    }
}
