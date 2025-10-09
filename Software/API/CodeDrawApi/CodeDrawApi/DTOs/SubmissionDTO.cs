using System.ComponentModel.DataAnnotations;

namespace CodeDrawApi.DTOs
{
    public class CreateSubmissionDto
    {
        [Required]
        public Guid StudentId { get; set; }

        [Required]
        public Guid TaskId { get; set; }

        [Required]
        public string CodeBlock { get; set; }
    }

    public class SubmissionResponseDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public Guid TaskId { get; set; }
        public string CodeBlock { get; set; }
        public DateTime DataSent { get; set; }
        public string? StudentName { get; set; }
    }
}
