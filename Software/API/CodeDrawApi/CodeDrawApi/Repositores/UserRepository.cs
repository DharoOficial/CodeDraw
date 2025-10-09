using CodeDrawApi.Models;
using CodeDrawApi.Utils;
using Microsoft.EntityFrameworkCore;

namespace CodeDrawApi.Repositores
{
    public class UserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(UserModel user)
        {
            await _context.Users.AddAsync(user);
        }

        public void Delete(UserModel user)
        {
            _context.Users.Remove(user);
        }

        public async Task<IEnumerable<UserModel>> GetAllAsync()
        {
            // O AsNoTracking melhora a performance para operações de apenas leitura.
            return await _context.Users.AsNoTracking().ToListAsync();
        }

        public async Task<UserModel?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<UserModel?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<bool> SaveChangesAsync()
        {
            // Retorna true se alguma linha foi afetada no banco de dados.
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(UserModel user)
        {
            // Apenas marca a entidade como modificada. O SaveChangesAsync irá persistir.
            _context.Users.Update(user);
        }
    }
}
