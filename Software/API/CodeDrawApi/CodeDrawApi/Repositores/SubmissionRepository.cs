using CodeDrawApi.Models;
using CodeDrawApi.Utils;
using Microsoft.EntityFrameworkCore;

namespace CodeDrawApi.Repositores
{
    public class SubmissionRepository
    {
        private readonly AppDbContext _context;

        public SubmissionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(SubmissionModel submission)
        {
            await _context.Submissions.AddAsync(submission);
        }

        public void Delete(SubmissionModel submission)
        {
            _context.Submissions.Remove(submission);
        }

        public async Task<IEnumerable<SubmissionModel>> GetAllAsync()
        {
            return await _context.Submissions.AsNoTracking().ToListAsync();
        }

        public async Task<SubmissionModel?> GetByIdAsync(Guid id)
        {
            // Inclui o aluno e a tarefa relacionados à submissão.
            return await _context.Submissions
                .Include(s => s.Student)
                .Include(s => s.Task)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<SubmissionModel>> GetByTaskIdAsync(Guid taskId)
        {
            return await _context.Submissions
                .Where(s => s.TaskId == taskId)
                .Include(s => s.Student)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(SubmissionModel submission)
        {
            _context.Submissions.Update(submission);
        }
    }
}
