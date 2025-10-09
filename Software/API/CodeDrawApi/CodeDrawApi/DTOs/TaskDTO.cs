using System.ComponentModel.DataAnnotations;

namespace CodeDrawApi.DTOs
{
    public class CreateTaskDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public Guid TeacherId { get; set; }
    }

    public class UpdateTaskDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }
    }

    public class TaskResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Guid TeacherId { get; set; }
        public string? TeacherName { get; set; }
    }
}
