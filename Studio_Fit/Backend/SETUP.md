# Guía de Configuración e Instalación - Studio Fit Backend

## ✅ Lo que ya está listo

Se ha creado una estructura completa y profesional para el backend de Studio Fit con:

### 📦 Capas de la Aplicación

1. **Models** (9 entidades)
   - `Usuario` - Usuarios del sistema
   - `Producto` - Catálogo de productos
   - `Carrito` - Carrito de compras
   - `DetalleCarrito` - Items en el carrito
   - `Pedido` - Órdenes de compra
   - `DetallePedido` - Items en pedidos
   - `Promocion` - Cupones y ofertas
   - `Publicacion` - Publicaciones de comunidad
   - `Comentario` - Comentarios en publicaciones

2. **DTOs** (Data Transfer Objects)
   - DTOs de Request/Response para cada entidad
   - Validación de datos en entrada/salida

3. **Services** (Lógica de Negocio)
   - `IUsuarioService` - Gestión de usuarios y autenticación
   - `IProductoService` - Catálogo y stock
   - `ICarritoService` - Carrito de compras
   - `IPedidoService` - Pedidos y órdenes
   - `IPromocionService` - Validación de promociones
   - `IPublicacionService` - Comunidad y comentarios

4. **Controllers** (API REST)
   - `UsuariosController` - Endpoints de usuarios
   - `ProductosController` - Endpoints de productos
   - `CarritosController` - Endpoints de carrito
   - `PedidosController` - Endpoints de pedidos
   - `PromocionesController` - Endpoints de promociones
   - `PublicacionesController` - Endpoints de publicaciones

5. **Data Access**
   - `ApplicationDbContext` - Context de Entity Framework Core
   - Migraciones ya generadas
   - Índices y relaciones configuradas

6. **Configuración**
   - `Program.cs` - Bootstrap de la aplicación
   - `appsettings.json` - Configuración de producción
   - `appsettings.Development.json` - Configuración de desarrollo
   - `.gitignore` - Archivos a ignorar en Git
   - `StudioFit.Backend.csproj` - Definición del proyecto

## 🚀 Próximos Pasos para Poner en Funcionamiento

### Paso 1: Preparar el entorno
```bash
# En PowerShell o terminal
cd C:\Users\nesto\ReposUni\Neg2\Studio_Fit\Backend

# Restaurar paquetes NuGet
dotnet restore
```

### Paso 2: Configurar SQL Server
- Asegúrate de que SQL Server está ejecutándose
- Si usas SQL Server Express (default), la connection string es:
  ```
  Server=.;Database=StudioFitDb_Dev;Trusted_Connection=true;MultipleActiveResultSels=true;TrustServerCertificate=true
  ```
- Si tienes SQL Server en otra máquina/instancia, edita `appsettings.Development.json`

### Paso 3: Aplicar migraciones
```bash
# Crear la base de datos y aplicar todas las migraciones
dotnet ef database update
```

### Paso 4: Ejecutar la aplicación
```bash
# En desarrollo con auto-reload
dotnet watch run

# O simplemente
dotnet run
```

La API estará disponible en: `https://localhost:5001` (HTTPS) o `http://localhost:5000` (HTTP)

### Paso 5: Verificar Swagger
Abre el navegador y ve a:
```
http://localhost:5000/swagger
```

Deberías ver la documentación interactiva de la API con todos los endpoints.

## 🔐 Seguridad y Mejoras Futuras

### Implementar después:
- [ ] JWT Authentication - Tokens seguros para la autenticación
- [ ] Role-based Authorization - Control de roles (admin, usuario)
- [ ] Encriptación - Datos sensibles encriptados
- [ ] Rate Limiting - Protección contra ataques DDoS
- [ ] Validaciones - Validación adicional de entrada
- [ ] Logging - Sistema centralizado de logs
- [ ] Payment Gateway - Integración con pasarelas de pago
- [ ] Email Notifications - Confirmaciones y notificaciones por email

## 📱 Frontend Integration

Una vez que el backend esté corriendo, el frontend (HTML/JS) puede consumir los endpoints:

### Ejemplo con Fetch API
```javascript
// Login
const response = await fetch('http://localhost:5000/api/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
	correo: 'usuario@example.com', 
	contraseña: 'password123' 
  })
});
const data = await response.json();
console.log(data);

// Obtener productos
const productos = await fetch('http://localhost:5000/api/productos');
const productosData = await productos.json();
console.log(productosData);
```

### Ejemplo con Axios (si usas React)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Login
const login = async (correo, contraseña) => {
  const response = await api.post('/usuarios/login', { correo, contraseña });
  return response.data;
};

// Obtener productos
const getProductos = async () => {
  const response = await api.get('/productos');
  return response.data;
};
```

## 🐛 Troubleshooting

### Error: "Unable to resolve service for type"
- Solución: Verificar que el servicio está registrado en Program.cs

### Error: "Connection timeout"
- Solución: Verificar que SQL Server está corriendo
- En Windows: Services → SQL Server (MSSQLSERVER)

### Error: "Migrations pending"
- Solución: Ejecutar `dotnet ef database update`

### Error: CORS (en frontend)
- Si el frontend está en diferente puerto, el backend ya está configurado para aceptar localhost:3000, 5173, 5174

## 📚 Documentación Adicional

- [Entity Framework Core Docs](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [SQL Server Documentation](https://learn.microsoft.com/en-us/sql/sql-server/)
- [Swagger/OpenAPI](https://swagger.io/)

## 📝 Notas Importantes

- **Contraseñas**: Se hashean con SHA256 (hacer upgrade a bcrypt en producción)
- **CORS**: Configurado para desarrollo local, review para producción
- **Autenticación**: Actualmente básica, implementar JWT
- **Validaciones**: Agregar más validaciones según reglas de negocio

---

**Estado**: Backend listo para compilar y ejecutar
**Próximo paso**: Refactorizar frontend para consumir esta API REST
