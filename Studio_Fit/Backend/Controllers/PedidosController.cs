using Microsoft.AspNetCore.Mvc;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Services;

namespace StudioFit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidosController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            try
            {
                var pedido = await _pedidoService.ObtenerPorIdAsync(id);
                if (pedido == null)
                    return NotFound(new { mensaje = "Pedido no encontrado" });
                return Ok(pedido);
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
                var pedidos = await _pedidoService.ObtenerPorUsuarioAsync(usuarioId);
                return Ok(pedidos);
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
                var pedidos = await _pedidoService.ObtenerTodosAsync();
                return Ok(pedidos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("usuario/{usuarioId}/crear")]
        public async Task<IActionResult> CrearDesdeCarrito(int usuarioId, [FromBody] CreatePedidoDto dto)
        {
            try
            {
                var pedido = await _pedidoService.CrearDesdeCarritoAsync(usuarioId, dto);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = pedido.Id }, pedido);
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

        [HttpPut("{id}/estado")]
        public async Task<IActionResult> ActualizarEstado(int id, [FromBody] UpdatePedidoEstadoDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Estado))
                    return BadRequest(new { mensaje = "Estado es requerido" });

                var pedido = await _pedidoService.ActualizarEstadoAsync(id, dto);
                return Ok(pedido);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { mensaje = ex.Message });
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                var resultado = await _pedidoService.EliminarAsync(id);
                if (!resultado)
                    return NotFound(new { mensaje = "Pedido no encontrado" });
                return Ok(new { mensaje = "Pedido eliminado" });
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
    }
}
