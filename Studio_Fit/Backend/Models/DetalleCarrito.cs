using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de DetalleCarrito - Ítems en el carrito
    /// </summary>
    public class DetalleCarrito
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Carrito")]
        public int CarritoId { get; set; }

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
        public Carrito Carrito { get; set; } = null!;
        public Producto Producto { get; set; } = null!;
    }
}
