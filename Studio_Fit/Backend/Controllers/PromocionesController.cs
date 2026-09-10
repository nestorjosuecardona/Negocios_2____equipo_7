using Microsoft.AspNetCore.Mvc;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Services;

namespace StudioFit.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromocionesController : ControllerBase
    {
        private readonly IPromocionService _promocionService;

        public PromocionesController(IPromocionService promocionService)
        {
            _promocionService = promocionService;
        }

        [HttpGet("codigo/{codigo}")]
        public async Task<IActionResult> ObtenerPorCodigo(string codigo)
        {
            try
            {
                var promocion = await _promocionService.ObtenerPorCodigoAsync(codigo);
                if (promocion == null)
                    return NotFound(new { mensaje = "Promoción no encontrada" });
                return Ok(promocion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodasActivas()
        {
            try
            {
                var promociones = await _promocionService.ObtenerTodasActivasAsync();
                return Ok(promociones);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] CreatePromocionDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Codigo) || dto.Descuento <= 0)
                    return BadRequest(new { mensaje = "Código y descuento válido son requeridos" });

                var promocion = await _promocionService.CrearAsync(dto);
                return CreatedAtAction(nameof(ObtenerPorCodigo), new { codigo = promocion.Codigo }, promocion);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] UpdatePromocionDto dto)
        {
            try
            {
                var promocion = await _promocionService.ActualizarAsync(id, dto);
                return Ok(promocion);
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
                var resultado = await _promocionService.EliminarAsync(id);
                if (!resultado)
                    return NotFound(new { mensaje = "Promoción no encontrada" });
                return Ok(new { mensaje = "Promoción eliminada" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("validar")]
        public async Task<IActionResult> Validar([FromBody] ValidarPromocionDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Codigo) || dto.Monto <= 0)
                    return BadRequest(new { mensaje = "Código y monto válido son requeridos" });

                var resultado = await _promocionService.ValidarAsync(dto);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
