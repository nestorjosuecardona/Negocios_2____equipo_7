using StudioFit.Backend.Data;
using StudioFit.Backend.DTOs;
using StudioFit.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace StudioFit.Backend.Services
{
    /// <summary>
    /// Servicio para gestionar usuarios
    /// </summary>
    public interface IUsuarioService
    {
        Task<UsuarioDto?> ObtenerPorIdAsync(int id);
        Task<UsuarioDto?> ObtenerPorCorreoAsync(string correo);
        Task<List<UsuarioDto>> ObtenerTodosAsync();
        Task<UsuarioDto> CrearAsync(CreateUsuarioDto dto);
        Task<UsuarioDto> ActualizarAsync(int id, UpdateUsuarioDto dto);
        Task<bool> EliminarAsync(int id);
        Task<bool> VerificarContraseñaAsync(string correo, string contraseña);
        Task<UsuarioDto> ActualizarUltimoAccesoAsync(int id);
    }

    public class UsuarioService : IUsuarioService
    {
        private readonly ApplicationDbContext _context;

        public UsuarioService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UsuarioDto?> ObtenerPorIdAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return null;
            return MapearADto(usuario);
        }

        public async Task<UsuarioDto?> ObtenerPorCorreoAsync(string correo)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == correo);
            if (usuario == null) return null;
            return MapearADto(usuario);
        }

        public async Task<List<UsuarioDto>> ObtenerTodosAsync()
        {
            var usuarios = await _context.Usuarios
                .Where(u => u.Activo)
                .ToListAsync();
            return usuarios.Select(MapearADto).ToList();
        }

        public async Task<UsuarioDto> CrearAsync(CreateUsuarioDto dto)
        {
            // Verificar si el correo ya existe
            var existente = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == dto.Correo);
            if (existente != null)
                throw new InvalidOperationException("El correo ya está registrado");

            var usuario = new Usuario
            {
                Nombre = dto.Nombre,
                Correo = dto.Correo,
                PasswordHash = HashearContraseña(dto.Contraseña),
                Telefono = dto.Telefono,
                Direccion = dto.Direccion,
                Rol = "usuario",
                Activo = true,
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return MapearADto(usuario);
        }

        public async Task<UsuarioDto> ActualizarAsync(int id, UpdateUsuarioDto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                throw new KeyNotFoundException("Usuario no encontrado");

            if (!string.IsNullOrEmpty(dto.Nombre))
                usuario.Nombre = dto.Nombre;
            if (!string.IsNullOrEmpty(dto.Telefono))
                usuario.Telefono = dto.Telefono;
            if (!string.IsNullOrEmpty(dto.Direccion))
                usuario.Direccion = dto.Direccion;

            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return MapearADto(usuario);
        }

        public async Task<bool> EliminarAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return false;

            usuario.Activo = false;
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> VerificarContraseñaAsync(string correo, string contraseña)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == correo);
            if (usuario == null) return false;

            return VerificarHash(contraseña, usuario.PasswordHash);
        }

        public async Task<UsuarioDto> ActualizarUltimoAccesoAsync(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                throw new KeyNotFoundException("Usuario no encontrado");

            usuario.UltimoAcceso = DateTime.UtcNow;
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return MapearADto(usuario);
        }

        private string HashearContraseña(string contraseña)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(contraseña);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private bool VerificarHash(string contraseña, string hash)
        {
            var hashDeContraseña = HashearContraseña(contraseña);
            return hashDeContraseña == hash;
        }

        private UsuarioDto MapearADto(Usuario usuario)
        {
            return new UsuarioDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Correo = usuario.Correo,
                Telefono = usuario.Telefono,
                Direccion = usuario.Direccion,
                Rol = usuario.Rol,
                Activo = usuario.Activo,
                FechaCreacion = usuario.FechaCreacion,
                UltimoAcceso = usuario.UltimoAcceso
            };
        }
    }
}
