namespace StudioFit.Backend.DTOs
{
    /// <summary>
    /// DTO para crear un pedido
    /// </summary>
    public class CreatePedidoDto
    {
        public string? DireccionEnvio { get; set; }
        public string? MetodoPago { get; set; }
        public string? Notas { get; set; }
    }

    /// <summary>
    /// DTO para detalle de un pedido
    /// </summary>
    public class DetallePedidoDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string? NombreProducto { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }

    /// <summary>
    /// DTO para retornar un pedido
    /// </summary>
    public class PedidoDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public DateTime FechaPedido { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string? DireccionEnvio { get; set; }
        public decimal Total { get; set; }
        public string? MetodoPago { get; set; }
        public string? Notas { get; set; }
        public List<DetallePedidoDto> Detalles { get; set; } = new List<DetallePedidoDto>();
    }

    /// <summary>
    /// DTO para actualizar estado del pedido
    /// </summary>
    public class UpdatePedidoEstadoDto
    {
        public string Estado { get; set; } = string.Empty;
    }
}
