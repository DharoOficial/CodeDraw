using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CodeDrawApi.Models
{
    public class TaskModel
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O título é obrigatório.")]
        [StringLength(150, ErrorMessage = "O título deve ter no máximo 150 caracteres.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "A descrição é obrigatória.")]
        public string Description { get; set; }

        // Chave Estrangeira para o Professor (Usuário) que criou a tarefa.
        public Guid TeacherId { get; set; }

        // Propriedade de Navegação para o Entity Framework entender a relação.
        [ForeignKey("TeacherId")]
        public virtual UserModel Teacher { get; set; }

        // Uma tarefa pode ter várias submissões de diferentes alunos.
        public virtual ICollection<SubmissionModel> Submissions { get; set; }
    }
}
