using CodeDrawApi.DTOs;
using CodeDrawApi.Models;
using CodeDrawApi.Repositores;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeDrawApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        // Alterado de IUserRepository para a classe concreta UserRepository
        private readonly UserRepository _userRepository;

        // O construtor agora recebe a classe concreta
        public UsersController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // GET: api/users
        [HttpGet]
        [Authorize(Policy = "AlunoProfessorPolicy")]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            var users = await _userRepository.GetAllAsync();
            var userDtos = users.Select(u => new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Turma = u.Turma
            });
            return Ok(userDtos);
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        [Authorize(Policy = "AlunoProfessorPolicy")]
        public async Task<ActionResult<UserResponseDto>> GetUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };

            return Ok(userDto);
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<UserResponseDto>> PostUser(CreateUserDto createUserDto)
        {
            var user = new UserModel
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                Password = createUserDto.Password,
                Role = Utils.Roles.Aluno
            };
            var emailExiste = await _userRepository.GetByEmailAsync(user.Email);

            if (emailExiste != null)
            {
                return Conflict(new { message = "O e-mail informado já está cadastrado." });
            }

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            var userResponseDto = new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            };

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userResponseDto);
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> PutUser(Guid id, UpdateUserDto updateUserDto)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Name = updateUserDto.Name;
            user.Email = updateUserDto.Email;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(user);
        }

        //PUT: api/users/turma/{id}
        [HttpPut("turma/{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> PutUserTurma(Guid id, UpdateTurmaUserDTO updateTurmaUserDTO)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Turma = updateTurmaUserDTO.Turma;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(user);
        }

        //PUT: api/users/turma/{id}
        [HttpPut("role/{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> PutUserRole(Guid id, UpdateRoleUserDTO updateRoleUserDTO)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.Role = updateRoleUserDTO.Role;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(user);
        }


        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        [Authorize(Policy = "AdminPolicy")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            _userRepository.Delete(user);
            await _userRepository.SaveChangesAsync();

            return Ok(user);
        }
    }
}
