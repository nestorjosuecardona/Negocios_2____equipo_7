using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Promoción - Cupones y ofertas
    /// </summary>
    public class Promocion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Codigo { get; set; } = string.Empty;

        [StringLength(200)]
        public string? Descripcion { get; set; }

        [Required]
        [Column(TypeName = "decimal(5, 2)")]
        public decimal Descuento { get; set; } // porcentaje o monto

        [StringLength(20)]
        public string Tipo { get; set; } = "porcentaje"; // porcentaje, fijo

        [Required]
        public DateTime FechaInicio { get; set; }

        [Required]
        public DateTime FechaFin { get; set; }

        [Required]
        public bool Activo { get; set; } = true;

        [Required]
        public int UsoMaximo { get; set; }

        public int UsoActual { get; set; } = 0;
    }
}
