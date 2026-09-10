using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Producto - Productos de Studio Fit (suplementos, ropa, equipo)
    /// </summary>
    public class Producto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(8, 2)")]
        public decimal Precio { get; set; }

        [Required]
        public int Stock { get; set; }

        [StringLength(50)]
        public string? Categoria { get; set; } // suplementos, ropa, equipo

        [StringLength(500)]
        public string? ImagenUrl { get; set; }

        [Required]
        public bool Activo { get; set; } = true;

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        // Relaciones
        public ICollection<DetalleCarrito> DetallesCarrito { get; set; } = new List<DetalleCarrito>();
        public ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
    }
}
