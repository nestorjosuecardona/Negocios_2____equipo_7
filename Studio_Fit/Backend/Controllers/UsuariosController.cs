using Microsoft.AspNetCore.Mvc;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Services;

namespace StudioFit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;

        public UsuariosController(IUsuarioService usuarioService)
        {
            _usuarioService = usuarioService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            try
            {
                var usuario = await _usuarioService.ObtenerPorIdAsync(id);
                if (usuario == null)
                    return NotFound(new { mensaje = "Usuario no encontrado" });
                return Ok(usuario);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos()
        {
            try
            {
                var usuarios = await _usuarioService.ObtenerTodosAsync();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("registro")]
        public async Task<IActionResult> Registrar([FromBody] CreateUsuarioDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Nombre) || string.IsNullOrEmpty(dto.Correo) || string.IsNullOrEmpty(dto.Contraseña))
                    return BadRequest(new { mensaje = "Nombre, correo y contraseña son requeridos" });

                var usuario = await _usuarioService.CrearAsync(dto);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.Id }, usuario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Correo) || string.IsNullOrEmpty(dto.Contraseña))
                    return BadRequest(new { mensaje = "Correo y contraseña son requeridos" });

                var valido = await _usuarioService.VerificarContraseñaAsync(dto.Correo, dto.Contraseña);
                if (!valido)
                    return Unauthorized(new { mensaje = "Correo o contraseña inválidos" });

                var usuario = await _usuarioService.ObtenerPorCorreoAsync(dto.Correo);
                await _usuarioService.ActualizarUltimoAccesoAsync(usuario!.Id);

                return Ok(new LoginResponseDto
                {
                    Exito = true,
                    Usuario = usuario,
                    Mensaje = "Login exitoso"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] UpdateUsuarioDto dto)
        {
            try
            {
                var usuario = await _usuarioService.ActualizarAsync(id, dto);
                return Ok(usuario);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                var resultado = await _usuarioService.EliminarAsync(id);
                if (!resultado)
                    return NotFound(new { mensaje = "Usuario no encontrado" });
                return Ok(new { mensaje = "Usuario eliminado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
