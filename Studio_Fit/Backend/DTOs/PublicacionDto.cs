namespace StudioFit.Backend.DTOs
{
    /// <summary>
    /// DTO para crear una publicación
    /// </summary>
    public class CreatePublicacionDto
    {
        public string Titulo { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }
        public string Tipo { get; set; } = "publicacion";
    }

    /// <summary>
    /// DTO para actualizar una publicación
    /// </summary>
    public class UpdatePublicacionDto
    {
        public string? Titulo { get; set; }
        public string? Contenido { get; set; }
        public string? ImagenUrl { get; set; }
        public bool? Activo { get; set; }
    }

    /// <summary>
    /// DTO para crear un comentario
    /// </summary>
    public class CreateComentarioDto
    {
        public string Contenido { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para retornar un comentario
    /// </summary>
    public class ComentarioDto
    {
        public int Id { get; set; }
        public int PublicacionId { get; set; }
        public int UsuarioId { get; set; }
        public string? NombreUsuario { get; set; }
        public string Contenido { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public int Likes { get; set; }
        public bool Activo { get; set; }
    }

    /// <summary>
    /// DTO para retornar una publicación con comentarios
    /// </summary>
    public class PublicacionDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string? NombreUsuario { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Contenido { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public int Visualizaciones { get; set; }
        public bool Activo { get; set; }
        public List<ComentarioDto> Comentarios { get; set; } = new List<ComentarioDto>();
    }
}
