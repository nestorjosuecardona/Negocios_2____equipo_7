using Microsoft.AspNetCore.Mvc;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Services;

namespace StudioFit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CarritosController : ControllerBase
    {
        private readonly ICarritoService _carritoService;

        public CarritosController(ICarritoService carritoService)
        {
            _carritoService = carritoService;
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> ObtenerCarrito(int usuarioId)
        {
            try
            {
                var carrito = await _carritoService.ObtenerPorUsuarioAsync(usuarioId);
                if (carrito == null)
                    return NotFound(new { mensaje = "Carrito no encontrado" });
                return Ok(carrito);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("usuario/{usuarioId}/agregar")]
        public async Task<IActionResult> AgregarItem(int usuarioId, [FromBody] AgregarCarritoDto dto)
        {
            try
            {
                if (dto.ProductoId <= 0 || dto.Cantidad <= 0)
                    return BadRequest(new { mensaje = "ProductoId y cantidad deben ser mayores a 0" });

                var carrito = await _carritoService.AgregarItemAsync(usuarioId, dto);
                return Ok(carrito);
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

        [HttpDelete("usuario/{usuarioId}/item/{detalleCarritoId}")]
        public async Task<IActionResult> RemoverItem(int usuarioId, int detalleCarritoId)
        {
            try
            {
                var carrito = await _carritoService.RemoverItemAsync(usuarioId, detalleCarritoId);
                return Ok(carrito);
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

        [HttpPut("usuario/{usuarioId}/item/{detalleCarritoId}")]
        public async Task<IActionResult> ActualizarCantidad(int usuarioId, int detalleCarritoId, [FromQuery] int cantidad)
        {
            try
            {
                var carrito = await _carritoService.ActualizarCantidadAsync(usuarioId, detalleCarritoId, cantidad);
                return Ok(carrito);
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

        [HttpDelete("usuario/{usuarioId}/vaciar")]
        public async Task<IActionResult> VaciarCarrito(int usuarioId)
        {
            try
            {
                var resultado = await _carritoService.VaciarCarritoAsync(usuarioId);
                if (!resultado)
                    return NotFound(new { mensaje = "Carrito no encontrado" });
                return Ok(new { mensaje = "Carrito vaciado" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
