using StudioFit.Backend.Data;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace StudioFit.Backend.Services
{
    /// <summary>
    /// Servicio para gestionar publicaciones y comentarios
    /// </summary>
    public interface IPublicacionService
    {
        Task<PublicacionDto?> ObtenerPorIdAsync(int id);
        Task<List<PublicacionDto>> ObtenerTodasAsync();
        Task<List<PublicacionDto>> ObtenerPorUsuarioAsync(int usuarioId);
        Task<PublicacionDto> CrearAsync(int usuarioId, CreatePublicacionDto dto);
        Task<PublicacionDto> ActualizarAsync(int id, int usuarioId, UpdatePublicacionDto dto);
        Task<bool> EliminarAsync(int id, int usuarioId);
        Task<PublicacionDto> AgregarComentarioAsync(int publicacionId, int usuarioId, CreateComentarioDto dto);
        Task<bool> RemoverComentarioAsync(int comentarioId, int usuarioId);
        Task<PublicacionDto> AgregarLikeComentarioAsync(int comentarioId);
        Task<bool> IncrementarVisualizacionesAsync(int id);
    }

    public class PublicacionService : IPublicacionService
    {
        private readonly ApplicationDbContext _context;

        public PublicacionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PublicacionDto?> ObtenerPorIdAsync(int id)
        {
            var publicacion = await _context.Publicaciones
                .Include(p => p.Usuario)
                .Include(p => p.Comentarios)
                .ThenInclude(c => c.Usuario)
                .FirstOrDefaultAsync(p => p.Id == id && p.Activo);

            if (publicacion == null) return null;
            return MapearADto(publicacion);
        }

        public async Task<List<PublicacionDto>> ObtenerTodasAsync()
        {
            var publicaciones = await _context.Publicaciones
                .Include(p => p.Usuario)
                .Include(p => p.Comentarios)
                .ThenInclude(c => c.Usuario)
                .Where(p => p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return publicaciones.Select(MapearADto).ToList();
        }

        public async Task<List<PublicacionDto>> ObtenerPorUsuarioAsync(int usuarioId)
        {
            var publicaciones = await _context.Publicaciones
                .Include(p => p.Usuario)
                .Include(p => p.Comentarios)
                .ThenInclude(c => c.Usuario)
                .Where(p => p.UsuarioId == usuarioId && p.Activo)
                .OrderByDescending(p => p.FechaCreacion)
                .ToListAsync();

            return publicaciones.Select(MapearADto).ToList();
        }

        public async Task<PublicacionDto> CrearAsync(int usuarioId, CreatePublicacionDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario == null)
                throw new KeyNotFoundException("Usuario no encontrado");

            var publicacion = new Publicacion
            {
                UsuarioId = usuarioId,
                Titulo = dto.Titulo,
                Contenido = dto.Contenido,
                ImagenUrl = dto.ImagenUrl,
                Tipo = dto.Tipo,
                FechaCreacion = DateTime.UtcNow,
                Visualizaciones = 0,
                Activo = true
            };

            _context.Publicaciones.Add(publicacion);
            await _context.SaveChangesAsync();
            return await ObtenerPorIdAsync(publicacion.Id) ?? new PublicacionDto();
        }

        public async Task<PublicacionDto> ActualizarAsync(int id, int usuarioId, UpdatePublicacionDto dto)
        {
            var publicacion = await _context.Publicaciones.FindAsync(id);
            if (publicacion == null)
                throw new KeyNotFoundException("Publicación no encontrada");

            if (publicacion.UsuarioId != usuarioId)
                throw new UnauthorizedAccessException("No tienes permiso para editar esta publicación");

            if (!string.IsNullOrEmpty(dto.Titulo))
                publicacion.Titulo = dto.Titulo;
            if (!string.IsNullOrEmpty(dto.Contenido))
                publicacion.Contenido = dto.Contenido;
            if (!string.IsNullOrEmpty(dto.ImagenUrl))
                publicacion.ImagenUrl = dto.ImagenUrl;
            if (dto.Activo.HasValue)
                publicacion.Activo = dto.Activo.Value;

            publicacion.FechaActualizacion = DateTime.UtcNow;
            _context.Publicaciones.Update(publicacion);
            await _context.SaveChangesAsync();
            return await ObtenerPorIdAsync(id) ?? new PublicacionDto();
        }

        public async Task<bool> EliminarAsync(int id, int usuarioId)
        {
            var publicacion = await _context.Publicaciones.FindAsync(id);
            if (publicacion == null) return false;

            if (publicacion.UsuarioId != usuarioId)
                throw new UnauthorizedAccessException("No tienes permiso para eliminar esta publicación");

            publicacion.Activo = false;
            _context.Publicaciones.Update(publicacion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PublicacionDto> AgregarComentarioAsync(int publicacionId, int usuarioId, CreateComentarioDto dto)
        {
            var publicacion = await _context.Publicaciones.FindAsync(publicacionId);
            if (publicacion == null || !publicacion.Activo)
                throw new KeyNotFoundException("Publicación no encontrada");

            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario == null)
                throw new KeyNotFoundException("Usuario no encontrado");

            var comentario = new Comentario
            {
                PublicacionId = publicacionId,
                UsuarioId = usuarioId,
                Contenido = dto.Contenido,
                FechaCreacion = DateTime.UtcNow,
                Activo = true
            };

            _context.Comentarios.Add(comentario);
            await _context.SaveChangesAsync();
            return await ObtenerPorIdAsync(publicacionId) ?? new PublicacionDto();
        }

        public async Task<bool> RemoverComentarioAsync(int comentarioId, int usuarioId)
        {
            var comentario = await _context.Comentarios.FindAsync(comentarioId);
            if (comentario == null) return false;

            if (comentario.UsuarioId != usuarioId)
                throw new UnauthorizedAccessException("No tienes permiso para eliminar este comentario");

            comentario.Activo = false;
            _context.Comentarios.Update(comentario);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<PublicacionDto> AgregarLikeComentarioAsync(int comentarioId)
        {
            var comentario = await _context.Comentarios
                .Include(c => c.Publicacion)
                .FirstOrDefaultAsync(c => c.Id == comentarioId);

            if (comentario == null)
                throw new KeyNotFoundException("Comentario no encontrado");

            comentario.Likes++;
            _context.Comentarios.Update(comentario);
            await _context.SaveChangesAsync();

            return await ObtenerPorIdAsync(comentario.PublicacionId) ?? new PublicacionDto();
        }

        public async Task<bool> IncrementarVisualizacionesAsync(int id)
        {
            var publicacion = await _context.Publicaciones.FindAsync(id);
            if (publicacion == null) return false;

            publicacion.Visualizaciones++;
            _context.Publicaciones.Update(publicacion);
            await _context.SaveChangesAsync();
            return true;
        }

        private PublicacionDto MapearADto(Publicacion publicacion)
        {
            return new PublicacionDto
            {
                Id = publicacion.Id,
                UsuarioId = publicacion.UsuarioId,
                NombreUsuario = publicacion.Usuario?.Nombre,
                Titulo = publicacion.Titulo,
                Contenido = publicacion.Contenido,
                ImagenUrl = publicacion.ImagenUrl,
                Tipo = publicacion.Tipo,
                FechaCreacion = publicacion.FechaCreacion,
                Visualizaciones = publicacion.Visualizaciones,
                Activo = publicacion.Activo,
                Comentarios = publicacion.Comentarios
                    .Where(c => c.Activo)
                    .Select(c => new ComentarioDto
                    {
                        Id = c.Id,
                        PublicacionId = c.PublicacionId,
                        UsuarioId = c.UsuarioId,
                        NombreUsuario = c.Usuario?.Nombre,
                        Contenido = c.Contenido,
                        FechaCreacion = c.FechaCreacion,
                        Likes = c.Likes,
                        Activo = c.Activo
                    }).ToList()
            };
        }
    }
}
