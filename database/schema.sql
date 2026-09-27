USE Negocios2;
GO

-- ROLES

CREATE TABLE dbo.roles (
    id_rol TINYINT NOT NULL PRIMARY KEY,
    nombre NVARCHAR(30) NOT NULL UNIQUE,
    descripcion NVARCHAR(250) NULL
);
GO

INSERT INTO dbo.roles (
    id_rol,
    nombre,
    descripcion
)
VALUES
(
    1,
    N'SUPER_ADMIN',
    N'Administrador general con acceso total al sistema'
),
(
    2,
    N'ADMIN',
    N'Administrador operativo con acceso a CRM y SCM'
),
(
    3,
    N'CLIENTE',
    N'Cliente con acceso limitado a sus funciones'
);
GO


-- USUARIOS

CREATE TABLE dbo.usuarios (
    id_usuario INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    nombre NVARCHAR(120) NOT NULL,

    correo NVARCHAR(180) NOT NULL,

    password_hash NVARCHAR(255) NOT NULL,

    id_rol TINYINT NOT NULL,

    estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_usuarios_estado
        DEFAULT N'activo',

    fecha_creacion DATETIME2 NOT NULL
        CONSTRAINT DF_usuarios_fecha_creacion
        DEFAULT SYSDATETIME(),

    ultimo_acceso DATETIME2 NULL,

    CONSTRAINT UQ_usuarios_correo
        UNIQUE (correo),

    CONSTRAINT FK_usuarios_roles
        FOREIGN KEY (id_rol)
        REFERENCES dbo.roles(id_rol),

    CONSTRAINT CK_usuarios_estado
        CHECK (
            estado IN (
                N'activo',
                N'bloqueado',
                N'inactivo'
            )
        )
);
GO


-- CLIENTES CRM

CREATE TABLE dbo.clientes (
    id_cliente INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    usuario_id INT NULL,

    nombre NVARCHAR(150) NOT NULL,

    correo NVARCHAR(180) NULL,

    telefono NVARCHAR(40) NULL,

    empresa NVARCHAR(150) NULL,

    fecha_registro DATETIME2 NOT NULL
        CONSTRAINT DF_clientes_fecha_registro
        DEFAULT SYSDATETIME(),

    estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_clientes_estado
        DEFAULT N'activo',

    etapa_crm NVARCHAR(30) NOT NULL
        CONSTRAINT DF_clientes_etapa
        DEFAULT N'Prospecto',

    notas NVARCHAR(1000) NULL,

    CONSTRAINT FK_clientes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuarios(id_usuario),

    CONSTRAINT CK_clientes_estado
        CHECK (
            estado IN (
                N'activo',
                N'inactivo'
            )
        ),

    CONSTRAINT CK_clientes_etapa
        CHECK (
            etapa_crm IN (
                N'Prospecto',
                N'Activo',
                N'Frecuente',
                N'Inactivo'
            )
        )
);
GO

CREATE UNIQUE INDEX UX_clientes_usuario
ON dbo.clientes(usuario_id)
WHERE usuario_id IS NOT NULL;
GO


-- INTERACCIONES CRM

CREATE TABLE dbo.interacciones (
    id_interaccion INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    cliente_id INT NOT NULL,

    usuario_id INT NOT NULL,

    tipo NVARCHAR(30) NOT NULL,

    descripcion NVARCHAR(1000) NOT NULL,

    fecha DATETIME2 NOT NULL
        CONSTRAINT DF_interacciones_fecha
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_interacciones_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES dbo.clientes(id_cliente)
        ON DELETE CASCADE,

    CONSTRAINT FK_interacciones_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuarios(id_usuario),

    CONSTRAINT CK_interacciones_tipo
        CHECK (
            tipo IN (
                N'Llamada',
                N'Correo',
                N'Reunión'
            )
        )
);
GO


-- EVALUACIONES CRM

CREATE TABLE dbo.evaluaciones (
    id_evaluacion INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    cliente_id INT NOT NULL,

    usuario_id INT NULL,

    puntuacion TINYINT NOT NULL,

    comentario NVARCHAR(1000) NULL,

    fecha DATETIME2 NOT NULL
        CONSTRAINT DF_evaluaciones_fecha
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_evaluaciones_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES dbo.clientes(id_cliente)
        ON DELETE CASCADE,

    CONSTRAINT FK_evaluaciones_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuarios(id_usuario),

    CONSTRAINT CK_evaluaciones_puntuacion
        CHECK (
            puntuacion BETWEEN 1 AND 5
        )
);
GO


-- CATEGORÍAS

CREATE TABLE dbo.categorias (
    id_categoria INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    nombre NVARCHAR(120) NOT NULL,

    descripcion NVARCHAR(500) NULL,

    estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_categorias_estado
        DEFAULT N'activo',

    CONSTRAINT UQ_categorias_nombre
        UNIQUE (nombre),

    CONSTRAINT CK_categorias_estado
        CHECK (
            estado IN (
                N'activo',
                N'inactivo'
            )
        )
);
GO


-- PROVEEDORES

CREATE TABLE dbo.proveedores (
    id_proveedor INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    nombre NVARCHAR(150) NOT NULL,

    contacto NVARCHAR(150) NULL,

    correo NVARCHAR(180) NULL,

    telefono NVARCHAR(40) NULL,

    direccion NVARCHAR(300) NULL,

    estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_proveedores_estado
        DEFAULT N'activo',

    fecha_registro DATETIME2 NOT NULL
        CONSTRAINT DF_proveedores_fecha
        DEFAULT SYSDATETIME(),

    CONSTRAINT CK_proveedores_estado
        CHECK (
            estado IN (
                N'activo',
                N'inactivo'
            )
        )
);
GO


-- PRODUCTOS

CREATE TABLE dbo.productos (
    id_producto INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    sku NVARCHAR(80) NOT NULL,

    nombre NVARCHAR(180) NOT NULL,

    descripcion NVARCHAR(1000) NULL,

    id_categoria INT NOT NULL,

    marca NVARCHAR(120) NULL,

    proveedor_id INT NULL,

    costo_unitario DECIMAL(12,2) NOT NULL
        CONSTRAINT DF_productos_costo
        DEFAULT 0,

    precio_venta DECIMAL(12,2) NOT NULL
        CONSTRAINT DF_productos_precio_venta
        DEFAULT 0,

    stock_actual INT NOT NULL
        CONSTRAINT DF_productos_stock_actual
        DEFAULT 0,

    stock_minimo INT NOT NULL
        CONSTRAINT DF_productos_stock_minimo
        DEFAULT 0,

    estrategia_logistica NVARCHAR(10) NOT NULL
        CONSTRAINT DF_productos_estrategia
        DEFAULT N'PULL',

    imagen_url NVARCHAR(500) NULL,

    estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_productos_estado
        DEFAULT N'activo',

    fecha_registro DATETIME2 NOT NULL
        CONSTRAINT DF_productos_fecha
        DEFAULT SYSDATETIME(),

    fecha_actualizacion DATETIME2 NOT NULL
        CONSTRAINT DF_productos_actualizacion
        DEFAULT SYSDATETIME(),

    CONSTRAINT UQ_productos_sku
        UNIQUE (sku),

    CONSTRAINT FK_productos_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES dbo.categorias(id_categoria),

    CONSTRAINT FK_productos_proveedor
        FOREIGN KEY (proveedor_id)
        REFERENCES dbo.proveedores(id_proveedor),

    CONSTRAINT CK_productos_costo
        CHECK (
            costo_unitario >= 0
        ),

    CONSTRAINT CK_productos_precio
        CHECK (
            precio_venta >= 0
        ),

    CONSTRAINT CK_productos_stock
        CHECK (
            stock_actual >= 0
            AND stock_minimo >= 0
        ),

    CONSTRAINT CK_productos_estrategia
        CHECK (
            estrategia_logistica IN (
                N'PUSH',
                N'PULL'
            )
        ),

    CONSTRAINT CK_productos_estado
        CHECK (
            estado IN (
                N'activo',
                N'inactivo'
            )
        )
);
GO


-- VEHÍCULOS

CREATE TABLE dbo.vehiculos (
    id_vehiculo INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    marca NVARCHAR(100) NOT NULL,

    modelo NVARCHAR(120) NOT NULL,

    anio_desde SMALLINT NULL,

    anio_hasta SMALLINT NULL,

    CONSTRAINT CK_vehiculos_anios
        CHECK (
            anio_desde IS NULL
            OR anio_hasta IS NULL
            OR anio_hasta >= anio_desde
        )
);
GO


-- COMPATIBILIDAD PRODUCTO - VEHÍCULO

CREATE TABLE dbo.producto_vehiculo (
    producto_id INT NOT NULL,

    vehiculo_id INT NOT NULL,

    CONSTRAINT PK_producto_vehiculo
        PRIMARY KEY (
            producto_id,
            vehiculo_id
        ),

    CONSTRAINT FK_producto_vehiculo_producto
        FOREIGN KEY (producto_id)
        REFERENCES dbo.productos(id_producto)
        ON DELETE CASCADE,

    CONSTRAINT FK_producto_vehiculo_vehiculo
        FOREIGN KEY (vehiculo_id)
        REFERENCES dbo.vehiculos(id_vehiculo)
        ON DELETE CASCADE
);
GO


-- MOVIMIENTOS DE INVENTARIO

CREATE TABLE dbo.movimientos_inventario (
    id_movimiento INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    producto_id INT NOT NULL,

    usuario_id INT NOT NULL,

    tipo NVARCHAR(20) NOT NULL,

    cantidad INT NOT NULL,

    motivo NVARCHAR(30) NOT NULL,

    descripcion NVARCHAR(500) NULL,

    stock_anterior INT NULL,

    stock_resultante INT NULL,

    fecha DATETIME2 NOT NULL
        CONSTRAINT DF_movimientos_fecha
        DEFAULT SYSDATETIME(),

    CONSTRAINT FK_movimientos_producto
        FOREIGN KEY (producto_id)
        REFERENCES dbo.productos(id_producto),

    CONSTRAINT FK_movimientos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuarios(id_usuario),

    CONSTRAINT CK_movimientos_tipo
        CHECK (
            tipo IN (
                N'entrada',
                N'salida'
            )
        ),

    CONSTRAINT CK_movimientos_cantidad
        CHECK (
            cantidad > 0
        ),

    CONSTRAINT CK_movimientos_motivo
        CHECK (
            motivo IN (
                N'venta',
                N'ajuste',
                N'reposición'
            )
        ),

    CONSTRAINT CK_movimientos_stock
        CHECK (
            (stock_anterior IS NULL OR stock_anterior >= 0)
            AND
            (stock_resultante IS NULL OR stock_resultante >= 0)
        )
);
GO


-- PEDIDOS SCM

CREATE TABLE dbo.pedidos (
    id_pedido INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

    producto_id INT NOT NULL,

    cliente_id INT NULL,

    usuario_id INT NOT NULL,

    cantidad INT NOT NULL,

    tipo NVARCHAR(20) NOT NULL,

    estado NVARCHAR(20) NOT NULL
        CONSTRAINT DF_pedidos_estado
        DEFAULT N'pendiente',

    fecha DATETIME2 NOT NULL
        CONSTRAINT DF_pedidos_fecha
        DEFAULT SYSDATETIME(),

    fecha_surtido DATETIME2 NULL,

    CONSTRAINT FK_pedidos_producto
        FOREIGN KEY (producto_id)
        REFERENCES dbo.productos(id_producto),

    CONSTRAINT FK_pedidos_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES dbo.clientes(id_cliente),

    CONSTRAINT FK_pedidos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES dbo.usuarios(id_usuario),

    CONSTRAINT CK_pedidos_cantidad
        CHECK (
            cantidad > 0
        ),

    CONSTRAINT CK_pedidos_tipo
        CHECK (
            tipo IN (
                N'reposición',
                N'venta'
            )
        ),

    CONSTRAINT CK_pedidos_estado
        CHECK (
            estado IN (
                N'pendiente',
                N'surtido'
            )
        )
);
GO


-- CONFIGURACIÓN SCM

CREATE TABLE dbo.configuracion_scm (
    id_configuracion TINYINT NOT NULL PRIMARY KEY,

    nivel_scm NVARCHAR(30) NOT NULL
        CONSTRAINT DF_configuracion_scm_nivel
        DEFAULT N'Inicial',

    fecha_actualizacion DATETIME2 NOT NULL
        CONSTRAINT DF_configuracion_scm_fecha
        DEFAULT SYSDATETIME(),

    usuario_actualizacion INT NULL,

    CONSTRAINT FK_configuracion_scm_usuario
        FOREIGN KEY (usuario_actualizacion)
        REFERENCES dbo.usuarios(id_usuario),

    CONSTRAINT CK_configuracion_scm_nivel
        CHECK (
            nivel_scm IN (
                N'Inicial',
                N'En desarrollo',
                N'Optimizado'
            )
        )
);
GO

INSERT INTO dbo.configuracion_scm (
    id_configuracion,
    nivel_scm
)
VALUES (
    1,
    N'Inicial'
);
GO


-- VISTA DE INVENTARIO

CREATE VIEW dbo.vw_inventario
AS
SELECT
    p.id_producto,
    p.sku,
    p.nombre AS producto,
    c.nombre AS categoria,
    p.marca,
    pr.nombre AS proveedor,
    p.stock_actual,
    p.stock_minimo,
    p.costo_unitario,
    p.precio_venta,
    p.estrategia_logistica,
    p.estado,

    CASE
        WHEN p.stock_actual <= p.stock_minimo
            THEN 1
        ELSE 0
    END AS stock_bajo

FROM dbo.productos p

INNER JOIN dbo.categorias c
    ON c.id_categoria = p.id_categoria

LEFT JOIN dbo.proveedores pr
    ON pr.id_proveedor = p.proveedor_id;
GO


-- ÍNDICES CRM

CREATE INDEX IX_clientes_nombre
ON dbo.clientes(nombre);
GO

CREATE INDEX IX_clientes_estado
ON dbo.clientes(estado);
GO

CREATE INDEX IX_clientes_etapa
ON dbo.clientes(etapa_crm);
GO

CREATE INDEX IX_interacciones_cliente_fecha
ON dbo.interacciones (
    cliente_id,
    fecha DESC
);
GO


-- ÍNDICES SCM

CREATE INDEX IX_productos_nombre
ON dbo.productos(nombre);
GO

CREATE INDEX IX_productos_categoria
ON dbo.productos(id_categoria);
GO

CREATE INDEX IX_productos_proveedor
ON dbo.productos(proveedor_id);
GO

CREATE INDEX IX_productos_estrategia
ON dbo.productos(estrategia_logistica);
GO

CREATE INDEX IX_movimientos_producto_fecha
ON dbo.movimientos_inventario (
    producto_id,
    fecha DESC
);
GO

CREATE INDEX IX_pedidos_producto
ON dbo.pedidos(producto_id);
GO

CREATE INDEX IX_pedidos_estado
ON dbo.pedidos(estado);
GO


-- CATEGORÍAS INICIALES

INSERT INTO dbo.categorias (
    nombre,
    descripcion
)
VALUES
(
    N'Iluminación',
    N'Faros, focos LED, barras de iluminación y accesorios relacionados'
),
(
    N'Audio',
    N'Estéreos, bocinas, amplificadores y accesorios de audio'
),
(
    N'Interior',
    N'Accesorios para personalización y comodidad interior'
),
(
    N'Exterior',
    N'Accesorios y elementos para personalización exterior'
),
(
    N'Seguridad',
    N'Alarmas, sensores, cámaras y accesorios de seguridad'
),
(
    N'Electrónica',
    N'Dispositivos y accesorios electrónicos para automóviles'
),
(
    N'Rines y accesorios',
    N'Accesorios relacionados con ruedas, rines y neumáticos'
),
(
    N'Limpieza y cuidado',
    N'Productos y accesorios para limpieza y mantenimiento estético'
),
(
    N'Herramientas',
    N'Herramientas y equipos para mantenimiento automotriz'
),
(
    N'Accesorios universales',
    N'Productos compatibles con diversos vehículos'
);
GO