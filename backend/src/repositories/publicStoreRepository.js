import { getPool, sql } from '../config/db.js';

export async function listCategories() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT
                id_categoria,
                nombre,
                descripcion
            FROM dbo.categorias
            WHERE estado = N'activo'
            ORDER BY nombre;
        `);

    return result.recordset;
}

export async function listProducts({
    q = '',
    categoria = 0,
} = {}) {
    const pool = await getPool();

    const search =
        `%${q.trim()}%`;

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
        .query(`
            SELECT
                p.id_producto,
                p.sku,
                p.nombre,
                p.descripcion,
                p.marca,
                p.precio_venta,
                p.stock_actual,
                p.imagen_url,
                p.id_categoria,
                c.nombre AS categoria_nombre
            FROM dbo.productos p
            INNER JOIN dbo.categorias c
                ON c.id_categoria = p.id_categoria
            WHERE
                p.estado = N'activo'
                AND (
                    @q = '%%'
                    OR p.nombre LIKE @q
                    OR p.descripcion LIKE @q
                    OR p.marca LIKE @q
                    OR p.sku LIKE @q
                )
                AND (
                    @categoria = 0
                    OR p.id_categoria = @categoria
                )
            ORDER BY
                p.nombre ASC;
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
                p.marca,
                p.precio_venta,
                p.stock_actual,
                p.stock_minimo,
                p.imagen_url,
                p.id_categoria,
                c.nombre AS categoria_nombre
            FROM dbo.productos p
            INNER JOIN dbo.categorias c
                ON c.id_categoria = p.id_categoria
            WHERE
                p.id_producto = @id
                AND p.estado = N'activo';
        `);

    return result.recordset[0] || null;
}