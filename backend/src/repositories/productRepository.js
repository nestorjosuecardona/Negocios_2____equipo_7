import { getPool, sql } from '../config/db.js';


export async function listCategories() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                id_categoria,
                nombre,
                descripcion,
                estado
            FROM dbo.categorias
            WHERE estado = N'activo'
            ORDER BY nombre ASC;
        `);

    return result.recordset;
}


export async function findCategoryById(id) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'id',
            sql.Int,
            id,
        )
        .query(`
            SELECT
                id_categoria,
                nombre,
                descripcion,
                estado
            FROM dbo.categorias
            WHERE id_categoria = @id;
        `);

    return result.recordset[0] || null;
}


export async function listProducts({
    q = '',
    categoria = 0,
    estado = '',
    estrategia = '',
} = {}) {
    const pool = await getPool();

    const search = `%${q.trim()}%`;

    const result = await pool
        .request()
        .input(
            'q',
            sql.NVarChar(300),
            search,
        )
        .input(
            'categoria',
            sql.Int,
            Number(categoria) || 0,
        )
        .input(
            'estado',
            sql.NVarChar(20),
            estado,
        )
        .input(
            'estrategia',
            sql.NVarChar(10),
            estrategia,
        )
        .query(`
            SELECT
                p.id_producto,
                p.sku,
                p.nombre,
                p.descripcion,
                p.id_categoria,
                c.nombre AS categoria_nombre,
                p.marca,
                p.proveedor_id,
                pr.nombre AS proveedor_nombre,
                p.costo_unitario,
                p.precio_venta,
                p.stock_actual,
                p.stock_minimo,
                p.estrategia_logistica,
                p.imagen_url,
                p.estado,
                p.fecha_registro,
                p.fecha_actualizacion,

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
                    OR p.descripcion LIKE @q
                )

                AND (
                    @categoria = 0
                    OR p.id_categoria = @categoria
                )

                AND (
                    @estado = ''
                    OR p.estado = @estado
                )

                AND (
                    @estrategia = ''
                    OR p.estrategia_logistica = @estrategia
                )

            ORDER BY
                p.fecha_actualizacion DESC,
                p.id_producto DESC;
        `);

    return result.recordset;
}


export async function findProductById(id) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'id',
            sql.Int,
            id,
        )
        .query(`
            SELECT
                p.id_producto,
                p.sku,
                p.nombre,
                p.descripcion,
                p.id_categoria,
                c.nombre AS categoria_nombre,
                p.marca,
                p.proveedor_id,
                pr.nombre AS proveedor_nombre,
                p.costo_unitario,
                p.precio_venta,
                p.stock_actual,
                p.stock_minimo,
                p.estrategia_logistica,
                p.imagen_url,
                p.estado,
                p.fecha_registro,
                p.fecha_actualizacion

            FROM dbo.productos p

            INNER JOIN dbo.categorias c
                ON c.id_categoria = p.id_categoria

            LEFT JOIN dbo.proveedores pr
                ON pr.id_proveedor = p.proveedor_id

            WHERE p.id_producto = @id;
        `);

    return result.recordset[0] || null;
}


export async function findProductBySku(sku) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'sku',
            sql.NVarChar(80),
            sku,
        )
        .query(`
            SELECT
                id_producto,
                sku
            FROM dbo.productos
            WHERE sku = @sku;
        `);

    return result.recordset[0] || null;
}


export async function createProduct(data) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'sku',
            sql.NVarChar(80),
            data.sku,
        )
        .input(
            'nombre',
            sql.NVarChar(180),
            data.nombre,
        )
        .input(
            'descripcion',
            sql.NVarChar(1000),
            data.descripcion || null,
        )
        .input(
            'idCategoria',
            sql.Int,
            data.id_categoria,
        )
        .input(
            'marca',
            sql.NVarChar(150),
            data.marca || null,
        )
        .input(
            'proveedorId',
            sql.Int,
            data.proveedor_id || null,
        )
        .input(
            'costoUnitario',
            sql.Decimal(12, 2),
            data.costo_unitario,
        )
        .input(
            'precioVenta',
            sql.Decimal(12, 2),
            data.precio_venta,
        )
        .input(
            'stockActual',
            sql.Int,
            data.stock_actual,
        )
        .input(
            'stockMinimo',
            sql.Int,
            data.stock_minimo,
        )
        .input(
            'estrategia',
            sql.NVarChar(10),
            data.estrategia_logistica,
        )
        .input(
            'imagenUrl',
            sql.NVarChar(1000),
            data.imagen_url || null,
        )
        .input(
            'estado',
            sql.NVarChar(20),
            data.estado,
        )
        .query(`
            INSERT INTO dbo.productos (
                sku,
                nombre,
                descripcion,
                id_categoria,
                marca,
                proveedor_id,
                costo_unitario,
                precio_venta,
                stock_actual,
                stock_minimo,
                estrategia_logistica,
                imagen_url,
                estado
            )
            OUTPUT INSERTED.*
            VALUES (
                @sku,
                @nombre,
                @descripcion,
                @idCategoria,
                @marca,
                @proveedorId,
                @costoUnitario,
                @precioVenta,
                @stockActual,
                @stockMinimo,
                @estrategia,
                @imagenUrl,
                @estado
            );
        `);

    return result.recordset[0];
}


export async function updateProduct(
    id,
    data,
) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'id',
            sql.Int,
            id,
        )
        .input(
            'sku',
            sql.NVarChar(80),
            data.sku,
        )
        .input(
            'nombre',
            sql.NVarChar(180),
            data.nombre,
        )
        .input(
            'descripcion',
            sql.NVarChar(1000),
            data.descripcion || null,
        )
        .input(
            'idCategoria',
            sql.Int,
            data.id_categoria,
        )
        .input(
            'marca',
            sql.NVarChar(150),
            data.marca || null,
        )
        .input(
            'proveedorId',
            sql.Int,
            data.proveedor_id || null,
        )
        .input(
            'costoUnitario',
            sql.Decimal(12, 2),
            data.costo_unitario,
        )
        .input(
            'precioVenta',
            sql.Decimal(12, 2),
            data.precio_venta,
        )
        .input(
            'stockActual',
            sql.Int,
            data.stock_actual,
        )
        .input(
            'stockMinimo',
            sql.Int,
            data.stock_minimo,
        )
        .input(
            'estrategia',
            sql.NVarChar(10),
            data.estrategia_logistica,
        )
        .input(
            'imagenUrl',
            sql.NVarChar(1000),
            data.imagen_url || null,
        )
        .input(
            'estado',
            sql.NVarChar(20),
            data.estado,
        )
        .query(`
            UPDATE dbo.productos
            SET
                sku = @sku,
                nombre = @nombre,
                descripcion = @descripcion,
                id_categoria = @idCategoria,
                marca = @marca,
                proveedor_id = @proveedorId,
                costo_unitario = @costoUnitario,
                precio_venta = @precioVenta,
                stock_actual = @stockActual,
                stock_minimo = @stockMinimo,
                estrategia_logistica = @estrategia,
                imagen_url = @imagenUrl,
                estado = @estado,
                fecha_actualizacion = SYSDATETIME()

            OUTPUT INSERTED.*

            WHERE id_producto = @id;
        `);

    return result.recordset[0] || null;
}


export async function updateProductStatus(
    id,
    estado,
) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'id',
            sql.Int,
            id,
        )
        .input(
            'estado',
            sql.NVarChar(20),
            estado,
        )
        .query(`
            UPDATE dbo.productos
            SET
                estado = @estado,
                fecha_actualizacion = SYSDATETIME()

            OUTPUT INSERTED.*

            WHERE id_producto = @id;
        `);

    return result.recordset[0] || null;
}


export async function updateProductStrategy(
    id,
    estrategia,
) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'id',
            sql.Int,
            id,
        )
        .input(
            'estrategia',
            sql.NVarChar(10),
            estrategia,
        )
        .query(`
            UPDATE dbo.productos
            SET
                estrategia_logistica = @estrategia,
                fecha_actualizacion = SYSDATETIME()

            OUTPUT INSERTED.*

            WHERE id_producto = @id;
        `);

    return result.recordset[0] || null;
}