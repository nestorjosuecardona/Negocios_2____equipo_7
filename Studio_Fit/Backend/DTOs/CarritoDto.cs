namespace StudioFit.Backend.DTOs
{
    /// <summary>
    /// DTO para agregar item al carrito
    /// </summary>
    public class AgregarCarritoDto
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
    }

    /// <summary>
    /// DTO para detalle del carrito
    /// </summary>
    public class DetalleCarritoDto
    {
        public int Id { get; set; }
        public int CarritoId { get; set; }
        public int ProductoId { get; set; }
        public string? NombreProducto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }

    /// <summary>
    /// DTO para retornar el carrito completo
    /// </summary>
    public class CarritoDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public decimal Total { get; set; }
        public DateTime FechaCreacion { get; set; }
        public List<DetalleCarritoDto> Detalles { get; set; } = new List<DetalleCarritoDto>();
    }
}
