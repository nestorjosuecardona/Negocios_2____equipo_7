import { getPool } from '../config/db.js';

export async function getDashboard() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                COUNT(*) AS total_productos,
                ISNULL(SUM(stock_actual), 0) AS stock_total,
                ISNULL(SUM(
                    CASE
                        WHEN stock_actual <= stock_minimo
                        THEN 1
                        ELSE 0
                    END
                ), 0) AS inventario_critico
            FROM dbo.productos
            WHERE estado = N'activo';

            SELECT
                COUNT(*) AS pedidos_pendientes
            FROM dbo.pedidos
            WHERE estado = N'pendiente';

            SELECT TOP 5
                p.id_producto,
                p.sku,
                p.nombre,
                p.estrategia_logistica,
                SUM(m.cantidad) AS unidades_vendidas
            FROM dbo.movimientos_inventario m
            INNER JOIN dbo.productos p
                ON p.id_producto = m.producto_id
            WHERE
                m.tipo = N'salida'
                AND m.motivo = N'venta'
                AND p.estado = N'activo'
            GROUP BY
                p.id_producto,
                p.sku,
                p.nombre,
                p.estrategia_logistica
            ORDER BY
                unidades_vendidas DESC,
                p.nombre ASC;

            SELECT
                p.id_producto,
                p.sku,
                p.nombre,
                p.stock_actual,
                p.stock_minimo,
                p.estrategia_logistica,
                ISNULL(
                    SUM(
                        CASE
                            WHEN
                                m.tipo = N'salida'
                                AND m.motivo = N'venta'
                                AND m.fecha >= DATEADD(
                                    DAY,
                                    -30,
                                    SYSDATETIME()
                                )
                            THEN m.cantidad
                            ELSE 0
                        END
                    ),
                    0
                ) AS unidades_vendidas_30_dias,
                MAX(
                    CASE
                        WHEN
                            m.tipo = N'salida'
                            AND m.motivo = N'venta'
                        THEN m.fecha
                        ELSE NULL
                    END
                ) AS ultima_venta
            FROM dbo.productos p
            LEFT JOIN dbo.movimientos_inventario m
                ON m.producto_id = p.id_producto
            WHERE p.estado = N'activo'
            GROUP BY
                p.id_producto,
                p.sku,
                p.nombre,
                p.stock_actual,
                p.stock_minimo,
                p.estrategia_logistica
            HAVING
                ISNULL(
                    SUM(
                        CASE
                            WHEN
                                m.tipo = N'salida'
                                AND m.motivo = N'venta'
                                AND m.fecha >= DATEADD(
                                    DAY,
                                    -30,
                                    SYSDATETIME()
                                )
                            THEN m.cantidad
                            ELSE 0
                        END
                    ),
                    0
                ) = 0
            ORDER BY
                ultima_venta ASC,
                p.nombre ASC;

            SELECT
                p.id_producto,
                p.sku,
                p.nombre,
                p.stock_actual,
                p.stock_minimo,
                p.estrategia_logistica,
                pr.nombre AS proveedor_nombre
            FROM dbo.productos p
            LEFT JOIN dbo.proveedores pr
                ON pr.id_proveedor = p.proveedor_id
            WHERE
                p.estado = N'activo'
                AND p.stock_actual <= p.stock_minimo
            ORDER BY
                p.stock_actual ASC,
                p.nombre ASC;

            SELECT
                estrategia_logistica,
                COUNT(*) AS productos,
                ISNULL(
                    SUM(stock_actual),
                    0
                ) AS stock_total,
                ISNULL(
                    SUM(
                        CASE
                            WHEN stock_actual <= stock_minimo
                            THEN 1
                            ELSE 0
                        END
                    ),
                    0
                ) AS productos_criticos
            FROM dbo.productos
            WHERE estado = N'activo'
            GROUP BY estrategia_logistica
            ORDER BY estrategia_logistica;
        `);

    const resumenProductos =
        result.recordsets[0][0];

    const resumenPedidos =
        result.recordsets[1][0];

    return {
        resumen: {
            total_productos:
                resumenProductos.total_productos,
            stock_total:
                resumenProductos.stock_total,
            inventario_critico:
                resumenProductos.inventario_critico,
            pedidos_pendientes:
                resumenPedidos.pedidos_pendientes,
        },
        productos_mas_vendidos:
            result.recordsets[2],
        rotacion_lenta:
            result.recordsets[3],
        inventario_critico:
            result.recordsets[4],
        push_pull:
            result.recordsets[5],
    };
}