using CodeDrawApi.Models;
using CodeDrawApi.Utils;
using Microsoft.EntityFrameworkCore;

namespace CodeDrawApi.Repositores
{
    public class TaskRepository
    {
        private readonly AppDbContext _context;

        public TaskRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(TaskModel task)
        {
            await _context.Tasks.AddAsync(task);
        }

        public void Delete(TaskModel task)
        {
            _context.Tasks.Remove(task);
        }

        public async Task<IEnumerable<TaskModel>> GetAllAsync()
        {
            return await _context.Tasks.AsNoTracking().ToListAsync();
        }

        public async Task<TaskModel?> GetByIdAsync(Guid id)
        {
            // Usamos o Include para carregar dados relacionados (o professor que criou a tarefa).
            return await _context.Tasks
                .Include(t => t.Teacher)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(TaskModel task)
        {
            _context.Tasks.Update(task);
        }
    }
}
