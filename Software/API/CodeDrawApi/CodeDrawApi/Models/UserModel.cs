using CodeDrawApi.Utils;
using System.ComponentModel.DataAnnotations;

namespace CodeDrawApi.Models
{
    public class UserModel
    {
        public UserModel(string name, string email, string password) { 
            Name = name;
            Email = email;
            Password = password;
        }
        public UserModel()
        {
            
        }
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "O nome é obrigatório.")]
        [StringLength(150, ErrorMessage = "O nome deve ter no máximo 150 caracteres.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "O email é obrigatório.")]
        [EmailAddress(ErrorMessage = "Email em formato inválido.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "A senha é obrigatória")]
        public string Password { get; set; }
        public Roles Role {  get; set; }

        public int Turma { get; set; }

        public virtual ICollection<TaskModel> CreatedTasks { get; set; }
        public virtual ICollection<SubmissionModel> Submissions { get; set; }

    }
}
