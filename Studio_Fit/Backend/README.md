# Studio Fit Backend API

API REST profesional para el e-commerce y comunidad de fitness **Studio Fit**.

## 🚀 Características

- **Gestión de Usuarios**: Registro, login, perfiles
- **Catálogo de Productos**: Suplementos, ropa, equipo
- **Carrito de Compras**: Agregar/remover items, actualizar cantidades
- **Pedidos**: Crear, rastrear, cambiar estado
- **Promociones**: Validar cupones, aplica descuentos
- **Comunidad**: Publicaciones, comentarios, likes
- **Base de Datos**: SQL Server con Entity Framework Core
- **API Documentation**: Swagger/OpenAPI

## 📋 Stack Tecnológico

- **.NET 8.0** C# moderno con características de vanguardia
- **Entity Framework Core 8.0** ORM para SQL Server
- **SQL Server** Base de datos relacional
- **ASP.NET Core** Framework web
- **Swagger** Documentación interactiva de API
- **CORS** Comunicación con frontends

## 🗂️ Estructura del Proyecto

```
Backend/
├── Models/              # Entidades de dominio (Usuario, Producto, etc)
├── DTOs/               # Data Transfer Objects (request/response)
├── Services/           # Lógica de negocio
├── Controllers/        # Endpoints de API REST
├── Data/               # DbContext y configuración de EF
├── Migrations/         # Migraciones de base de datos
├── Program.cs          # Configuración de la aplicación
├── appsettings.json    # Configuración de producción
├── appsettings.Development.json  # Configuración de desarrollo
└── StudioFit.Backend.csproj       # Definición del proyecto .NET
```

## 🔧 Instalación y Configuración

### Requisitos Previos

- .NET 8.0 SDK o superior
- SQL Server 2019 o superior (o SQL Server Express)
- Visual Studio 2022 Community (opcional pero recomendado)

### Pasos de Instalación

1. **Clonar o descargar el repositorio**
   ```bash
   cd Studio_Fit/Backend
   ```

2. **Restaurar dependencias**
   ```bash
   dotnet restore
   ```

3. **Configurar la base de datos**
   - Editar `appsettings.Development.json` con tu connection string de SQL Server
   - Por defecto usa: `Server=.;Database=StudioFitDb_Dev;...`

4. **Aplicar migraciones**
   ```bash
   dotnet ef database update
   ```

5. **Ejecutar la aplicación**
   ```bash
   dotnet run
   ```

6. **Acceder a Swagger**
   ```
   http://localhost:5000/swagger
   ```

## 📡 Endpoints Principales

### Usuarios
- `POST /api/usuarios/registro` - Registrar nuevo usuario
- `POST /api/usuarios/login` - Login
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/{id}` - Obtener usuario por ID
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `DELETE /api/usuarios/{id}` - Eliminar usuario

### Productos
- `GET /api/productos` - Listar todos los productos
- `GET /api/productos/{id}` - Obtener producto por ID
- `GET /api/productos/categoria/{categoria}` - Filtrar por categoría
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/{id}` - Actualizar producto (admin)
- `DELETE /api/productos/{id}` - Eliminar producto (admin)

### Carrito
- `GET /api/carritos/usuario/{usuarioId}` - Ver carrito
- `POST /api/carritos/usuario/{usuarioId}/agregar` - Agregar item
- `PUT /api/carritos/usuario/{usuarioId}/item/{detalleId}` - Actualizar cantidad
- `DELETE /api/carritos/usuario/{usuarioId}/item/{detalleId}` - Remover item
- `DELETE /api/carritos/usuario/{usuarioId}/vaciar` - Vaciar carrito

### Pedidos
- `POST /api/pedidos/usuario/{usuarioId}/crear` - Crear pedido desde carrito
- `GET /api/pedidos/{id}` - Obtener pedido
- `GET /api/pedidos/usuario/{usuarioId}` - Historial de pedidos
- `GET /api/pedidos` - Todos los pedidos (admin)
- `PUT /api/pedidos/{id}/estado` - Cambiar estado del pedido

### Promociones
- `POST /api/promociones/validar` - Validar código de promoción
- `GET /api/promociones` - Listar promociones activas
- `GET /api/promociones/codigo/{codigo}` - Obtener promoción
- `POST /api/promociones` - Crear promoción (admin)
- `PUT /api/promociones/{id}` - Actualizar promoción (admin)
- `DELETE /api/promociones/{id}` - Eliminar promoción (admin)

### Publicaciones
- `GET /api/publicaciones` - Listar todas las publicaciones
- `GET /api/publicaciones/{id}` - Ver publicación
- `GET /api/publicaciones/usuario/{usuarioId}` - Publicaciones del usuario
- `POST /api/publicaciones/usuario/{usuarioId}` - Crear publicación
- `PUT /api/publicaciones/{id}/usuario/{usuarioId}` - Editar publicación
- `DELETE /api/publicaciones/{id}/usuario/{usuarioId}` - Eliminar publicación
- `POST /api/publicaciones/{id}/comentarios/usuario/{usuarioId}` - Agregar comentario
- `DELETE /api/publicaciones/comentarios/{comentarioId}/usuario/{usuarioId}` - Eliminar comentario

## 🔐 Modelo de Datos

### Usuarios
- Registro y login con contraseñas hasheadas
- Roles: usuario, admin
- Seguimiento de último acceso

### Productos
- Catálogo con categorías
- Control de stock
- Imágenes y descripciones

### Pedidos
- Carrito de compras previo
- Estados: pendiente, confirmado, enviado, entregado, cancelado
- Métodos de pago: tarjeta, paypal, transferencia

### Promociones
- Descuentos por porcentaje o monto fijo
- Validez temporal
- Límite de usos

### Comunidad
- Publicaciones con imágenes
- Comentarios anidados
- Sistema de likes

## 🌐 CORS y Configuración

El Backend está configurado para aceptar peticiones desde:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternative)

Modificar en `Program.cs` según necesidad.

## 📝 Desarrollo

### Agregar una Nueva Entidad

1. Crear modelo en `Models/`
2. Agregar DbSet en `ApplicationDbContext`
3. Crear DTOs en `DTOs/`
4. Crear servicio en `Services/`
5. Crear controlador en `Controllers/`
6. Crear migración: `dotnet ef migrations add [NombreMigracion]`
7. Actualizar BD: `dotnet ef database update`

### Generar Migraciones

```bash
dotnet ef migrations add NombreDeLaMigracion
dotnet ef database update
```

## 🐛 Troubleshooting

### Error de Connection String
- Verificar que SQL Server está en ejecución
- Revisar `appsettings.Development.json`
- Usar SQL Server Management Studio para validar conexión

### Error en Migraciones
```bash
dotnet ef database update --verbose
```

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**Studio Fit Backend API** - Versión 1.0
Desarrollado con .NET 8.0 y Entity Framework Core
