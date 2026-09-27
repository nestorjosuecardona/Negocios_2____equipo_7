import { getPool, sql } from '../config/db.js';

export async function listInventory({
    q = '',
    estadoStock = '',
} = {}) {
    const pool = await getPool();

    const search =
        `%${q.trim()}%`;

    const result =
        await pool
            .request()
            .input(
                'q',
                sql.NVarChar(300),
                search,
            )
            .input(
                'estadoStock',
                sql.NVarChar(20),
                estadoStock,
            )
            .query(`
                SELECT
                    p.id_producto,
                    p.sku,
                    p.nombre,
                    p.marca,
                    p.stock_actual,
                    p.stock_minimo,
                    p.estrategia_logistica,
                    p.estado,
                    p.fecha_actualizacion,
                    c.nombre AS categoria_nombre,
                    pr.nombre AS proveedor_nombre,
                    CASE
                        WHEN p.stock_actual <= p.stock_minimo
                        THEN 1
                        ELSE 0
                    END AS stock_bajo
                FROM dbo.productos p
                INNER JOIN dbo.categorias c
                    ON c.id_categoria = p.id_categoria
                LEFT JOIN dbo.proveedores pr
                    ON pr.id_proveedor = p.proveedor_id
                WHERE
                    (
                        @q = '%%'
                        OR p.nombre LIKE @q
                        OR p.sku LIKE @q
                        OR p.marca LIKE @q
                    )
                    AND (
                        @estadoStock = ''
                        OR (
                            @estadoStock = 'bajo'
                            AND p.stock_actual <= p.stock_minimo
                        )
                        OR (
                            @estadoStock = 'normal'
                            AND p.stock_actual > p.stock_minimo
                        )
                    )
                ORDER BY
                    CASE
                        WHEN p.stock_actual <= p.stock_minimo
                        THEN 0
                        ELSE 1
                    END,
                    p.nombre ASC;
            `);

    return result.recordset;
}

export async function listMovements({
    productoId = 0,
    tipo = '',
} = {}) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'productoId',
                sql.Int,
                Number(productoId) || 0,
            )
            .input(
                'tipo',
                sql.NVarChar(20),
                tipo,
            )
            .query(`
                SELECT
                    m.id_movimiento,
                    m.producto_id,
                    p.nombre AS producto_nombre,
                    p.sku,
                    m.usuario_id,
                    u.nombre AS usuario_nombre,
                    m.tipo,
                    m.cantidad,
                    m.motivo,
                    m.descripcion,
                    m.stock_anterior,
                    m.stock_resultante,
                    m.fecha
                FROM dbo.movimientos_inventario m
                INNER JOIN dbo.productos p
                    ON p.id_producto = m.producto_id
                INNER JOIN dbo.usuarios u
                    ON u.id_usuario = m.usuario_id
                WHERE
                    (
                        @productoId = 0
                        OR m.producto_id = @productoId
                    )
                    AND (
                        @tipo = ''
                        OR m.tipo = @tipo
                    )
                ORDER BY
                    m.fecha DESC,
                    m.id_movimiento DESC;
            `);

    return result.recordset;
}

export async function createMovement({
    productoId,
    usuarioId,
    tipo,
    cantidad,
    motivo,
    descripcion,
}) {
    const pool =
        await getPool();

    const transaction =
        new sql.Transaction(
            pool,
        );

    await transaction.begin();

    try {
        const productResult =
            await new sql.Request(
                transaction,
            )
                .input(
                    'productoId',
                    sql.Int,
                    productoId,
                )
                .query(`
                    SELECT
                        p.id_producto,
                        p.nombre,
                        p.stock_actual,
                        p.stock_minimo,
                        p.estrategia_logistica,
                        p.estado,
                        p.proveedor_id,
                        pr.estado AS proveedor_estado
                    FROM dbo.productos p
                    LEFT JOIN dbo.proveedores pr
                        ON pr.id_proveedor = p.proveedor_id
                    WHERE p.id_producto = @productoId;
                `);

        const product =
            productResult.recordset[0];

        if (!product) {
            const error =
                new Error(
                    'Producto no encontrado.',
                );

            error.status = 404;

            throw error;
        }

        if (
            product.estado !==
            'activo'
        ) {
            const error =
                new Error(
                    'No se pueden registrar movimientos para un producto inactivo.',
                );

            error.status = 400;

            throw error;
        }

        const stockAnterior =
            Number(
                product.stock_actual,
            );

        let stockResultante =
            stockAnterior;

        if (
            tipo ===
            'entrada'
        ) {
            stockResultante =
                stockAnterior +
                cantidad;
        }

        if (
            tipo ===
            'salida'
        ) {
            if (
                cantidad >
                stockAnterior
            ) {
                const error =
                    new Error(
                        'No hay stock suficiente para realizar la salida.',
                    );

                error.status = 400;

                throw error;
            }

            stockResultante =
                stockAnterior -
                cantidad;
        }

        await new sql.Request(
            transaction,
        )
            .input(
                'productoId',
                sql.Int,
                productoId,
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
                WHERE id_producto = @productoId;
            `);

        const movementResult =
            await new sql.Request(
                transaction,
            )
                .input(
                    'productoId',
                    sql.Int,
                    productoId,
                )
                .input(
                    'usuarioId',
                    sql.Int,
                    usuarioId,
                )
                .input(
                    'tipo',
                    sql.NVarChar(20),
                    tipo,
                )
                .input(
                    'cantidad',
                    sql.Int,
                    cantidad,
                )
                .input(
                    'motivo',
                    sql.NVarChar(30),
                    motivo,
                )
                .input(
                    'descripcion',
                    sql.NVarChar(500),
                    descripcion || null,
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
                    OUTPUT INSERTED.*
                    VALUES (
                        @productoId,
                        @usuarioId,
                        @tipo,
                        @cantidad,
                        @motivo,
                        @descripcion,
                        @stockAnterior,
                        @stockResultante
                    );
                `);

        let pedidoGenerado =
            null;

        const necesitaPush =
            product
                .estrategia_logistica ===
            'PUSH' &&
            stockResultante <=
            Number(
                product.stock_minimo,
            ) &&
            product.proveedor_id &&
            product.proveedor_estado ===
            'activo';

        if (necesitaPush) {
            const pendingResult =
                await new sql.Request(
                    transaction,
                )
                    .input(
                        'productoId',
                        sql.Int,
                        productoId,
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

            const alreadyPending =
                Boolean(
                    pendingResult
                        .recordset[0],
                );

            if (!alreadyPending) {
                const orderQuantity =
                    Number(
                        product.stock_minimo,
                    );

                const orderResult =
                    await new sql.Request(
                        transaction,
                    )
                        .input(
                            'productoId',
                            sql.Int,
                            productoId,
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
                            OUTPUT INSERTED.*
                            VALUES (
                                @productoId,
                                NULL,
                                @usuarioId,
                                @cantidad,
                                N'reposición',
                                N'pendiente'
                            );
                        `);

                pedidoGenerado =
                    orderResult
                        .recordset[0];
            }
        }

        await transaction
            .commit();

        return {
            movimiento:
                movementResult
                    .recordset[0],

            producto: {
                id_producto:
                    product.id_producto,

                nombre:
                    product.nombre,

                stock_anterior:
                    stockAnterior,

                stock_actual:
                    stockResultante,

                stock_minimo:
                    product.stock_minimo,

                estrategia_logistica:
                    product
                        .estrategia_logistica,

                stock_bajo:
                    stockResultante <=
                    product.stock_minimo,
            },

            pedido_generado:
                pedidoGenerado,
        };
    } catch (error) {
        try {
            await transaction
                .rollback();
        } catch {
        }

        throw error;
    }
}