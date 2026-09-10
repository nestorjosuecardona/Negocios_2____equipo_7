using Microsoft.AspNetCore.Mvc;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Services;

namespace StudioFit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicacionesController : ControllerBase
    {
        private readonly IPublicacionService _publicacionService;

        public PublicacionesController(IPublicacionService publicacionService)
        {
            _publicacionService = publicacionService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            try
            {
                await _publicacionService.IncrementarVisualizacionesAsync(id);
                var publicacion = await _publicacionService.ObtenerPorIdAsync(id);
                if (publicacion == null)
                    return NotFound(new { mensaje = "Publicación no encontrada" });
                return Ok(publicacion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodas()
        {
            try
            {
                var publicaciones = await _publicacionService.ObtenerTodasAsync();
                return Ok(publicaciones);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> ObtenerPorUsuario(int usuarioId)
        {
            try
            {
                var publicaciones = await _publicacionService.ObtenerPorUsuarioAsync(usuarioId);
                return Ok(publicaciones);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("usuario/{usuarioId}")]
        public async Task<IActionResult> Crear(int usuarioId, [FromBody] CreatePublicacionDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Titulo) || string.IsNullOrEmpty(dto.Contenido))
                    return BadRequest(new { mensaje = "Título y contenido son requeridos" });

                var publicacion = await _publicacionService.CrearAsync(usuarioId, dto);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = publicacion.Id }, publicacion);
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

        [HttpPut("{id}/usuario/{usuarioId}")]
        public async Task<IActionResult> Actualizar(int id, int usuarioId, [FromBody] UpdatePublicacionDto dto)
        {
            try
            {
                var publicacion = await _publicacionService.ActualizarAsync(id, usuarioId, dto);
                return Ok(publicacion);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}/usuario/{usuarioId}")]
        public async Task<IActionResult> Eliminar(int id, int usuarioId)
        {
            try
            {
                var resultado = await _publicacionService.EliminarAsync(id, usuarioId);
                if (!resultado)
                    return NotFound(new { mensaje = "Publicación no encontrada" });
                return Ok(new { mensaje = "Publicación eliminada" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("{publicacionId}/comentarios/usuario/{usuarioId}")]
        public async Task<IActionResult> AgregarComentario(int publicacionId, int usuarioId, [FromBody] CreateComentarioDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Contenido))
                    return BadRequest(new { mensaje = "Contenido del comentario es requerido" });

                var publicacion = await _publicacionService.AgregarComentarioAsync(publicacionId, usuarioId, dto);
                return Ok(publicacion);
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

        [HttpDelete("comentarios/{comentarioId}/usuario/{usuarioId}")]
        public async Task<IActionResult> RemoverComentario(int comentarioId, int usuarioId)
        {
            try
            {
                var resultado = await _publicacionService.RemoverComentarioAsync(comentarioId, usuarioId);
                if (!resultado)
                    return NotFound(new { mensaje = "Comentario no encontrado" });
                return Ok(new { mensaje = "Comentario eliminado" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("comentarios/{comentarioId}/like")]
        public async Task<IActionResult> AgregarLikeComentario(int comentarioId)
        {
            try
            {
                var publicacion = await _publicacionService.AgregarLikeComentarioAsync(comentarioId);
                return Ok(publicacion);
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
    }
}
