using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Pedido - Órdenes de compra
    /// </summary>
    public class Pedido
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }

        [Required]
        public DateTime FechaPedido { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Estado { get; set; } = "pendiente"; // pendiente, confirmado, enviado, entregado, cancelado

        [StringLength(200)]
        public string? DireccionEnvio { get; set; }

        [Column(TypeName = "decimal(8, 2)")]
        public decimal Total { get; set; }

        [StringLength(500)]
        public string? Notas { get; set; }

        [StringLength(50)]
        public string? MetodoPago { get; set; } // tarjeta, paypal, transferencia

        // Relaciones
        public Usuario Usuario { get; set; } = null!;
        public ICollection<DetallePedido> Detalles { get; set; } = new List<DetallePedido>();
    }
}
