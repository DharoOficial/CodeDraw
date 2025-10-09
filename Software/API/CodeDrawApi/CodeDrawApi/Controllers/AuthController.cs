using CodeDrawApi.DTOs;
using CodeDrawApi.Repositores;
using CodeDrawApi.Utils;
using Microsoft.AspNetCore.Mvc;

namespace CodeDrawApi.Controllers
{
    public class AuthController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        private readonly TokenService _tokenService;

        public AuthController(UserRepository userRepository, TokenService tokenService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            var user = await _userRepository.GetByEmailAsync(loginDto.Email);

            // ATENÇÃO: Comparação de senha em texto plano.
            // Em um projeto real, aqui você usaria uma biblioteca para verificar o hash da senha.
            if (user == null || user.Password != loginDto.Password)
            {
                return Unauthorized("Email ou senha inválidos.");
            }

            var token = _tokenService.GenerateToken(user);

            return Ok(new LoginResponseDto { Token = token });
        }
    }
}
