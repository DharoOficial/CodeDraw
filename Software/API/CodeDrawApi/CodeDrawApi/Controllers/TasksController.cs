using CodeDrawApi.DTOs;
using CodeDrawApi.Models;
using CodeDrawApi.Repositores;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CodeDrawApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        // Alterado de ITaskRepository para a classe concreta TaskRepository
        private readonly TaskRepository _taskRepository;

        // O construtor agora recebe a classe concreta
        public TasksController(TaskRepository taskRepository)
        {
            _taskRepository = taskRepository;
        }

        // GET: api/tasks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetTasks()
        {
            var tasks = await _taskRepository.GetAllAsync();
            var taskDtos = tasks.Select(t => new TaskResponseDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                TeacherId = t.TeacherId
            });
            return Ok(taskDtos);
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskResponseDto>> GetTask(Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id);

            if (task == null)
            {
                return NotFound();
            }

            var taskDto = new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                TeacherId = task.TeacherId,
                TeacherName = task.Teacher?.Name // O '?' evita erro se o professor não for carregado
            };

            return Ok(taskDto);
        }

        // POST: api/tasks
        [HttpPost]
        [Authorize(Policy = "ProfessorPolicy")]
        public async Task<ActionResult<TaskResponseDto>> PostTask(CreateTaskDto createTaskDto)
        {
            var task = new TaskModel
            {
                Title = createTaskDto.Title,
                Description = createTaskDto.Description,
                TeacherId = createTaskDto.TeacherId
            };

            await _taskRepository.AddAsync(task);
            await _taskRepository.SaveChangesAsync();

            var taskResponseDto = new TaskResponseDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                TeacherId = task.TeacherId
            };

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskResponseDto);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> PutTask(Guid id, UpdateTaskDto updateTaskDto)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            task.Title = updateTaskDto.Title;
            task.Description = updateTaskDto.Description;

            _taskRepository.Update(task);
            await _taskRepository.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var task = await _taskRepository.GetByIdAsync(id);
            if (task == null)
            {
                return NotFound();
            }

            _taskRepository.Delete(task);
            await _taskRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}
