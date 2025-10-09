using CodeDrawApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CodeDrawApi.Utils
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Define as tabelas que o Entity Framework irá criar no banco de dados.
        public DbSet<UserModel> Users { get; set; }
        public DbSet<TaskModel> Tasks { get; set; }
        public DbSet<SubmissionModel> Submissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relação: UserModel(Professor) -> TaskModel
            // Um professor (User) pode criar muitas tarefas (Tasks).
            // Uma tarefa é criada por apenas um professor.
            modelBuilder.Entity<TaskModel>()
                .HasOne(task => task.Teacher)
                .WithMany(user => user.CreatedTasks) 
                .HasForeignKey(task => task.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relação: UserModel(Aluno) -> SubmissionModel
            // Um aluno (User) pode fazer muitas submissões.
            // Uma submissão pertence a apenas um aluno.
            modelBuilder.Entity<SubmissionModel>()
                .HasOne(submission => submission.Student)
                .WithMany(user => user.Submissions) 
                .HasForeignKey(submission => submission.StudentId)
                .OnDelete(DeleteBehavior.Cascade); 

            // Relação: TaskModel -> SubmissionModel
            // Uma tarefa pode ter muitas submissões.
            // Uma submissão pertence a apenas uma tarefa.
            modelBuilder.Entity<SubmissionModel>()
                .HasOne(submission => submission.Task)
                .WithMany(task => task.Submissions) 
                .HasForeignKey(submission => submission.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

}