/*
  Migracion para la Unidad 3 (ERP).

  Base nueva: ejecutar primero create_database.sql y schema.sql.
  Base existente: ejecutar este archivo sobre Negocios2.

  El script es idempotente para que pueda volver a ejecutarse.
*/
USE Negocios2;
GO

SET XACT_ABORT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre = N'VENTAS')
BEGIN
    INSERT INTO dbo.roles (id_rol, nombre, descripcion)
    VALUES (4, N'VENTAS', N'Personal de ventas con acceso a órdenes empresariales.');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre = N'LOGISTICA')
BEGIN
    INSERT INTO dbo.roles (id_rol, nombre, descripcion)
    VALUES (5, N'LOGISTICA', N'Personal de logística con acceso a inventario y procesamiento de órdenes.');
END;
GO

IF OBJECT_ID(N'dbo.ordenes_erp', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ordenes_erp (
        id_orden INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ordenes_erp PRIMARY KEY,
        cliente_id INT NOT NULL,
        usuario_id INT NOT NULL,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_ordenes_erp_fecha DEFAULT SYSDATETIME(),
        fecha_procesada DATETIME2 NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_ordenes_erp_estado DEFAULT N'pendiente',
        total DECIMAL(12,2) NOT NULL CONSTRAINT DF_ordenes_erp_total DEFAULT 0,
        CONSTRAINT FK_ordenes_erp_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.clientes(id_cliente),
        CONSTRAINT FK_ordenes_erp_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id_usuario),
        CONSTRAINT CK_ordenes_erp_estado CHECK (estado IN (N'pendiente', N'procesada', N'cancelada')),
        CONSTRAINT CK_ordenes_erp_total CHECK (total >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.ordenes_erp_detalles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ordenes_erp_detalles (
        id_detalle INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ordenes_erp_detalles PRIMARY KEY,
        orden_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(12,2) NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        CONSTRAINT FK_ordenes_erp_detalles_orden FOREIGN KEY (orden_id)
            REFERENCES dbo.ordenes_erp(id_orden) ON DELETE CASCADE,
        CONSTRAINT FK_ordenes_erp_detalles_producto FOREIGN KEY (producto_id)
            REFERENCES dbo.productos(id_producto),
        CONSTRAINT UQ_ordenes_erp_detalles_producto UNIQUE (orden_id, producto_id),
        CONSTRAINT CK_ordenes_erp_detalles_cantidad CHECK (cantidad > 0),
        CONSTRAINT CK_ordenes_erp_detalles_precios CHECK (precio_unitario >= 0 AND subtotal >= 0)
    );
END;
GO

IF OBJECT_ID(N'dbo.procesos_erp', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.procesos_erp (
        id_proceso INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_procesos_erp PRIMARY KEY,
        orden_id INT NOT NULL,
        usuario_id INT NOT NULL,
        tipo NVARCHAR(30) NOT NULL,
        descripcion NVARCHAR(500) NOT NULL,
        fecha DATETIME2 NOT NULL CONSTRAINT DF_procesos_erp_fecha DEFAULT SYSDATETIME(),
        CONSTRAINT FK_procesos_erp_orden FOREIGN KEY (orden_id)
            REFERENCES dbo.ordenes_erp(id_orden) ON DELETE CASCADE,
        CONSTRAINT FK_procesos_erp_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id_usuario),
        CONSTRAINT CK_procesos_erp_tipo CHECK (tipo IN (N'creacion', N'procesamiento', N'cancelacion'))
    );
END;
GO

IF OBJECT_ID(N'dbo.configuracion_erp', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.configuracion_erp (
        id_configuracion TINYINT NOT NULL CONSTRAINT PK_configuracion_erp PRIMARY KEY,
        nivel_erp NVARCHAR(30) NOT NULL CONSTRAINT DF_configuracion_erp_nivel DEFAULT N'Básico',
        fecha_actualizacion DATETIME2 NOT NULL CONSTRAINT DF_configuracion_erp_fecha DEFAULT SYSDATETIME(),
        usuario_actualizacion INT NULL,
        CONSTRAINT FK_configuracion_erp_usuario FOREIGN KEY (usuario_actualizacion)
            REFERENCES dbo.usuarios(id_usuario),
        CONSTRAINT CK_configuracion_erp_id CHECK (id_configuracion = 1),
        CONSTRAINT CK_configuracion_erp_nivel CHECK (nivel_erp IN (N'Básico', N'Integrado', N'Automatizado', N'Optimizado'))
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.configuracion_erp WHERE id_configuracion = 1)
BEGIN
    INSERT INTO dbo.configuracion_erp (id_configuracion, nivel_erp)
    VALUES (1, N'Básico');
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ordenes_erp') AND name = N'IX_ordenes_erp_estado_fecha')
    CREATE INDEX IX_ordenes_erp_estado_fecha ON dbo.ordenes_erp(estado, fecha DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ordenes_erp') AND name = N'IX_ordenes_erp_cliente_fecha')
    CREATE INDEX IX_ordenes_erp_cliente_fecha ON dbo.ordenes_erp(cliente_id, fecha DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ordenes_erp_detalles') AND name = N'IX_ordenes_erp_detalles_producto')
    CREATE INDEX IX_ordenes_erp_detalles_producto ON dbo.ordenes_erp_detalles(producto_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.procesos_erp') AND name = N'IX_procesos_erp_orden_fecha')
    CREATE INDEX IX_procesos_erp_orden_fecha ON dbo.procesos_erp(orden_id, fecha DESC);
GO

/*
  Las tablas de venta son requeridas por el módulo de carrito existente.
  El esquema base incluido en el proyecto aún no las declaraba.
*/
IF OBJECT_ID(N'dbo.ventas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ventas (
        id_venta INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ventas PRIMARY KEY,
        cliente_id INT NOT NULL,
        usuario_id INT NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        total DECIMAL(12,2) NOT NULL,
        metodo_pago NVARCHAR(30) NOT NULL,
        nombre_recibe NVARCHAR(150) NOT NULL,
        telefono NVARCHAR(30) NOT NULL,
        direccion NVARCHAR(300) NOT NULL,
        ciudad NVARCHAR(100) NOT NULL,
        codigo_postal NVARCHAR(20) NOT NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_ventas_estado DEFAULT N'pendiente',
        fecha DATETIME2 NOT NULL CONSTRAINT DF_ventas_fecha DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.clientes(id_cliente),
        CONSTRAINT FK_ventas_usuario FOREIGN KEY (usuario_id) REFERENCES dbo.usuarios(id_usuario),
        CONSTRAINT CK_ventas_totales CHECK (subtotal >= 0 AND total >= 0),
        CONSTRAINT CK_ventas_metodo_pago CHECK (metodo_pago IN (N'efectivo', N'tarjeta')),
        CONSTRAINT CK_ventas_estado CHECK (estado IN (N'pendiente', N'confirmado', N'preparando', N'enviado', N'entregado', N'cancelado'))
    );
END;
GO

IF OBJECT_ID(N'dbo.venta_detalles', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.venta_detalles (
        id_detalle INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_venta_detalles PRIMARY KEY,
        venta_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(12,2) NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        CONSTRAINT FK_venta_detalles_venta FOREIGN KEY (venta_id)
            REFERENCES dbo.ventas(id_venta) ON DELETE CASCADE,
        CONSTRAINT FK_venta_detalles_producto FOREIGN KEY (producto_id)
            REFERENCES dbo.productos(id_producto),
        CONSTRAINT CK_venta_detalles_cantidad CHECK (cantidad > 0),
        CONSTRAINT CK_venta_detalles_importes CHECK (precio_unitario >= 0 AND subtotal >= 0)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.ventas') AND name = N'IX_ventas_estado_fecha')
    CREATE INDEX IX_ventas_estado_fecha ON dbo.ventas(estado, fecha DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.venta_detalles') AND name = N'IX_venta_detalles_venta')
    CREATE INDEX IX_venta_detalles_venta ON dbo.venta_detalles(venta_id);
GO
