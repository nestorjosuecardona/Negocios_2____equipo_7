using Microsoft.EntityFrameworkCore;
using StudioFit.Backend.Data;
using StudioFit.Backend.Services;

var builder = WebApplicationBuilder.CreateBuilder(args);

// Configurar conexión a SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.MigrationsAssembly("StudioFit.Backend");
    }));

// Agregar servicios
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<ICarritoService, CarritoService>();
builder.Services.AddScoped<IPedidoService, PedidoService>();
builder.Services.AddScoped<IPromocionService, PromocionService>();
builder.Services.AddScoped<IPublicacionService, PublicacionService>();

// Agregar controladores
builder.Services.AddControllers();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", corsPolicyBuilder =>
    {
        corsPolicyBuilder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });

    options.AddPolicy("AllowLocalhost", corsPolicyBuilder =>
    {
        corsPolicyBuilder
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Swagger
var apiSettings = builder.Configuration.GetSection("ApiSettings");
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = apiSettings.GetValue<string>("Title") ?? "Studio Fit API",
        Version = apiSettings.GetValue<string>("Version") ?? "v1",
        Description = apiSettings.GetValue<string>("Description") ?? "API REST para Studio Fit"
    });
});

var app = builder.Build();

// Aplicar migraciones pendientes automáticamente
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Studio Fit API V1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Usar CORS
app.UseCors("AllowLocalhost");

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow })
    .WithName("Health")
    .WithOpenApi()
    .Produces<object>(StatusCodes.Status200OK);

app.Run();
