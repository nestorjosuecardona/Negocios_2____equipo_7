using StudioFit.Backend.Data;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace StudioFit.Backend.Services
{
    /// <summary>
    /// Servicio para gestionar productos
    /// </summary>
    public interface IProductoService
    {
        Task<ProductoDto?> ObtenerPorIdAsync(int id);
        Task<List<ProductoDto>> ObtenerTodosAsync();
        Task<List<ProductoDto>> ObtenerPorCategoriaAsync(string categoria);
        Task<ProductoDto> CrearAsync(CreateProductoDto dto);
        Task<ProductoDto> ActualizarAsync(int id, UpdateProductoDto dto);
        Task<bool> EliminarAsync(int id);
        Task<bool> ActualizarStockAsync(int id, int cantidad);
    }

    public class ProductoService : IProductoService
    {
        private readonly ApplicationDbContext _context;

        public ProductoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ProductoDto?> ObtenerPorIdAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null || !producto.Activo) return null;
            return MapearADto(producto);
        }

        public async Task<List<ProductoDto>> ObtenerTodosAsync()
        {
            var productos = await _context.Productos
                .Where(p => p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
            return productos.Select(MapearADto).ToList();
        }

        public async Task<List<ProductoDto>> ObtenerPorCategoriaAsync(string categoria)
        {
            var productos = await _context.Productos
                .Where(p => p.Activo && p.Categoria == categoria)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();
            return productos.Select(MapearADto).ToList();
        }

        public async Task<ProductoDto> CrearAsync(CreateProductoDto dto)
        {
            var producto = new Producto
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                Stock = dto.Stock,
                Categoria = dto.Categoria,
                ImagenUrl = dto.ImagenUrl,
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
            return MapearADto(producto);
        }

        public async Task<ProductoDto> ActualizarAsync(int id, UpdateProductoDto dto)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                throw new KeyNotFoundException("Producto no encontrado");

            if (!string.IsNullOrEmpty(dto.Nombre))
                producto.Nombre = dto.Nombre;
            if (!string.IsNullOrEmpty(dto.Descripcion))
                producto.Descripcion = dto.Descripcion;
            if (dto.Precio.HasValue && dto.Precio > 0)
                producto.Precio = dto.Precio.Value;
            if (dto.Stock.HasValue)
                producto.Stock = dto.Stock.Value;
            if (!string.IsNullOrEmpty(dto.Categoria))
                producto.Categoria = dto.Categoria;
            if (!string.IsNullOrEmpty(dto.ImagenUrl))
                producto.ImagenUrl = dto.ImagenUrl;
            if (dto.Activo.HasValue)
                producto.Activo = dto.Activo.Value;

            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();
            return MapearADto(producto);
        }

        public async Task<bool> EliminarAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            producto.Activo = false;
            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ActualizarStockAsync(int id, int cantidad)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null) return false;

            if (producto.Stock < cantidad)
                return false;

            producto.Stock -= cantidad;
            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();
            return true;
        }

        private ProductoDto MapearADto(Producto producto)
        {
            return new ProductoDto
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                Stock = producto.Stock,
                Categoria = producto.Categoria,
                ImagenUrl = producto.ImagenUrl,
                Activo = producto.Activo,
                FechaCreacion = producto.FechaCreacion
            };
        }
    }
}
