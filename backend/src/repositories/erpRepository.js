import {
    getPool,
    sql,
} from '../config/db.js';

function createError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function moneyFromCents(cents) {
    return Number((cents / 100).toFixed(2));
}

export async function getDashboard() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
            ISNULL((SELECT SUM(total) FROM dbo.ordenes_erp WHERE estado = N'procesada'), 0) AS ventas_totales,
            (SELECT COUNT(*) FROM dbo.ordenes_erp WHERE estado = N'procesada') AS ordenes_procesadas,
            ISNULL((SELECT SUM(d.cantidad)
                    FROM dbo.ordenes_erp_detalles d
                    INNER JOIN dbo.ordenes_erp o ON o.id_orden = d.orden_id
                    WHERE o.estado = N'procesada'), 0) AS productos_vendidos,
            (SELECT COUNT(*) FROM dbo.clientes WHERE estado = N'activo') AS clientes_activos,
            ISNULL((SELECT SUM(stock_actual) FROM dbo.productos WHERE estado = N'activo'), 0) AS inventario_disponible;

        ;WITH Meses AS (
            SELECT DATEFROMPARTS(YEAR(DATEADD(MONTH, -5, GETDATE())), MONTH(DATEADD(MONTH, -5, GETDATE())), 1) AS mes
            UNION ALL
            SELECT DATEADD(MONTH, 1, mes)
            FROM Meses
            WHERE mes < DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        ), VentasMensuales AS (
            SELECT DATEFROMPARTS(YEAR(fecha_procesada), MONTH(fecha_procesada), 1) AS mes,
                   SUM(total) AS total
            FROM dbo.ordenes_erp
            WHERE estado = N'procesada'
              AND fecha_procesada >= DATEADD(MONTH, -5, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
            GROUP BY DATEFROMPARTS(YEAR(fecha_procesada), MONTH(fecha_procesada), 1)
        )
        SELECT CONVERT(NVARCHAR(7), m.mes, 126) AS mes,
               ISNULL(v.total, 0) AS total
        FROM Meses m
        LEFT JOIN VentasMensuales v ON v.mes = m.mes
        ORDER BY m.mes
        OPTION (MAXRECURSION 6);

        SELECT TOP 5 p.id_producto, p.nombre, p.sku, SUM(d.cantidad) AS unidades
        FROM dbo.ordenes_erp_detalles d
        INNER JOIN dbo.ordenes_erp o ON o.id_orden = d.orden_id AND o.estado = N'procesada'
        INNER JOIN dbo.productos p ON p.id_producto = d.producto_id
        GROUP BY p.id_producto, p.nombre, p.sku
        ORDER BY SUM(d.cantidad) DESC, p.nombre ASC;

        SELECT TOP 8 p.id_producto, p.sku, p.nombre, p.stock_actual, p.stock_minimo,
               CASE WHEN p.stock_actual <= p.stock_minimo THEN N'Crítico' ELSE N'Bajo' END AS nivel
        FROM dbo.productos p
        WHERE p.estado = N'activo' AND p.stock_actual <= p.stock_minimo
        ORDER BY p.stock_actual ASC, p.nombre ASC;

        SELECT TOP 8 o.id_orden, o.fecha, o.estado, o.total,
               c.nombre AS cliente_nombre, u.nombre AS usuario_nombre,
               (SELECT COUNT(*) FROM dbo.ordenes_erp_detalles d WHERE d.orden_id = o.id_orden) AS productos_distintos
        FROM dbo.ordenes_erp o
        INNER JOIN dbo.clientes c ON c.id_cliente = o.cliente_id
        INNER JOIN dbo.usuarios u ON u.id_usuario = o.usuario_id
        ORDER BY o.fecha DESC, o.id_orden DESC;
    `);

    return {
        kpis: result.recordsets[0]?.[0] || {},
        ventas_por_mes: result.recordsets[1] || [],
        productos_mas_vendidos: result.recordsets[2] || [],
        inventario_critico: result.recordsets[3] || [],
        ordenes_recientes: result.recordsets[4] || [],
    };
}

export async function getOrderCatalog() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT id_cliente, nombre, correo, empresa
        FROM dbo.clientes
        WHERE estado = N'activo'
        ORDER BY nombre ASC;

        SELECT p.id_producto, p.sku, p.nombre, p.marca, p.precio_venta,
               p.stock_actual, p.stock_minimo, c.nombre AS categoria_nombre
        FROM dbo.productos p
        INNER JOIN dbo.categorias c ON c.id_categoria = p.id_categoria
        WHERE p.estado = N'activo'
        ORDER BY p.nombre ASC;
    `);

    return {
        clientes: result.recordsets[0] || [],
        productos: result.recordsets[1] || [],
    };
}

export async function listOrders({ q = '', estado = '' } = {}) {
    const pool = await getPool();
    const result = await pool.request()
        .input('q', sql.NVarChar(300), `%${q.trim()}%`)
        .input('estado', sql.NVarChar(20), estado)
        .query(`
            SELECT o.id_orden, o.fecha, o.fecha_procesada, o.estado, o.total,
                   o.cliente_id, c.nombre AS cliente_nombre, c.correo AS cliente_correo,
                   o.usuario_id, u.nombre AS usuario_nombre,
                   (SELECT COUNT(*) FROM dbo.ordenes_erp_detalles d WHERE d.orden_id = o.id_orden) AS productos_distintos,
                   ISNULL((SELECT SUM(d.cantidad) FROM dbo.ordenes_erp_detalles d WHERE d.orden_id = o.id_orden), 0) AS unidades
            FROM dbo.ordenes_erp o
            INNER JOIN dbo.clientes c ON c.id_cliente = o.cliente_id
            INNER JOIN dbo.usuarios u ON u.id_usuario = o.usuario_id
            WHERE (@estado = N'' OR o.estado = @estado)
              AND (@q = N'%%' OR c.nombre LIKE @q OR c.correo LIKE @q
                   OR u.nombre LIKE @q OR CONVERT(NVARCHAR(20), o.id_orden) LIKE @q)
            ORDER BY o.fecha DESC, o.id_orden DESC;
        `);
    return result.recordset;
}

export async function findOrderById(idOrden) {
    const pool = await getPool();
    const request = pool.request().input('idOrden', sql.Int, idOrden);
    const result = await request.query(`
        SELECT o.id_orden, o.fecha, o.fecha_procesada, o.estado, o.total,
               o.cliente_id, c.nombre AS cliente_nombre, c.correo AS cliente_correo,
               c.empresa AS cliente_empresa, o.usuario_id, u.nombre AS usuario_nombre
        FROM dbo.ordenes_erp o
        INNER JOIN dbo.clientes c ON c.id_cliente = o.cliente_id
        INNER JOIN dbo.usuarios u ON u.id_usuario = o.usuario_id
        WHERE o.id_orden = @idOrden;

        SELECT d.id_detalle, d.producto_id, p.sku, p.nombre AS producto_nombre,
               d.cantidad, d.precio_unitario, d.subtotal
        FROM dbo.ordenes_erp_detalles d
        INNER JOIN dbo.productos p ON p.id_producto = d.producto_id
        WHERE d.orden_id = @idOrden
        ORDER BY d.id_detalle;

        SELECT p.id_proceso, p.tipo, p.descripcion, p.fecha, p.usuario_id,
               u.nombre AS usuario_nombre
        FROM dbo.procesos_erp p
        INNER JOIN dbo.usuarios u ON u.id_usuario = p.usuario_id
        WHERE p.orden_id = @idOrden
        ORDER BY p.fecha DESC, p.id_proceso DESC;
    `);
    const order = result.recordsets[0]?.[0];
    return order ? {
        ...order,
        detalles: result.recordsets[1] || [],
        historial: result.recordsets[2] || [],
    } : null;
}

export async function createOrder({ clienteId, usuarioId, items }) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
        const clientResult = await new sql.Request(transaction)
            .input('clienteId', sql.Int, clienteId)
            .query(`SELECT id_cliente, estado FROM dbo.clientes WITH (UPDLOCK, HOLDLOCK) WHERE id_cliente = @clienteId;`);
        const client = clientResult.recordset[0];
        if (!client) throw createError('El cliente seleccionado no existe.', 404);
        if (client.estado !== 'activo') throw createError('El cliente seleccionado está inactivo.', 409);

        const products = [];
        let totalCents = 0;
        for (const item of items) {
            const productResult = await new sql.Request(transaction)
                .input('productoId', sql.Int, item.producto_id)
                .query(`
                    SELECT id_producto, nombre, precio_venta, stock_actual, estado
                    FROM dbo.productos WITH (UPDLOCK, HOLDLOCK)
                    WHERE id_producto = @productoId;
                `);
            const product = productResult.recordset[0];
            if (!product) throw createError(`El producto ${item.producto_id} no existe.`, 404);
            if (product.estado !== 'activo') throw createError(`${product.nombre} está inactivo.`, 409);
            if (item.cantidad > Number(product.stock_actual)) {
                throw createError(`Stock insuficiente para ${product.nombre}. Disponibles: ${product.stock_actual}.`, 409);
            }

            const priceCents = Math.round(Number(product.precio_venta) * 100);
            const subtotalCents = priceCents * item.cantidad;
            totalCents += subtotalCents;
            products.push({ ...item, priceCents, subtotalCents });
        }

        const total = moneyFromCents(totalCents);
        const orderResult = await new sql.Request(transaction)
            .input('clienteId', sql.Int, clienteId)
            .input('usuarioId', sql.Int, usuarioId)
            .input('total', sql.Decimal(12, 2), total)
            .query(`
                INSERT INTO dbo.ordenes_erp (cliente_id, usuario_id, estado, total)
                OUTPUT INSERTED.id_orden
                VALUES (@clienteId, @usuarioId, N'pendiente', @total);
            `);
        const idOrden = orderResult.recordset[0].id_orden;

        for (const item of products) {
            const precio = moneyFromCents(item.priceCents);
            const subtotal = moneyFromCents(item.subtotalCents);
            await new sql.Request(transaction)
                .input('ordenId', sql.Int, idOrden)
                .input('productoId', sql.Int, item.producto_id)
                .input('cantidad', sql.Int, item.cantidad)
                .input('precio', sql.Decimal(12, 2), precio)
                .input('subtotal', sql.Decimal(12, 2), subtotal)
                .query(`
                    INSERT INTO dbo.ordenes_erp_detalles (orden_id, producto_id, cantidad, precio_unitario, subtotal)
                    VALUES (@ordenId, @productoId, @cantidad, @precio, @subtotal);
                `);
        }

        await new sql.Request(transaction)
            .input('ordenId', sql.Int, idOrden)
            .input('usuarioId', sql.Int, usuarioId)
            .query(`
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion)
                VALUES (@ordenId, @usuarioId, N'creacion', N'Orden empresarial creada y registrada como pendiente.');
            `);

        await transaction.commit();
        return await findOrderById(idOrden);
    } catch (error) {
        try { await transaction.rollback(); } catch { /* La transacción pudo abortarse en SQL Server. */ }
        throw error;
    }
}

export async function processOrder({ idOrden, usuarioId }) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
        const orderResult = await new sql.Request(transaction)
            .input('idOrden', sql.Int, idOrden)
            .query(`
                SELECT id_orden, cliente_id, estado
                FROM dbo.ordenes_erp WITH (UPDLOCK, HOLDLOCK)
                WHERE id_orden = @idOrden;
            `);
        const order = orderResult.recordset[0];
        if (!order) throw createError('Orden ERP no encontrada.', 404);
        if (order.estado !== 'pendiente') throw createError('Solo se pueden procesar órdenes pendientes.', 409);

        const detailsResult = await new sql.Request(transaction)
            .input('idOrden', sql.Int, idOrden)
            .query(`
                SELECT producto_id, cantidad
                FROM dbo.ordenes_erp_detalles
                WHERE orden_id = @idOrden
                ORDER BY producto_id;
            `);
        if (!detailsResult.recordset.length) throw createError('La orden no contiene productos.', 409);

        const clientResult = await new sql.Request(transaction)
            .input('clienteId', sql.Int, order.cliente_id)
            .query(`SELECT estado FROM dbo.clientes WITH (UPDLOCK, HOLDLOCK) WHERE id_cliente = @clienteId;`);
        if (clientResult.recordset[0]?.estado !== 'activo') throw createError('El cliente de la orden ya no está activo.', 409);

        for (const item of detailsResult.recordset) {
            const productResult = await new sql.Request(transaction)
                .input('productoId', sql.Int, item.producto_id)
                .query(`
                    SELECT id_producto, nombre, stock_actual, estado
                    FROM dbo.productos WITH (UPDLOCK, HOLDLOCK)
                    WHERE id_producto = @productoId;
                `);
            const product = productResult.recordset[0];
            if (!product || product.estado !== 'activo') {
                throw createError('Uno de los productos de la orden ya no está disponible.', 409);
            }

            const stockAnterior = Number(product.stock_actual);
            const stockResultante = stockAnterior - Number(item.cantidad);
            if (stockResultante < 0) {
                throw createError(`Stock insuficiente para ${product.nombre}. Disponibles: ${stockAnterior}.`, 409);
            }

            await new sql.Request(transaction)
                .input('productoId', sql.Int, item.producto_id)
                .input('stock', sql.Int, stockResultante)
                .query(`UPDATE dbo.productos SET stock_actual = @stock, fecha_actualizacion = SYSDATETIME() WHERE id_producto = @productoId;`);

            await new sql.Request(transaction)
                .input('productoId', sql.Int, item.producto_id)
                .input('usuarioId', sql.Int, usuarioId)
                .input('cantidad', sql.Int, item.cantidad)
                .input('descripcion', sql.NVarChar(500), `Orden ERP #${idOrden} procesada.`)
                .input('stockAnterior', sql.Int, stockAnterior)
                .input('stockResultante', sql.Int, stockResultante)
                .query(`
                    INSERT INTO dbo.movimientos_inventario (
                        producto_id, usuario_id, tipo, cantidad, motivo, descripcion, stock_anterior, stock_resultante
                    ) VALUES (
                        @productoId, @usuarioId, N'salida', @cantidad, N'venta', @descripcion, @stockAnterior, @stockResultante
                    );
                `);
        }

        await new sql.Request(transaction)
            .input('idOrden', sql.Int, idOrden)
            .query(`
                UPDATE dbo.ordenes_erp
                SET estado = N'procesada', fecha_procesada = SYSDATETIME()
                WHERE id_orden = @idOrden AND estado = N'pendiente';
                IF @@ROWCOUNT = 0 THROW 50003, 'La orden cambió de estado durante el procesamiento.', 1;
            `);

        await new sql.Request(transaction)
            .input('ordenId', sql.Int, idOrden)
            .input('usuarioId', sql.Int, usuarioId)
            .query(`
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion)
                VALUES (@ordenId, @usuarioId, N'procesamiento', N'Orden procesada; existencias descontadas y movimiento de inventario registrado.');
            `);

        await transaction.commit();
        return await findOrderById(idOrden);
    } catch (error) {
        try { await transaction.rollback(); } catch { /* La transacción pudo abortarse en SQL Server. */ }
        throw error;
    }
}

export async function cancelOrder(idOrden, usuarioId) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    try {
        const result = await new sql.Request(transaction)
            .input('idOrden', sql.Int, idOrden)
            .query(`
                SELECT estado FROM dbo.ordenes_erp WITH (UPDLOCK, HOLDLOCK) WHERE id_orden = @idOrden;
            `);
        const order = result.recordset[0];
        if (!order) throw createError('Orden ERP no encontrada.', 404);
        if (order.estado !== 'pendiente') throw createError('Solo se pueden cancelar órdenes pendientes.', 409);
        await new sql.Request(transaction)
            .input('idOrden', sql.Int, idOrden)
            .query(`UPDATE dbo.ordenes_erp SET estado = N'cancelada' WHERE id_orden = @idOrden;`);
        await new sql.Request(transaction)
            .input('ordenId', sql.Int, idOrden)
            .input('usuarioId', sql.Int, usuarioId)
            .query(`
                INSERT INTO dbo.procesos_erp (orden_id, usuario_id, tipo, descripcion)
                VALUES (@ordenId, @usuarioId, N'cancelacion', N'Orden cancelada antes de descontar existencias.');
            `);
        await transaction.commit();
        return await findOrderById(idOrden);
    } catch (error) {
        try { await transaction.rollback(); } catch { /* La transacción pudo abortarse en SQL Server. */ }
        throw error;
    }
}

export async function getErpState() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT c.nivel_erp, c.fecha_actualizacion, c.usuario_actualizacion,
               u.nombre AS usuario_nombre
        FROM dbo.configuracion_erp c
        LEFT JOIN dbo.usuarios u ON u.id_usuario = c.usuario_actualizacion
        WHERE c.id_configuracion = 1;
    `);
    return result.recordset[0] || null;
}

export async function saveErpState({ nivel, usuarioId }) {
    const pool = await getPool();
    await pool.request()
        .input('nivel', sql.NVarChar(30), nivel)
        .input('usuarioId', sql.Int, usuarioId)
        .query(`
            UPDATE dbo.configuracion_erp
            SET nivel_erp = @nivel,
                fecha_actualizacion = SYSDATETIME(),
                usuario_actualizacion = @usuarioId
            WHERE id_configuracion = 1;
            IF @@ROWCOUNT = 0
                INSERT INTO dbo.configuracion_erp (id_configuracion, nivel_erp, usuario_actualizacion)
                VALUES (1, @nivel, @usuarioId);
        `);
    return getErpState();
}
