namespace StudioFit.Backend.DTOs
{
    /// <summary>
    /// DTO para crear una promoción
    /// </summary>
    public class CreatePromocionDto
    {
        public string Codigo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Descuento { get; set; }
        public string Tipo { get; set; } = "porcentaje";
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public int UsoMaximo { get; set; }
    }

    /// <summary>
    /// DTO para actualizar una promoción
    /// </summary>
    public class UpdatePromocionDto
    {
        public string? Descripcion { get; set; }
        public decimal? Descuento { get; set; }
        public DateTime? FechaFin { get; set; }
        public bool? Activo { get; set; }
    }

    /// <summary>
    /// DTO para retornar una promoción
    /// </summary>
    public class PromocionDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Descuento { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        public bool Activo { get; set; }
        public int UsoMaximo { get; set; }
        public int UsoActual { get; set; }
    }

    /// <summary>
    /// DTO para validar un código de promoción
    /// </summary>
    public class ValidarPromocionDto
    {
        public string Codigo { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }

    /// <summary>
    /// DTO para respuesta de validación de promoción
    /// </summary>
    public class ValidarPromocionResponseDto
    {
        public bool Valido { get; set; }
        public string? Mensaje { get; set; }
        public decimal Descuento { get; set; }
        public decimal MontoFinal { get; set; }
    }
}
