using System;
using System.ComponentModel.DataAnnotations;

namespace CMS.Backend.Models.Dtos
{
    public sealed class ReviewDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public sealed class CreateReviewDto
    {
        [Required(ErrorMessage = "Mã sản phẩm không được để trống")]
        public int ProductId { get; set; }

        [Required(ErrorMessage = "Đánh giá sao không được để trống")]
        [Range(1, 5, ErrorMessage = "Đánh giá phải từ 1 đến 5 sao")]
        public int Rating { get; set; }

        [StringLength(500, ErrorMessage = "Nội dung đánh giá không vượt quá 500 ký tự")]
        public string? Comment { get; set; }
    }
}
