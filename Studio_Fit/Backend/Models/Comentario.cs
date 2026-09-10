using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Comentario - Comentarios en publicaciones
    /// </summary>
    public class Comentario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Publicacion")]
        public int PublicacionId { get; set; }

        [Required]
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(500)]
        public string Contenido { get; set; } = string.Empty;

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public int Likes { get; set; } = 0;

        [Required]
        public bool Activo { get; set; } = true;

        // Relaciones
        public Publicacion Publicacion { get; set; } = null!;
        public Usuario Usuario { get; set; } = null!;
    }
}
