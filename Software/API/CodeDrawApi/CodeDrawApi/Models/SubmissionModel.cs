using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeDrawApi.Models
{
    public class SubmissionModel
    {
        /// <summary>
        /// Representa a resolução de uma tarefa por um aluno.
        /// Esta é a entidade que liga o Aluno à Tarefa.
        /// </summary>
        [Key]
        public Guid Id { get; set; }
        
        public Guid StudentId { get; set; }

        public Guid TaskId { get; set; }

        [Required]
        public string CodeBlock { get; set; }

        public DateTime DataSent { get; set; } = DateTime.UtcNow;

        // Propriedades de Navegação (Entity Framework)
        [ForeignKey("StudentId")]
        public virtual UserModel Student { get; set; }

        [ForeignKey("TaskId")]
        public virtual TaskModel Task { get; set; }
    }
}