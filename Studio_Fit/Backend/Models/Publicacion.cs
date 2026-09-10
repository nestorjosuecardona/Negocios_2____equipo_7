using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Publicación - Publicaciones de usuarios (comunidad, marketplace)
    /// </summary>
    public class Publicacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Usuario")]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string Contenido { get; set; } = string.Empty;

        [StringLength(500)]
        public string? ImagenUrl { get; set; }

        [StringLength(50)]
        public string Tipo { get; set; } = "publicacion"; // publicacion, producto

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaActualizacion { get; set; }

        public int Visualizaciones { get; set; } = 0;

        [Required]
        public bool Activo { get; set; } = true;

        // Relaciones
        public Usuario Usuario { get; set; } = null!;
        public ICollection<Comentario> Comentarios { get; set; } = new List<Comentario>();
    }
}
