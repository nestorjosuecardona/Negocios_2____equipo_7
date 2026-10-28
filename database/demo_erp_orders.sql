/* Solo el lote ERP de demostración: 120 órdenes y su historial.
   Requiere que ya existan cliente.erp.001..100, LOTE-AUTO-0001..0080,
   las tablas ERP y un usuario ADMIN activo. No inserta catálogos. */
USE Negocios2;
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.ordenes_erp', N'U') IS NULL
   OR OBJECT_ID(N'dbo.ordenes_erp_detalles', N'U') IS NULL
   OR OBJECT_ID(N'dbo.procesos_erp', N'U') IS NULL
BEGIN
    THROW 51000, 'Falta aplicar la migración ERP.', 1;
END;
GO

DECLARE @adminId INT;
SELECT TOP (1) @adminId = u.id_usuario
FROM dbo.usuarios u
JOIN dbo.roles r ON r.id_rol = u.id_rol
WHERE r.nombre = N'ADMIN' AND u.estado = N'activo'
ORDER BY u.id_usuario;

IF @adminId IS NULL
    THROW 51001, 'No existe un usuario ADMIN activo.', 1;
IF (SELECT COUNT(*) FROM dbo.clientes WHERE correo LIKE N'cliente.erp.%@demo.negocios2.test') < 100
    THROW 51002, 'Faltan los 100 clientes ERP cliente.erp.001..100.', 1;
IF (SELECT COUNT(*) FROM dbo.productos WHERE sku LIKE N'LOTE-AUTO-%') < 80
    THROW 51003, 'Faltan los 80 productos LOTE-AUTO-0001..0080.', 1;

DECLARE @i INT = 1, @insertadas INT = 0;
DECLARE @canceladas INT = 0, @pendientes INT = 0, @procesadas INT = 0;
DECLARE @clienteN INT, @clienteId INT, @productoAN INT, @productoBN INT;
DECLARE @productoA INT, @productoB INT, @cantidadA INT, @cantidadB INT;
DECLARE @precioA DECIMAL(12,2), @precioB DECIMAL(12,2);
DECLARE @subtotalA DECIMAL(12,2), @subtotalB DECIMAL(12,2), @total DECIMAL(12,2);
DECLARE @stockA INT, @stockB INT, @ordenId INT;
DECLARE @fecha DATETIME2, @fechaProc DATETIME2, @marker NVARCHAR(500), @markerSuffix NVARCHAR(50);

WHILE @i <= 120
BEGIN
    SET @marker = N'Datos de demostración: lote ERP 2026-10 orden '
        + RIGHT(N'000' + CONVERT(NVARCHAR(3), @i), 3) + N'.';
    SET @markerSuffix = N'lote ERP 2026-10 orden '
        + RIGHT(N'000' + CONVERT(NVARCHAR(3), @i), 3) + N'.';

    IF NOT EXISTS (
        SELECT 1 FROM dbo.procesos_erp
        WHERE tipo=N'creacion' AND RIGHT(descripcion, LEN(@markerSuffix))=@markerSuffix
    )
    BEGIN
        /* Las mismas reglas de clientes, productos, cantidades y estados del lote original. */
        SET @clienteN = ((@i * 17 - 1) % 100) + 1;
        SET @productoAN = ((@i * 7 - 1) % 80) + 1;
        SET @productoBN = ((@i * 7 + 12) % 80) + 1;
        SET @cantidadA = 1 + (@i % 2);
        SET @cantidadB = CASE WHEN @i % 3 = 0 THEN 1 ELSE 0 END;
        SET @productoB = NULL;
        SET @precioB = 0;
        SET @subtotalB = 0;
        SET @fecha = DATEADD(DAY, -((@i * 3) % 180), CONVERT(DATETIME2, '2026-10-24T12:00:00'));
        SET @fechaProc = DATEADD(HOUR, 1, @fecha);

        SELECT @clienteId = id_cliente FROM dbo.clientes
        WHERE correo = N'cliente.erp.' + RIGHT(N'000' + CONVERT(NVARCHAR(3), @clienteN), 3) + N'@demo.negocios2.test';
        SELECT @productoA = id_producto, @precioA = precio_venta FROM dbo.productos
        WHERE sku = N'LOTE-AUTO-' + RIGHT(N'0000' + CONVERT(NVARCHAR(4), @productoAN), 4);
        IF @cantidadB = 1
            SELECT @productoB = id_producto, @precioB = precio_venta FROM dbo.productos
            WHERE sku = N'LOTE-AUTO-' + RIGHT(N'0000' + CONVERT(NVARCHAR(4), @productoBN), 4);

        IF @clienteId IS NULL OR @productoA IS NULL OR (@cantidadB=1 AND @productoB IS NULL)
            THROW 51004, 'No se encontró el cliente o producto correspondiente al lote ERP.', 1;

        SET @subtotalA = @precioA * @cantidadA;
        SET @subtotalB = @precioB * @cantidadB;
        SET @total = @subtotalA + @subtotalB;

        BEGIN TRY
            BEGIN TRANSACTION;

            INSERT INTO dbo.ordenes_erp (cliente_id, usuario_id, fecha, estado, total)
            VALUES (@clienteId, @adminId, @fecha, N'pendiente', @total);
            SET @ordenId = CONVERT(INT, SCOPE_IDENTITY());

            INSERT INTO dbo.ordenes_erp_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal)
            VALUES (@ordenId, @productoA, @cantidadA, @precioA, @subtotalA);
            IF @cantidadB = 1
                INSERT INTO dbo.ordenes_erp_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (@ordenId, @productoB, @cantidadB, @precioB, @subtotalB);

            INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion, fecha)
            VALUES (@ordenId, @adminId, N'creacion', @marker, @fecha);

            IF @i % 10 = 0
            BEGIN
                UPDATE dbo.ordenes_erp SET estado=N'cancelada' WHERE id_orden=@ordenId;
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion)
                VALUES (@ordenId, @adminId, N'cancelacion', N'Orden cancelada antes de descontar existencias.');
                SET @canceladas += 1;
            END
            ELSE IF @i % 10 = 1
                SET @pendientes += 1;
            ELSE
            BEGIN
                SELECT @stockA=stock_actual FROM dbo.productos WITH (UPDLOCK,HOLDLOCK) WHERE id_producto=@productoA;
                IF @stockA < @cantidadA
                    THROW 51005, 'Stock insuficiente para procesar una orden del lote ERP.', 1;
                UPDATE dbo.productos SET stock_actual=stock_actual-@cantidadA, fecha_actualizacion=SYSDATETIME() WHERE id_producto=@productoA;
                INSERT INTO dbo.movimientos_inventario (producto_id,usuario_id,tipo,cantidad,motivo,descripcion,stock_anterior,stock_resultante)
                VALUES (@productoA,@adminId,N'salida',@cantidadA,N'venta',N'Orden ERP #'+CONVERT(NVARCHAR(20),@ordenId)+N' procesada.',@stockA,@stockA-@cantidadA);

                IF @cantidadB = 1
                BEGIN
                    SELECT @stockB=stock_actual FROM dbo.productos WITH (UPDLOCK,HOLDLOCK) WHERE id_producto=@productoB;
                    IF @stockB < @cantidadB
                        THROW 51005, 'Stock insuficiente para procesar una orden del lote ERP.', 1;
                    UPDATE dbo.productos SET stock_actual=stock_actual-@cantidadB, fecha_actualizacion=SYSDATETIME() WHERE id_producto=@productoB;
                    INSERT INTO dbo.movimientos_inventario (producto_id,usuario_id,tipo,cantidad,motivo,descripcion,stock_anterior,stock_resultante)
                    VALUES (@productoB,@adminId,N'salida',@cantidadB,N'venta',N'Orden ERP #'+CONVERT(NVARCHAR(20),@ordenId)+N' procesada.',@stockB,@stockB-@cantidadB);
                END;

                UPDATE dbo.ordenes_erp SET estado=N'procesada', fecha_procesada=@fechaProc WHERE id_orden=@ordenId;
                INSERT INTO dbo.procesos_erp (orden_id,usuario_id,tipo,descripcion,fecha)
                VALUES (@ordenId,@adminId,N'procesamiento',N'Orden procesada; existencias descontadas y movimiento de inventario registrado.',@fechaProc);
                SET @procesadas += 1;
            END;

            COMMIT TRANSACTION;
            SET @insertadas += 1;
        END TRY
        BEGIN CATCH
            IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
            THROW;
        END CATCH;
    END;

    SET @i += 1;
END;

PRINT CONCAT(N'Nuevas órdenes: ',@insertadas,N' | procesadas: ',@procesadas,N' | pendientes: ',@pendientes,N' | canceladas: ',@canceladas,N'.');
GO
