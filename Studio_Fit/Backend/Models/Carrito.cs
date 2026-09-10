using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Carrito - Carrito de compras del usuario
    /// </summary>
    public class Carrito
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        [Column(TypeName = "decimal(8, 2)")]
        public decimal Total { get; set; } = 0;

        // Relaciones
        public Usuario Usuario { get; set; } = null!;
        public ICollection<DetalleCarrito> Detalles { get; set; } = new List<DetalleCarrito>();
    }
}
