using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de DetallePedido - Ítems en un pedido
    /// </summary>
    public class DetallePedido
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Pedido")]
        public int PedidoId { get; set; }

        [Required]
        [ForeignKey("Producto")]
        public int ProductoId { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Required]
        [Column(TypeName = "decimal(8, 2)")]
        public decimal PrecioUnitario { get; set; }

        [Column(TypeName = "decimal(8, 2)")]
        public decimal Subtotal { get; set; }

        // Relaciones
        public Pedido Pedido { get; set; } = null!;
        public Producto Producto { get; set; } = null!;
    }
}
