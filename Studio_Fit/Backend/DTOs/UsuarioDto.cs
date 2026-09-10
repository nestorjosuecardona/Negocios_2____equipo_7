namespace StudioFit.Backend.DTOs
{
    /// <summary>
    /// DTO para crear un nuevo usuario
    /// </summary>
    public class CreateUsuarioDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Contraseña { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
    }

    /// <summary>
    /// DTO para actualizar un usuario
    /// </summary>
    public class UpdateUsuarioDto
    {
        public string? Nombre { get; set; }
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
    }

    /// <summary>
    /// DTO para retornar datos del usuario
    /// </summary>
    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
        public string Rol { get; set; } = string.Empty;
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? UltimoAcceso { get; set; }
    }

    /// <summary>
    /// DTO para login
    /// </summary>
    public class LoginDto
    {
        public string Correo { get; set; } = string.Empty;
        public string Contraseña { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO para respuesta de login
    /// </summary>
    public class LoginResponseDto
    {
        public bool Exito { get; set; }
        public string? Token { get; set; }
        public string? Mensaje { get; set; }
        public UsuarioDto? Usuario { get; set; }
    }
}
