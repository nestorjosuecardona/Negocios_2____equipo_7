/*
  Datos ERP de demostración para una base que ya tiene schema.sql y migrations.
  Agrega únicamente los registros maestros que las órdenes requieren por FK:
  ADMIN de demostración (solo si no hay ADMIN activo), 100 clientes y 80 productos.
  Después inserta el lote ERP: 120 órdenes (96 procesadas, 12 pendientes, 12 canceladas).
  No crea ventas de tienda, interacciones, proveedores ni datos de otros módulos.

  Si no existe ningún ADMIN antes de correrlo, acceso creado:
  admin.erp.demo@ejemplo.com / DemoERP2026!
*/
USE Negocios2;
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.ordenes_erp', N'U') IS NULL
   OR OBJECT_ID(N'dbo.ordenes_erp_detalles', N'U') IS NULL
   OR OBJECT_ID(N'dbo.procesos_erp', N'U') IS NULL
BEGIN
    THROW 51000, 'Ejecuta schema.sql y la migración ERP antes de este script.', 1;
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE nombre=N'ADMIN')
    INSERT INTO dbo.roles (id_rol,nombre,descripcion)
    VALUES (2,N'ADMIN',N'Administrador operativo de demostración.');

DECLARE @adminId INT;
SELECT TOP (1) @adminId=u.id_usuario
FROM dbo.usuarios u JOIN dbo.roles r ON r.id_rol=u.id_rol
WHERE r.nombre=N'ADMIN' AND u.estado=N'activo'
ORDER BY u.id_usuario;

IF @adminId IS NULL
BEGIN
    INSERT INTO dbo.usuarios (nombre,correo,password_hash,id_rol,estado)
    SELECT N'Administrador ERP Demo',N'admin.erp.demo@ejemplo.com',
           N'$2b$12$IoT/Zd.fX.CtR/9ygqKq3ej0hotcWfmNBZeeN8DRAj7PXEc0bVTNC',id_rol,N'activo'
    FROM dbo.roles WHERE nombre=N'ADMIN';
    SET @adminId=CONVERT(INT,SCOPE_IDENTITY());
END;

DECLARE @categoriaNombres TABLE (n INT PRIMARY KEY,nombre NVARCHAR(120));
INSERT INTO @categoriaNombres VALUES
(1,N'Iluminación automotriz'),(2,N'Audio y electrónica'),
(3,N'Interior y comodidad'),(4,N'Seguridad y exterior');

INSERT INTO dbo.categorias (nombre,descripcion)
SELECT c.nombre,N'Categoría de apoyo para los productos vinculados a las órdenes ERP de demostración.'
FROM @categoriaNombres c
WHERE NOT EXISTS (SELECT 1 FROM dbo.categorias x WHERE x.nombre=c.nombre);

DECLARE @nombresCliente TABLE (n INT PRIMARY KEY,nombre NVARCHAR(50));
INSERT INTO @nombresCliente VALUES
(1,N'Abarrotes'),(2,N'Taller'),(3,N'Servicio'),(4,N'Refaccionaria'),(5,N'Transportes'),
(6,N'Flotilla'),(7,N'Comercial'),(8,N'Mecánica'),(9,N'Autos'),(10,N'Soluciones');
DECLARE @apellidos TABLE (n INT PRIMARY KEY,nombre NVARCHAR(50));
INSERT INTO @apellidos VALUES
(1,N'López'),(2,N'García'),(3,N'Hernández'),(4,N'Martínez'),(5,N'González'),
(6,N'Pérez'),(7,N'Sánchez'),(8,N'Ramírez'),(9,N'Torres'),(10,N'Flores');

DECLARE @i INT=1,@nombreBase NVARCHAR(50),@apellido NVARCHAR(50),@correo NVARCHAR(180),
        @nombre NVARCHAR(150),@empresa NVARCHAR(150),@etapa NVARCHAR(30),@telefono NVARCHAR(40);
WHILE @i<=100
BEGIN
    SELECT @nombreBase=nombre FROM @nombresCliente WHERE n=((@i-1)%10)+1;
    SELECT @apellido=nombre FROM @apellidos WHERE n=((@i*3)%10)+1;
    SET @correo=N'cliente.erp.'+RIGHT(N'000'+CONVERT(NVARCHAR(3),@i),3)+N'@demo.negocios2.test';
    SET @nombre=@nombreBase+N' '+@apellido+N' '+RIGHT(N'000'+CONVERT(NVARCHAR(3),@i),3);
    SET @empresa=N'Empresa Demo '+RIGHT(N'000'+CONVERT(NVARCHAR(3),@i),3);
    SET @etapa=CASE WHEN @i%3=1 THEN N'Prospecto' WHEN @i%3=2 THEN N'Activo' ELSE N'Frecuente' END;
    SET @telefono=N'555'+RIGHT(CONVERT(NVARCHAR(10),2000000+@i),7);
    IF NOT EXISTS (SELECT 1 FROM dbo.clientes WHERE correo=@correo)
        INSERT INTO dbo.clientes (nombre,correo,empresa,telefono,etapa_crm,notas)
        VALUES (@nombre,@correo,@empresa,@telefono,@etapa,N'Cliente de demostración para órdenes ERP.');
    SET @i+=1;
END;

DECLARE @productoBase TABLE (n INT PRIMARY KEY,nombre NVARCHAR(100));
INSERT INTO @productoBase VALUES
(1,N'Foco LED H4'),(2,N'Foco LED H7'),(3,N'Faros de niebla'),(4,N'Tira LED interior'),(5,N'Lámpara de cortesía'),
(6,N'Bocina coaxial'),(7,N'Cargador USB dual'),(8,N'Estéreo Bluetooth'),(9,N'Cámara de reversa'),(10,N'Sensor de estacionamiento'),
(11,N'Tapetes universales'),(12,N'Cubreasientos'),(13,N'Organizador de cajuela'),(14,N'Soporte para teléfono'),(15,N'Volante deportivo'),
(16,N'Alarma vehicular'),(17,N'Cámara de tablero'),(18,N'Birlos de seguridad'),(19,N'Cubierta para auto'),(20,N'Plumillas limpiaparabrisas');
DECLARE @marcas TABLE (n INT PRIMARY KEY,nombre NVARCHAR(120));
INSERT INTO @marcas VALUES (1,N'MotorPlus'),(2,N'RutaMax'),(3,N'AutoNova'),(4,N'VíaMotor'),(5,N'DrivePro');

DECLARE @productoI INT=1,@sku NVARCHAR(80),@productoNombre NVARCHAR(180),@categoriaId INT,
        @marca NVARCHAR(120),@costo DECIMAL(12,2),@precio DECIMAL(12,2),@stock INT,@minimo INT;
WHILE @productoI<=80
BEGIN
    SET @sku=N'LOTE-AUTO-'+RIGHT(N'0000'+CONVERT(NVARCHAR(4),@productoI),4);
    SELECT @nombreBase=nombre FROM @productoBase WHERE n=((@productoI-1)%20)+1;
    SET @productoNombre=@nombreBase+N' '+RIGHT(N'00'+CONVERT(NVARCHAR(2),((@productoI-1)/20)+1),2);
    SELECT @categoriaId=c.id_categoria
    FROM dbo.categorias c JOIN @categoriaNombres n ON n.nombre=c.nombre
    WHERE n.n=((@productoI-1)%4)+1;
    SELECT @marca=nombre FROM @marcas WHERE n=((@productoI-1)%5)+1;
    SET @costo=55+((@productoI*37)%500);
    SET @precio=@costo+45+((@productoI*23)%280);
    SET @stock=45+(@productoI%35);
    SET @minimo=8+(@productoI%10);
    IF NOT EXISTS (SELECT 1 FROM dbo.productos WHERE sku=@sku)
        INSERT INTO dbo.productos
            (sku,nombre,descripcion,id_categoria,marca,proveedor_id,costo_unitario,precio_venta,stock_actual,stock_minimo,estrategia_logistica)
        VALUES
            (@sku,@productoNombre,N'Artículo de catálogo de demostración '+@sku,@categoriaId,@marca,NULL,
             @costo,@precio,@stock,@minimo,CASE WHEN @productoI%2=0 THEN N'PULL' ELSE N'PUSH' END);
    SET @productoI+=1;
END;

DECLARE @creadas INT=0,@procesadas INT=0,@pendientes INT=0,@canceladas INT=0;
DECLARE @marker NVARCHAR(500),@markerSuffix NVARCHAR(50),@clienteN INT,@clienteId INT;
DECLARE @productoAN INT,@productoBN INT,@productoA INT,@productoB INT,@cantidadA INT,@cantidadB INT;
DECLARE @precioA DECIMAL(12,2),@precioB DECIMAL(12,2),@subtotalA DECIMAL(12,2),@subtotalB DECIMAL(12,2),@total DECIMAL(12,2);
DECLARE @stockA INT,@stockB INT,@ordenId INT,@fecha DATETIME2,@fechaProc DATETIME2;
SET @i=1;

WHILE @i<=120
BEGIN
    SET @marker=N'Datos de demostración: lote ERP 2026-10 orden '+RIGHT(N'000'+CONVERT(NVARCHAR(3),@i),3)+N'.';
    SET @markerSuffix=N'lote ERP 2026-10 orden '+RIGHT(N'000'+CONVERT(NVARCHAR(3),@i),3)+N'.';

    IF NOT EXISTS (
        SELECT 1 FROM dbo.procesos_erp
        WHERE tipo=N'creacion' AND RIGHT(descripcion,LEN(@markerSuffix))=@markerSuffix
    )
    BEGIN
        SET @clienteN=((@i*17-1)%100)+1;
        SET @productoAN=((@i*7-1)%80)+1;
        SET @productoBN=((@i*7+12)%80)+1;
        SET @cantidadA=1+(@i%2);
        SET @cantidadB=CASE WHEN @i%3=0 THEN 1 ELSE 0 END;
        SET @productoB=NULL; SET @precioB=0; SET @subtotalB=0;
        SET @fecha=DATEADD(DAY,-((@i*3)%180),CONVERT(DATETIME2,'2026-10-24T12:00:00'));
        SET @fechaProc=DATEADD(HOUR,1,@fecha);

        SELECT @clienteId=id_cliente FROM dbo.clientes
        WHERE correo=N'cliente.erp.'+RIGHT(N'000'+CONVERT(NVARCHAR(3),@clienteN),3)+N'@demo.negocios2.test';
        SELECT @productoA=id_producto,@precioA=precio_venta FROM dbo.productos
        WHERE sku=N'LOTE-AUTO-'+RIGHT(N'0000'+CONVERT(NVARCHAR(4),@productoAN),4);
        IF @cantidadB=1
            SELECT @productoB=id_producto,@precioB=precio_venta FROM dbo.productos
            WHERE sku=N'LOTE-AUTO-'+RIGHT(N'0000'+CONVERT(NVARCHAR(4),@productoBN),4);

        SET @subtotalA=@precioA*@cantidadA;
        SET @subtotalB=@precioB*@cantidadB;
        SET @total=@subtotalA+@subtotalB;

        BEGIN TRY
            BEGIN TRANSACTION;
            INSERT INTO dbo.ordenes_erp (cliente_id,usuario_id,fecha,estado,total)
            VALUES (@clienteId,@adminId,@fecha,N'pendiente',@total);
            SET @ordenId=CONVERT(INT,SCOPE_IDENTITY());

            INSERT INTO dbo.ordenes_erp_detalles (orden_id,producto_id,cantidad,precio_unitario,subtotal)
            VALUES (@ordenId,@productoA,@cantidadA,@precioA,@subtotalA);
            IF @cantidadB=1
                INSERT INTO dbo.ordenes_erp_detalles (orden_id,producto_id,cantidad,precio_unitario,subtotal)
                VALUES (@ordenId,@productoB,@cantidadB,@precioB,@subtotalB);
            INSERT INTO dbo.procesos_erp (orden_id,usuario_id,tipo,descripcion,fecha)
            VALUES (@ordenId,@adminId,N'creacion',@marker,@fecha);

            IF @i%10=0
            BEGIN
                UPDATE dbo.ordenes_erp SET estado=N'cancelada' WHERE id_orden=@ordenId;
                INSERT INTO dbo.procesos_erp (orden_id,usuario_id,tipo,descripcion)
                VALUES (@ordenId,@adminId,N'cancelacion',N'Orden cancelada antes de descontar existencias.');
                SET @canceladas+=1;
            END
            ELSE IF @i%10=1 SET @pendientes+=1;
            ELSE
            BEGIN
                SELECT @stockA=stock_actual FROM dbo.productos WITH (UPDLOCK,HOLDLOCK) WHERE id_producto=@productoA;
                IF @stockA<@cantidadA THROW 51005,'Stock insuficiente para procesar orden ERP.',1;
                UPDATE dbo.productos SET stock_actual=stock_actual-@cantidadA,fecha_actualizacion=SYSDATETIME() WHERE id_producto=@productoA;
                INSERT INTO dbo.movimientos_inventario (producto_id,usuario_id,tipo,cantidad,motivo,descripcion,stock_anterior,stock_resultante)
                VALUES (@productoA,@adminId,N'salida',@cantidadA,N'venta',N'Orden ERP #'+CONVERT(NVARCHAR(20),@ordenId)+N' procesada.',@stockA,@stockA-@cantidadA);

                IF @cantidadB=1
                BEGIN
                    SELECT @stockB=stock_actual FROM dbo.productos WITH (UPDLOCK,HOLDLOCK) WHERE id_producto=@productoB;
                    IF @stockB<@cantidadB THROW 51005,'Stock insuficiente para procesar orden ERP.',1;
                    UPDATE dbo.productos SET stock_actual=stock_actual-@cantidadB,fecha_actualizacion=SYSDATETIME() WHERE id_producto=@productoB;
                    INSERT INTO dbo.movimientos_inventario (producto_id,usuario_id,tipo,cantidad,motivo,descripcion,stock_anterior,stock_resultante)
                    VALUES (@productoB,@adminId,N'salida',@cantidadB,N'venta',N'Orden ERP #'+CONVERT(NVARCHAR(20),@ordenId)+N' procesada.',@stockB,@stockB-@cantidadB);
                END;

                UPDATE dbo.ordenes_erp SET estado=N'procesada',fecha_procesada=@fechaProc WHERE id_orden=@ordenId;
                INSERT INTO dbo.procesos_erp (orden_id,usuario_id,tipo,descripcion,fecha)
                VALUES (@ordenId,@adminId,N'procesamiento',N'Orden procesada; existencias descontadas y movimiento de inventario registrado.',@fechaProc);
                SET @procesadas+=1;
            END;

            COMMIT TRANSACTION;
            SET @creadas+=1;
        END TRY
        BEGIN CATCH
            IF XACT_STATE()<>0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH;
    END;
    SET @i+=1;
END;

PRINT CONCAT(N'Órdenes ERP nuevas: ',@creadas,N' | procesadas: ',@procesadas,N' | pendientes: ',@pendientes,N' | canceladas: ',@canceladas,N'.');
GO
