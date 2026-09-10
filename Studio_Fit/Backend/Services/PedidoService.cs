using StudioFit.Backend.Data;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace StudioFit.Backend.Services
{
    /// <summary>
    /// Servicio para gestionar pedidos
    /// </summary>
    public interface IPedidoService
    {
        Task<PedidoDto?> ObtenerPorIdAsync(int id);
        Task<List<PedidoDto>> ObtenerPorUsuarioAsync(int usuarioId);
        Task<List<PedidoDto>> ObtenerTodosAsync();
        Task<PedidoDto> CrearDesdeCarritoAsync(int usuarioId, CreatePedidoDto dto);
        Task<PedidoDto> ActualizarEstadoAsync(int id, UpdatePedidoEstadoDto dto);
        Task<bool> EliminarAsync(int id);
    }

    public class PedidoService : IPedidoService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICarritoService _carritoService;
        private readonly IProductoService _productoService;

        public PedidoService(ApplicationDbContext context, ICarritoService carritoService, IProductoService productoService)
        {
            _context = context;
            _carritoService = carritoService;
            _productoService = productoService;
        }

        public async Task<PedidoDto?> ObtenerPorIdAsync(int id)
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pedido == null) return null;
            return MapearADto(pedido);
        }

        public async Task<List<PedidoDto>> ObtenerPorUsuarioAsync(int usuarioId)
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
                .Where(p => p.UsuarioId == usuarioId)
                .OrderByDescending(p => p.FechaPedido)
                .ToListAsync();

            return pedidos.Select(MapearADto).ToList();
        }

        public async Task<List<PedidoDto>> ObtenerTodosAsync()
        {
            var pedidos = await _context.Pedidos
                .Include(p => p.Detalles)
                .ThenInclude(d => d.Producto)
                .OrderByDescending(p => p.FechaPedido)
                .ToListAsync();

            return pedidos.Select(MapearADto).ToList();
        }

        public async Task<PedidoDto> CrearDesdeCarritoAsync(int usuarioId, CreatePedidoDto dto)
        {
            var carrito = await _context.Carritos
                .Include(c => c.Detalles)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            if (carrito == null || carrito.Detalles.Count == 0)
                throw new InvalidOperationException("El carrito está vacío");

            // Verificar stock disponible
            foreach (var detalle in carrito.Detalles)
            {
                if (detalle.Producto.Stock < detalle.Cantidad)
                    throw new InvalidOperationException($"Stock insuficiente para {detalle.Producto.Nombre}");
            }

            // Crear pedido
            var pedido = new Pedido
            {
                UsuarioId = usuarioId,
                FechaPedido = DateTime.UtcNow,
                Estado = "confirmado",
                DireccionEnvio = dto.DireccionEnvio,
                MetodoPago = dto.MetodoPago,
                Notas = dto.Notas,
                Total = carrito.Total
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            // Crear detalles del pedido y actualizar stock
            foreach (var detalle in carrito.Detalles)
            {
                var detallePedido = new DetallePedido
                {
                    PedidoId = pedido.Id,
                    ProductoId = detalle.ProductoId,
                    Cantidad = detalle.Cantidad,
                    PrecioUnitario = detalle.PrecioUnitario,
                    Subtotal = detalle.Subtotal
                };

                _context.DetallesPedido.Add(detallePedido);

                // Actualizar stock del producto
                detalle.Producto.Stock -= detalle.Cantidad;
                _context.Productos.Update(detalle.Producto);
            }

            await _context.SaveChangesAsync();

            // Vaciar carrito
            await _carritoService.VaciarCarritoAsync(usuarioId);

            return await ObtenerPorIdAsync(pedido.Id) ?? new PedidoDto();
        }

        public async Task<PedidoDto> ActualizarEstadoAsync(int id, UpdatePedidoEstadoDto dto)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
                throw new KeyNotFoundException("Pedido no encontrado");

            var estadosValidos = new[] { "pendiente", "confirmado", "enviado", "entregado", "cancelado" };
            if (!estadosValidos.Contains(dto.Estado))
                throw new InvalidOperationException("Estado de pedido inválido");

            pedido.Estado = dto.Estado;
            _context.Pedidos.Update(pedido);
            await _context.SaveChangesAsync();

            return await ObtenerPorIdAsync(id) ?? new PedidoDto();
        }

        public async Task<bool> EliminarAsync(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return false;

            if (pedido.Estado != "pendiente")
                throw new InvalidOperationException("Solo se pueden eliminar pedidos en estado pendiente");

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return true;
        }

        private PedidoDto MapearADto(Pedido pedido)
        {
            return new PedidoDto
            {
                Id = pedido.Id,
                UsuarioId = pedido.UsuarioId,
                FechaPedido = pedido.FechaPedido,
                Estado = pedido.Estado,
                DireccionEnvio = pedido.DireccionEnvio,
                Total = pedido.Total,
                MetodoPago = pedido.MetodoPago,
                Notas = pedido.Notas,
                Detalles = pedido.Detalles.Select(d => new DetallePedidoDto
                {
                    Id = d.Id,
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
