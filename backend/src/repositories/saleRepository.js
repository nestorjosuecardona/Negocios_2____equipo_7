import {
    getPool,
    sql,
} from '../config/db.js';

function createError(
    message,
    status = 400,
) {
    const error =
        new Error(message);

    error.status = status;

    return error;
}

function moneyFromCents(cents) {
    return Number(
        (cents / 100).toFixed(2),
    );
}

export async function createSale({
    usuarioId,
    metodoPago,
    nombreRecibe,
    telefono,
    direccion,
    ciudad,
    codigoPostal,
    items,
}) {
    const pool =
        await getPool();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin(
        sql.ISOLATION_LEVEL.SERIALIZABLE,
    );

    try {
        const clientResult =
            await new sql.Request(
                transaction,
            )
                .input(
                    'usuarioId',
                    sql.Int,
                    usuarioId,
                )
                .query(`
                    SELECT TOP 1
                        c.id_cliente,
                        c.nombre AS cliente_nombre,
                        u.estado AS usuario_estado
                    FROM dbo.clientes c
                    INNER JOIN dbo.usuarios u
                        ON u.id_usuario = c.usuario_id
                    WHERE
                        c.usuario_id = @usuarioId;
                `);

        const client =
            clientResult.recordset[0];

        if (!client) {
            throw createError(
                'La cuenta no tiene un cliente asociado.',
                400,
            );
        }

        if (
            client.usuario_estado !==
            'activo'
        ) {
            throw createError(
                'La cuenta no se encuentra activa.',
                403,
            );
        }

        const products = [];
        let totalCents = 0;

        for (const item of items) {
            const productResult =
                await new sql.Request(
                    transaction,
                )
                    .input(
                        'productoId',
                        sql.Int,
                        item.producto_id,
                    )
                    .query(`
                        SELECT
                            p.id_producto,
                            p.sku,
                            p.nombre,
                            p.precio_venta,
                            p.stock_actual,
                            p.stock_minimo,
                            p.estrategia_logistica,
                            p.estado,
                            p.proveedor_id,
                            pr.estado AS proveedor_estado
                        FROM dbo.productos p WITH (
                            UPDLOCK,
                            HOLDLOCK
                        )
                        LEFT JOIN dbo.proveedores pr
                            ON pr.id_proveedor = p.proveedor_id
                        WHERE
                            p.id_producto = @productoId;
                    `);

            const product =
                productResult.recordset[0];

            if (!product) {
                throw createError(
                    `El producto ${item.producto_id} no existe.`,
                    404,
                );
            }

            if (
                product.estado !==
                'activo'
            ) {
                throw createError(
                    `${product.nombre} ya no está disponible.`,
                    409,
                );
            }

            const stockActual =
                Number(
                    product.stock_actual,
                );

            if (
                item.cantidad >
                stockActual
            ) {
                throw createError(
                    `Stock insuficiente para ${product.nombre}. Disponibles: ${stockActual}.`,
                    409,
                );
            }

            const precioCents =
                Math.round(
                    Number(
                        product.precio_venta,
                    ) * 100,
                );

            const subtotalCents =
                precioCents *
                item.cantidad;

            totalCents +=
                subtotalCents;

            products.push({
                ...product,
                cantidad:
                    item.cantidad,
                precioCents,
                subtotalCents,
            });
        }

        const subtotal =
            moneyFromCents(
                totalCents,
            );

        const total = subtotal;

        const saleResult =
            await new sql.Request(
                transaction,
            )
                .input(
                    'clienteId',
                    sql.Int,
                    client.id_cliente,
                )
                .input(
                    'usuarioId',
                    sql.Int,
                    usuarioId,
                )
                .input(
                    'subtotal',
                    sql.Decimal(12, 2),
                    subtotal,
                )
                .input(
                    'total',
                    sql.Decimal(12, 2),
                    total,
                )
                .input(
                    'metodoPago',
                    sql.NVarChar(30),
                    metodoPago,
                )
                .input(
                    'nombreRecibe',
                    sql.NVarChar(150),
                    nombreRecibe,
                )
                .input(
                    'telefono',
                    sql.NVarChar(30),
                    telefono,
                )
                .input(
                    'direccion',
                    sql.NVarChar(300),
                    direccion,
                )
                .input(
                    'ciudad',
                    sql.NVarChar(100),
                    ciudad,
                )
                .input(
                    'codigoPostal',
                    sql.NVarChar(20),
                    codigoPostal,
                )
                .query(`
                    INSERT INTO dbo.ventas (
                        cliente_id,
                        usuario_id,
                        subtotal,
                        total,
                        metodo_pago,
                        nombre_recibe,
                        telefono,
                        direccion,
                        ciudad,
                        codigo_postal,
                        estado,
                        fecha
                    )
                    OUTPUT
                        INSERTED.*
                    VALUES (
                        @clienteId,
                        @usuarioId,
                        @subtotal,
                        @total,
                        @metodoPago,
                        @nombreRecibe,
                        @telefono,
                        @direccion,
                        @ciudad,
                        @codigoPostal,
                        N'pendiente',
                        SYSDATETIME()
                    );
                `);

        const sale =
            saleResult.recordset[0];

        const details = [];
        const replenishmentOrders = [];

        for (const product of products) {
            const stockAnterior =
                Number(
                    product.stock_actual,
                );

            const stockResultante =
                stockAnterior -
                product.cantidad;

            const precioUnitario =
                moneyFromCents(
                    product.precioCents,
                );

            const detailSubtotal =
                moneyFromCents(
                    product.subtotalCents,
                );

            const detailResult =
                await new sql.Request(
                    transaction,
                )
                    .input(
                        'ventaId',
                        sql.Int,
                        sale.id_venta,
                    )
                    .input(
                        'productoId',
                        sql.Int,
                        product.id_producto,
                    )
                    .input(
                        'cantidad',
                        sql.Int,
                        product.cantidad,
                    )
                    .input(
                        'precioUnitario',
                        sql.Decimal(12, 2),
                        precioUnitario,
                    )
                    .input(
                        'subtotal',
                        sql.Decimal(12, 2),
                        detailSubtotal,
                    )
                    .query(`
                        INSERT INTO dbo.venta_detalles (
                            venta_id,
                            producto_id,
                            cantidad,
                            precio_unitario,
                            subtotal
                        )
                        OUTPUT
                            INSERTED.*
                        VALUES (
                            @ventaId,
                            @productoId,
                            @cantidad,
                            @precioUnitario,
                            @subtotal
                        );
                    `);

            details.push(
                detailResult.recordset[0],
            );

            await new sql.Request(
                transaction,
            )
                .input(
                    'productoId',
                    sql.Int,
                    product.id_producto,
                )
                .input(
                    'stockResultante',
                    sql.Int,
                    stockResultante,
                )
                .query(`
                    UPDATE dbo.productos
                    SET
                        stock_actual = @stockResultante,
                        fecha_actualizacion = SYSDATETIME()
                    WHERE
                        id_producto = @productoId;
                `);

            await new sql.Request(
                transaction,
            )
                .input(
                    'productoId',
                    sql.Int,
                    product.id_producto,
                )
                .input(
                    'usuarioId',
                    sql.Int,
                    usuarioId,
                )
                .input(
                    'cantidad',
                    sql.Int,
                    product.cantidad,
                )
                .input(
                    'descripcion',
                    sql.NVarChar(500),
                    `Venta #${sale.id_venta} generada desde la tienda.`,
                )
                .input(
                    'stockAnterior',
                    sql.Int,
                    stockAnterior,
                )
                .input(
                    'stockResultante',
                    sql.Int,
                    stockResultante,
                )
                .query(`
                    INSERT INTO dbo.movimientos_inventario (
                        producto_id,
                        usuario_id,
                        tipo,
                        cantidad,
                        motivo,
                        descripcion,
                        stock_anterior,
                        stock_resultante
                    )
                    VALUES (
                        @productoId,
                        @usuarioId,
                        N'salida',
                        @cantidad,
                        N'venta',
                        @descripcion,
                        @stockAnterior,
                        @stockResultante
                    );
                `);

            const needsPush =
                product.estrategia_logistica ===
                'PUSH' &&
                stockResultante <=
                Number(
                    product.stock_minimo,
                ) &&
                product.proveedor_id &&
                product.proveedor_estado ===
                'activo';

            if (needsPush) {
                const pendingResult =
                    await new sql.Request(
                        transaction,
                    )
                        .input(
                            'productoId',
                            sql.Int,
                            product.id_producto,
                        )
                        .query(`
                            SELECT TOP 1
                                id_pedido
                            FROM dbo.pedidos
                            WHERE
                                producto_id = @productoId
                                AND tipo = N'reposición'
                                AND estado = N'pendiente';
                        `);

                if (
                    !pendingResult.recordset[0]
                ) {
                    const orderQuantity =
                        Math.max(
                            Number(
                                product.stock_minimo,
                            ),
                            1,
                        );

                    const orderResult =
                        await new sql.Request(
                            transaction,
                        )
                            .input(
                                'productoId',
                                sql.Int,
                                product.id_producto,
                            )
                            .input(
                                'usuarioId',
                                sql.Int,
                                usuarioId,
                            )
                            .input(
                                'cantidad',
                                sql.Int,
                                orderQuantity,
                            )
                            .query(`
                                INSERT INTO dbo.pedidos (
                                    producto_id,
                                    cliente_id,
                                    usuario_id,
                                    cantidad,
                                    tipo,
                                    estado
                                )
                                OUTPUT
                                    INSERTED.*
                                VALUES (
                                    @productoId,
                                    NULL,
                                    @usuarioId,
                                    @cantidad,
                                    N'reposición',
                                    N'pendiente'
                                );
                            `);

                    replenishmentOrders.push(
                        orderResult.recordset[0],
                    );
                }
            }
        }

        await transaction.commit();

        return {
            venta: sale,
            detalles: details,
            pedidos_reposicion:
                replenishmentOrders,
        };

    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
        }

        throw error;
    }
}

export async function listSalesByUser(
    usuarioId,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .query(`
                SELECT
                    v.id_venta,
                    v.subtotal,
                    v.total,
                    v.metodo_pago,
                    v.nombre_recibe,
                    v.telefono,
                    v.direccion,
                    v.ciudad,
                    v.codigo_postal,
                    v.estado,
                    v.fecha,
                    COUNT(d.id_detalle) AS productos_distintos,
                    ISNULL(
                        SUM(d.cantidad),
                        0
                    ) AS unidades
                FROM dbo.ventas v
                LEFT JOIN dbo.venta_detalles d
                    ON d.venta_id = v.id_venta
                WHERE
                    v.usuario_id = @usuarioId
                GROUP BY
                    v.id_venta,
                    v.subtotal,
                    v.total,
                    v.metodo_pago,
                    v.nombre_recibe,
                    v.telefono,
                    v.direccion,
                    v.ciudad,
                    v.codigo_postal,
                    v.estado,
                    v.fecha
                ORDER BY
                    v.fecha DESC,
                    v.id_venta DESC;
            `);

    return result.recordset;
}

export async function findSaleByUser(
    ventaId,
    usuarioId,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'ventaId',
                sql.Int,
                ventaId,
            )
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .query(`
                SELECT
                    v.id_venta,
                    v.subtotal,
                    v.total,
                    v.metodo_pago,
                    v.nombre_recibe,
                    v.telefono,
                    v.direccion,
                    v.ciudad,
                    v.codigo_postal,
                    v.estado,
                    v.fecha
                FROM dbo.ventas v
                WHERE
                    v.id_venta = @ventaId
                    AND v.usuario_id = @usuarioId;

                SELECT
                    d.id_detalle,
                    d.producto_id,
                    p.sku,
                    p.nombre,
                    p.marca,
                    p.imagen_url,
                    d.cantidad,
                    d.precio_unitario,
                    d.subtotal
                FROM dbo.venta_detalles d
                INNER JOIN dbo.productos p
                    ON p.id_producto = d.producto_id
                INNER JOIN dbo.ventas v
                    ON v.id_venta = d.venta_id
                WHERE
                    d.venta_id = @ventaId
                    AND v.usuario_id = @usuarioId
                ORDER BY
                    d.id_detalle ASC;
            `);

    const sale =
        result.recordsets[0][0];

    if (!sale) {
        return null;
    }

    return {
        ...sale,
        detalles:
            result.recordsets[1],
    };
}
export async function listSalesForAdmin() {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .query(`
                SELECT
                    v.id_venta,
                    v.cliente_id,
                    v.usuario_id,
                    v.subtotal,
                    v.total,
                    v.metodo_pago,
                    v.nombre_recibe,
                    v.telefono,
                    v.direccion,
                    v.ciudad,
                    v.codigo_postal,
                    v.estado,
                    v.fecha,
                    c.nombre AS cliente_nombre,
                    c.correo AS cliente_correo,
                    ISNULL(
                        resumen.productos_distintos,
                        0
                    ) AS productos_distintos,
                    ISNULL(
                        resumen.unidades,
                        0
                    ) AS unidades
                FROM dbo.ventas v
                LEFT JOIN dbo.clientes c
                    ON c.id_cliente =
                        v.cliente_id
                OUTER APPLY (
                    SELECT
                        COUNT(*) AS productos_distintos,
                        ISNULL(
                            SUM(d.cantidad),
                            0
                        ) AS unidades
                    FROM dbo.venta_detalles d
                    WHERE
                        d.venta_id =
                            v.id_venta
                ) resumen
                ORDER BY
                    v.fecha DESC,
                    v.id_venta DESC;
            `);

    return result.recordset;
}

export async function findSaleForAdmin(
    ventaId,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'ventaId',
                sql.Int,
                ventaId,
            )
            .query(`
                SELECT
                    v.id_venta,
                    v.cliente_id,
                    v.usuario_id,
                    v.subtotal,
                    v.total,
                    v.metodo_pago,
                    v.nombre_recibe,
                    v.telefono,
                    v.direccion,
                    v.ciudad,
                    v.codigo_postal,
                    v.estado,
                    v.fecha,
                    c.nombre AS cliente_nombre,
                    c.correo AS cliente_correo
                FROM dbo.ventas v
                LEFT JOIN dbo.clientes c
                    ON c.id_cliente =
                        v.cliente_id
                WHERE
                    v.id_venta =
                        @ventaId;

                SELECT
                    d.id_detalle,
                    d.producto_id,
                    p.sku,
                    p.nombre,
                    p.marca,
                    p.imagen_url,
                    d.cantidad,
                    d.precio_unitario,
                    d.subtotal
                FROM dbo.venta_detalles d
                INNER JOIN dbo.productos p
                    ON p.id_producto =
                        d.producto_id
                WHERE
                    d.venta_id =
                        @ventaId
                ORDER BY
                    d.id_detalle ASC;
            `);

    const sale =
        result.recordsets[0][0];

    if (!sale) {
        return null;
    }

    return {
        ...sale,
        detalles:
            result.recordsets[1],
    };
}

export async function updateSaleStatus(
    ventaId,
    estado,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'ventaId',
                sql.Int,
                ventaId,
            )
            .input(
                'estado',
                sql.NVarChar(30),
                estado,
            )
            .query(`
                UPDATE dbo.ventas
                SET
                    estado = @estado
                OUTPUT
                    INSERTED.*
                WHERE
                    id_venta = @ventaId;
            `);

    return result.recordset[0] || null;
}