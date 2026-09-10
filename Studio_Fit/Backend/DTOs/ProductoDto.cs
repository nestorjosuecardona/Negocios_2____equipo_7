namespace StudioFit.Backend.DTOs
{
    /// <summary>
    /// DTO para crear un nuevo producto
    /// </summary>
    public class CreateProductoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string? Categoria { get; set; }
        public string? ImagenUrl { get; set; }
    }

    /// <summary>
    /// DTO para actualizar un producto
    /// </summary>
    public class UpdateProductoDto
    {
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal? Precio { get; set; }
        public int? Stock { get; set; }
        public string? Categoria { get; set; }
        public string? ImagenUrl { get; set; }
        public bool? Activo { get; set; }
    }

    /// <summary>
    /// DTO para retornar datos del producto
    /// </summary>
    public class ProductoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string? Categoria { get; set; }
        public string? ImagenUrl { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
    }
}
