using StudioFit.Backend.Data;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace StudioFit.Backend.Services
{
    /// <summary>
    /// Servicio para gestionar promociones
    /// </summary>
    public interface IPromocionService
    {
        Task<PromocionDto?> ObtenerPorCodigoAsync(string codigo);
        Task<List<PromocionDto>> ObtenerTodasActivasAsync();
        Task<PromocionDto> CrearAsync(CreatePromocionDto dto);
        Task<PromocionDto> ActualizarAsync(int id, UpdatePromocionDto dto);
        Task<bool> EliminarAsync(int id);
        Task<ValidarPromocionResponseDto> ValidarAsync(ValidarPromocionDto dto);
    }

    public class PromocionService : IPromocionService
    {
        private readonly ApplicationDbContext _context;

        public PromocionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PromocionDto?> ObtenerPorCodigoAsync(string codigo)
        {
            var promocion = await _context.Promociones
                .FirstOrDefaultAsync(p => p.Codigo == codigo && p.Activo);

            if (promocion == null) return null;
            return MapearADto(promocion);
        }

        public async Task<List<PromocionDto>> ObtenerTodasActivasAsync()
        {
            var ahora = DateTime.UtcNow;
            var promociones = await _context.Promociones
                .Where(p => p.Activo && p.FechaInicio <= ahora && p.FechaFin >= ahora)
                .ToListAsync();

            return promociones.Select(MapearADto).ToList();
        }

        public async Task<PromocionDto> CrearAsync(CreatePromocionDto dto)
        {
            var promocion = new Promocion
            {
                Codigo = dto.Codigo.ToUpper(),
                Descripcion = dto.Descripcion,
                Descuento = dto.Descuento,
                Tipo = dto.Tipo,
                FechaInicio = dto.FechaInicio,
                FechaFin = dto.FechaFin,
                Activo = true,
                UsoMaximo = dto.UsoMaximo,
                UsoActual = 0
            };

            _context.Promociones.Add(promocion);
            await _context.SaveChangesAsync();
            return MapearADto(promocion);
        }

        public async Task<PromocionDto> ActualizarAsync(int id, UpdatePromocionDto dto)
        {
            var promocion = await _context.Promociones.FindAsync(id);
            if (promocion == null)
                throw new KeyNotFoundException("Promoción no encontrada");

            if (!string.IsNullOrEmpty(dto.Descripcion))
                promocion.Descripcion = dto.Descripcion;
            if (dto.Descuento.HasValue)
                promocion.Descuento = dto.Descuento.Value;
            if (dto.FechaFin.HasValue)
                promocion.FechaFin = dto.FechaFin.Value;
            if (dto.Activo.HasValue)
                promocion.Activo = dto.Activo.Value;

            _context.Promociones.Update(promocion);
            await _context.SaveChangesAsync();
            return MapearADto(promocion);
        }

        public async Task<bool> EliminarAsync(int id)
        {
            var promocion = await _context.Promociones.FindAsync(id);
            if (promocion == null) return false;

            promocion.Activo = false;
            _context.Promociones.Update(promocion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ValidarPromocionResponseDto> ValidarAsync(ValidarPromocionDto dto)
        {
            var ahora = DateTime.UtcNow;
            var promocion = await _context.Promociones
                .FirstOrDefaultAsync(p => p.Codigo == dto.Codigo.ToUpper());

            if (promocion == null || !promocion.Activo)
            {
                return new ValidarPromocionResponseDto
                {
                    Valido = false,
                    Mensaje = "Código de promoción inválido",
                    Descuento = 0,
                    MontoFinal = dto.Monto
                };
            }

            if (promocion.FechaInicio > ahora || promocion.FechaFin < ahora)
            {
                return new ValidarPromocionResponseDto
                {
                    Valido = false,
                    Mensaje = "La promoción ha expirado",
                    Descuento = 0,
                    MontoFinal = dto.Monto
                };
            }

            if (promocion.UsoActual >= promocion.UsoMaximo)
            {
                return new ValidarPromocionResponseDto
                {
                    Valido = false,
                    Mensaje = "La promoción ha alcanzado su límite de uso",
                    Descuento = 0,
                    MontoFinal = dto.Monto
                };
            }

            decimal descuento = 0;
            if (promocion.Tipo == "porcentaje")
            {
                descuento = Math.Round(dto.Monto * (promocion.Descuento / 100), 2);
            }
            else // fijo
            {
                descuento = promocion.Descuento;
            }

            decimal montoFinal = Math.Max(0, dto.Monto - descuento);

            // Incrementar uso
            promocion.UsoActual++;
            _context.Promociones.Update(promocion);
            await _context.SaveChangesAsync();

            return new ValidarPromocionResponseDto
            {
                Valido = true,
                Mensaje = "Promoción aplicada correctamente",
                Descuento = descuento,
                MontoFinal = montoFinal
            };
        }

        private PromocionDto MapearADto(Promocion promocion)
        {
            return new PromocionDto
            {
                Id = promocion.Id,
                Codigo = promocion.Codigo,
                Descripcion = promocion.Descripcion,
                Descuento = promocion.Descuento,
                Tipo = promocion.Tipo,
                FechaInicio = promocion.FechaInicio,
                FechaFin = promocion.FechaFin,
                Activo = promocion.Activo,
                UsoMaximo = promocion.UsoMaximo,
                UsoActual = promocion.UsoActual
            };
        }
    }
}
