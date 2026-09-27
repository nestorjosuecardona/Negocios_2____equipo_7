import { getPool, sql } from '../config/db.js';

export async function listOrders({
    q = '',
    estado = '',
    tipo = '',
} = {}) {
    const pool =
        await getPool();

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
                'estado',
                sql.NVarChar(20),
                estado,
            )
            .input(
                'tipo',
                sql.NVarChar(20),
                tipo,
            )
            .query(`
                SELECT
                    pe.id_pedido,
                    pe.producto_id,
                    p.nombre AS producto_nombre,
                    p.sku,
                    p.stock_actual,
                    p.stock_minimo,
                    p.estrategia_logistica,
                    p.proveedor_id,
                    pr.nombre AS proveedor_nombre,
                    pe.cliente_id,
                    c.nombre AS cliente_nombre,
                    pe.usuario_id,
                    u.nombre AS usuario_nombre,
                    pe.cantidad,
                    pe.tipo,
                    pe.estado,
                    pe.fecha,
                    pe.fecha_surtido
                FROM dbo.pedidos pe
                INNER JOIN dbo.productos p
                    ON p.id_producto = pe.producto_id
                LEFT JOIN dbo.proveedores pr
                    ON pr.id_proveedor = p.proveedor_id
                LEFT JOIN dbo.clientes c
                    ON c.id_cliente = pe.cliente_id
                INNER JOIN dbo.usuarios u
                    ON u.id_usuario = pe.usuario_id
                WHERE
                    (
                        @q = '%%'
                        OR p.nombre LIKE @q
                        OR p.sku LIKE @q
                        OR pr.nombre LIKE @q
                        OR c.nombre LIKE @q
                    )
                    AND (
                        @estado = ''
                        OR pe.estado = @estado
                    )
                    AND (
                        @tipo = ''
                        OR pe.tipo = @tipo
                    )
                ORDER BY
                    CASE
                        WHEN pe.estado = N'pendiente'
                        THEN 0
                        ELSE 1
                    END,
                    pe.fecha DESC,
                    pe.id_pedido DESC;
            `);

    return result.recordset;
}

export async function findOrderById(
    id,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'id',
                sql.Int,
                id,
            )
            .query(`
                SELECT
                    pe.id_pedido,
                    pe.producto_id,
                    p.nombre AS producto_nombre,
                    p.sku,
                    p.stock_actual,
                    p.stock_minimo,
                    p.estrategia_logistica,
                    p.proveedor_id,
                    pr.nombre AS proveedor_nombre,
                    pe.cliente_id,
                    c.nombre AS cliente_nombre,
                    pe.usuario_id,
                    u.nombre AS usuario_nombre,
                    pe.cantidad,
                    pe.tipo,
                    pe.estado,
                    pe.fecha,
                    pe.fecha_surtido
                FROM dbo.pedidos pe
                INNER JOIN dbo.productos p
                    ON p.id_producto = pe.producto_id
                LEFT JOIN dbo.proveedores pr
                    ON pr.id_proveedor = p.proveedor_id
                LEFT JOIN dbo.clientes c
                    ON c.id_cliente = pe.cliente_id
                INNER JOIN dbo.usuarios u
                    ON u.id_usuario = pe.usuario_id
                WHERE pe.id_pedido = @id;
            `);

    return result.recordset[0] ||
        null;
}

export async function createReplenishmentOrder({
    productoId,
    usuarioId,
    cantidad,
}) {
    const pool =
        await getPool();

    const productResult =
        await pool
            .request()
            .input(
                'productoId',
                sql.Int,
                productoId,
            )
            .query(`
                SELECT
                    p.id_producto,
                    p.nombre,
                    p.proveedor_id,
                    p.estado,
                    pr.estado AS proveedor_estado
                FROM dbo.productos p
                LEFT JOIN dbo.proveedores pr
                    ON pr.id_proveedor = p.proveedor_id
                WHERE p.id_producto = @productoId;
            `);

    const product =
        productResult
            .recordset[0];

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
                'El producto está inactivo.',
            );

        error.status = 400;

        throw error;
    }

    if (
        !product.proveedor_id
    ) {
        const error =
            new Error(
                'El producto no tiene proveedor asignado.',
            );

        error.status = 400;

        throw error;
    }

    if (
        product.proveedor_estado !==
        'activo'
    ) {
        const error =
            new Error(
                'El proveedor del producto está inactivo.',
            );

        error.status = 400;

        throw error;
    }

    const pendingResult =
        await pool
            .request()
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

    if (
        pendingResult
            .recordset[0]
    ) {
        const error =
            new Error(
                'Ya existe una reposición pendiente para este producto.',
            );

        error.status = 409;

        throw error;
    }

    const result =
        await pool
            .request()
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
                cantidad,
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

    return result.recordset[0];
}

export async function fulfillOrder({
    pedidoId,
    usuarioId,
}) {
    const pool =
        await getPool();

    const transaction =
        new sql.Transaction(
            pool,
        );

    await transaction.begin();

    try {
        const orderResult =
            await new sql.Request(
                transaction,
            )
                .input(
                    'pedidoId',
                    sql.Int,
                    pedidoId,
                )
                .query(`
                    SELECT
                        pe.id_pedido,
                        pe.producto_id,
                        pe.cantidad,
                        pe.tipo,
                        pe.estado,
                        p.nombre AS producto_nombre,
                        p.stock_actual
                    FROM dbo.pedidos pe
                    INNER JOIN dbo.productos p
                        ON p.id_producto = pe.producto_id
                    WHERE pe.id_pedido = @pedidoId;
                `);

        const order =
            orderResult
                .recordset[0];

        if (!order) {
            const error =
                new Error(
                    'Pedido no encontrado.',
                );

            error.status = 404;

            throw error;
        }

        if (
            order.estado ===
            'surtido'
        ) {
            const error =
                new Error(
                    'El pedido ya fue surtido.',
                );

            error.status = 409;

            throw error;
        }

        if (
            order.tipo !==
            'reposición'
        ) {
            const error =
                new Error(
                    'Solo las reposiciones se reciben desde este módulo.',
                );

            error.status = 400;

            throw error;
        }

        const stockAnterior =
            Number(
                order.stock_actual,
            );

        const stockResultante =
            stockAnterior +
            Number(
                order.cantidad,
            );

        await new sql.Request(
            transaction,
        )
            .input(
                'productoId',
                sql.Int,
                order.producto_id,
            )
            .input(
                'stock',
                sql.Int,
                stockResultante,
            )
            .query(`
                UPDATE dbo.productos
                SET
                    stock_actual = @stock,
                    fecha_actualizacion = SYSDATETIME()
                WHERE id_producto = @productoId;
            `);

        await new sql.Request(
            transaction,
        )
            .input(
                'pedidoId',
                sql.Int,
                pedidoId,
            )
            .query(`
                UPDATE dbo.pedidos
                SET
                    estado = N'surtido',
                    fecha_surtido = SYSDATETIME()
                WHERE id_pedido = @pedidoId;
            `);

        await new sql.Request(
            transaction,
        )
            .input(
                'productoId',
                sql.Int,
                order.producto_id,
            )
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .input(
                'cantidad',
                sql.Int,
                order.cantidad,
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
                    N'entrada',
                    @cantidad,
                    N'reposición',
                    N'Recepción de pedido de reposición',
                    @stockAnterior,
                    @stockResultante
                );
            `);

        await transaction
            .commit();

        return {
            id_pedido:
                order.id_pedido,

            producto_id:
                order.producto_id,

            producto_nombre:
                order.producto_nombre,

            cantidad:
                order.cantidad,

            stock_anterior:
                stockAnterior,

            stock_resultante:
                stockResultante,

            estado:
                'surtido',
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