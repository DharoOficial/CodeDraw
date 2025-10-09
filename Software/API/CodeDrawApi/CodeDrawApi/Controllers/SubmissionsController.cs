using CodeDrawApi.DTOs;
using CodeDrawApi.Models;
using CodeDrawApi.Repositores;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeDrawApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : ControllerBase
    {
        // Alterado de ISubmissionRepository para a classe concreta SubmissionRepository
        private readonly SubmissionRepository _submissionRepository;

        // O construtor agora recebe a classe concreta
        public SubmissionsController(SubmissionRepository submissionRepository)
        {
            _submissionRepository = submissionRepository;
        }

        // GET: api/submissions/{id}
        [HttpGet("{id}")]
        [Authorize(Policy = "AlunoProfessorPolicy")]
        public async Task<ActionResult<SubmissionResponseDto>> GetSubmission(Guid id)
        {
            var submission = await _submissionRepository.GetByIdAsync(id);

            if (submission == null)
            {
                return NotFound();
            }

            var dto = new SubmissionResponseDto
            {
                Id = submission.Id,
                StudentId = submission.StudentId,
                TaskId = submission.TaskId,
                CodeBlock = submission.CodeBlock,
                DataSent = submission.DataSent,
                StudentName = submission.Student?.Name
            };

            return Ok(dto);
        }

        // GET: api/tasks/{taskId}/submissions - Rota mais descritiva
        [HttpGet("/api/tasks/{taskId}/submissions")]
        [Authorize(Policy = "AlunoProfessorPolicy")]
        public async Task<ActionResult<IEnumerable<SubmissionResponseDto>>> GetSubmissionsForTask(Guid taskId)
        {
            var submissions = await _submissionRepository.GetByTaskIdAsync(taskId);
            var dtos = submissions.Select(s => new SubmissionResponseDto
            {
                Id = s.Id,
                StudentId = s.StudentId,
                TaskId = s.TaskId,
                CodeBlock = s.CodeBlock,
                DataSent = s.DataSent,
                StudentName = s.Student?.Name
            });

            return Ok(dtos);
        }


        // POST: api/submissions
        [HttpPost]
        [Authorize(Policy = "AlunoPolicy")]
        public async Task<ActionResult<SubmissionResponseDto>> PostSubmission(CreateSubmissionDto createDto)
        {
            var submission = new SubmissionModel
            {
                StudentId = createDto.StudentId,
                TaskId = createDto.TaskId,
                CodeBlock = createDto.CodeBlock,
                DataSent = DateTime.UtcNow
            };

            await _submissionRepository.AddAsync(submission);
            await _submissionRepository.SaveChangesAsync();

            var responseDto = new SubmissionResponseDto
            {
                Id = submission.Id,
                StudentId = submission.StudentId,
                TaskId = submission.TaskId,
                CodeBlock = submission.CodeBlock,
                DataSent = submission.DataSent
            };

            return CreatedAtAction(nameof(GetSubmission), new { id = submission.Id }, responseDto);
        }
    }
}
