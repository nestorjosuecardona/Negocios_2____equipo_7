using StudioFit.Backend.Data;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace StudioFit.Backend.Services
{
    /// <summary>
    /// Servicio para gestionar carritos de compra
    /// </summary>
    public interface ICarritoService
    {
        Task<CarritoDto?> ObtenerPorUsuarioAsync(int usuarioId);
        Task<CarritoDto> AgregarItemAsync(int usuarioId, AgregarCarritoDto dto);
        Task<CarritoDto> RemoverItemAsync(int usuarioId, int detalleCarritoId);
        Task<CarritoDto> ActualizarCantidadAsync(int usuarioId, int detalleCarritoId, int cantidad);
        Task<bool> VaciarCarritoAsync(int usuarioId);
        Task<CarritoDto> ObtenerOCrearAsync(int usuarioId);
    }

    public class CarritoService : ICarritoService
    {
        private readonly ApplicationDbContext _context;
        private readonly IProductoService _productoService;

        public CarritoService(ApplicationDbContext context, IProductoService productoService)
        {
            _context = context;
            _productoService = productoService;
        }

        public async Task<CarritoDto?> ObtenerPorUsuarioAsync(int usuarioId)
        {
            var carrito = await _context.Carritos
                .Include(c => c.Detalles)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            if (carrito == null) return null;
            return MapearADto(carrito);
        }

        public async Task<CarritoDto> AgregarItemAsync(int usuarioId, AgregarCarritoDto dto)
        {
            var carrito = await ObtenerOCrearAsync(usuarioId);

            var producto = await _context.Productos.FindAsync(dto.ProductoId);
            if (producto == null || !producto.Activo)
                throw new KeyNotFoundException("Producto no encontrado");

            if (producto.Stock < dto.Cantidad)
                throw new InvalidOperationException("Stock insuficiente");

            var carritoDb = await _context.Carritos
                .Include(c => c.Detalles)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            var detalleExistente = carritoDb?.Detalles
                .FirstOrDefault(d => d.ProductoId == dto.ProductoId);

            if (detalleExistente != null)
            {
                detalleExistente.Cantidad += dto.Cantidad;
                detalleExistente.Subtotal = detalleExistente.Cantidad * detalleExistente.PrecioUnitario;
                _context.DetallesCarrito.Update(detalleExistente);
            }
            else
            {
                var nuevoDetalle = new DetalleCarrito
                {
                    CarritoId = carritoDb!.Id,
                    ProductoId = dto.ProductoId,
                    Cantidad = dto.Cantidad,
                    PrecioUnitario = producto.Precio,
                    Subtotal = dto.Cantidad * producto.Precio
                };
                _context.DetallesCarrito.Add(nuevoDetalle);
            }

            // Actualizar total del carrito
            carritoDb!.Total = carritoDb.Detalles.Sum(d => d.Subtotal) + 
                (detalleExistente != null ? detalleExistente.Subtotal - (detalleExistente.Cantidad - dto.Cantidad) * detalleExistente.PrecioUnitario : 
                 dto.Cantidad * producto.Precio);

            _context.Carritos.Update(carritoDb);
            await _context.SaveChangesAsync();

            return await ObtenerPorUsuarioAsync(usuarioId) ?? new CarritoDto();
        }

        public async Task<CarritoDto> RemoverItemAsync(int usuarioId, int detalleCarritoId)
        {
            var detalle = await _context.DetallesCarrito
                .Include(d => d.Carrito)
                .FirstOrDefaultAsync(d => d.Id == detalleCarritoId && d.Carrito.UsuarioId == usuarioId);

            if (detalle == null)
                throw new KeyNotFoundException("Detalle de carrito no encontrado");

            var carrito = detalle.Carrito;
            carrito.Total -= detalle.Subtotal;

            _context.DetallesCarrito.Remove(detalle);
            _context.Carritos.Update(carrito);
            await _context.SaveChangesAsync();

            return await ObtenerPorUsuarioAsync(usuarioId) ?? new CarritoDto();
        }

        public async Task<CarritoDto> ActualizarCantidadAsync(int usuarioId, int detalleCarritoId, int cantidad)
        {
            if (cantidad <= 0)
                throw new InvalidOperationException("La cantidad debe ser mayor a 0");

            var detalle = await _context.DetallesCarrito
                .Include(d => d.Carrito)
                .Include(d => d.Producto)
                .FirstOrDefaultAsync(d => d.Id == detalleCarritoId && d.Carrito.UsuarioId == usuarioId);

            if (detalle == null)
                throw new KeyNotFoundException("Detalle de carrito no encontrado");

            if (detalle.Producto.Stock < cantidad)
                throw new InvalidOperationException("Stock insuficiente");

            var diferenciaSubtotal = (cantidad * detalle.PrecioUnitario) - detalle.Subtotal;
            detalle.Cantidad = cantidad;
            detalle.Subtotal = cantidad * detalle.PrecioUnitario;

            var carrito = detalle.Carrito;
            carrito.Total += diferenciaSubtotal;

            _context.DetallesCarrito.Update(detalle);
            _context.Carritos.Update(carrito);
            await _context.SaveChangesAsync();

            return await ObtenerPorUsuarioAsync(usuarioId) ?? new CarritoDto();
        }

        public async Task<bool> VaciarCarritoAsync(int usuarioId)
        {
            var carrito = await _context.Carritos
                .Include(c => c.Detalles)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            if (carrito == null) return false;

            _context.DetallesCarrito.RemoveRange(carrito.Detalles);
            carrito.Total = 0;
            _context.Carritos.Update(carrito);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CarritoDto> ObtenerOCrearAsync(int usuarioId)
        {
            var carrito = await _context.Carritos
                .Include(c => c.Detalles)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            if (carrito != null)
                return MapearADto(carrito);

            var nuevoCarrito = new Carrito
            {
                UsuarioId = usuarioId,
                Total = 0,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Carritos.Add(nuevoCarrito);
            await _context.SaveChangesAsync();
            return MapearADto(nuevoCarrito);
        }

        private CarritoDto MapearADto(Carrito carrito)
        {
            return new CarritoDto
            {
                Id = carrito.Id,
                UsuarioId = carrito.UsuarioId,
                Total = carrito.Total,
                FechaCreacion = carrito.FechaCreacion,
                Detalles = carrito.Detalles.Select(d => new DetalleCarritoDto
                {
                    Id = d.Id,
                    CarritoId = d.CarritoId,
                    ProductoId = d.ProductoId,
                    NombreProducto = d.Producto?.Nombre,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList()
            };
        }
    }
}
