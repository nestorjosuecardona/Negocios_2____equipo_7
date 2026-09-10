using System.ComponentModel.DataAnnotations;

namespace StudioFit.Backend.Models
{
    /// <summary>
    /// Modelo de Usuario - Usuarios del sistema Studio Fit
    /// </summary>
    public class Usuario
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Correo { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [StringLength(20)]
        public string? Telefono { get; set; }

        [StringLength(200)]
        public string? Direccion { get; set; }

        [StringLength(20)]
        public string Rol { get; set; } = "cliente"; // cliente, admin, gerente

        [Required]
        public bool Activo { get; set; } = true;

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? UltimoAcceso { get; set; }

        // Relaciones
        public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
        public ICollection<Publicacion> Publicaciones { get; set; } = new List<Publicacion>();
    }
}
