import { getPool, sql } from '../config/db.js';

export async function listSuppliers({
    q = '',
    estado = '',
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
            'estado',
            sql.NVarChar(20),
            estado,
        )
        .query(`
            SELECT
                id_proveedor,
                nombre,
                contacto,
                correo,
                telefono,
                direccion,
                estado,
                fecha_registro
            FROM dbo.proveedores
            WHERE
                (
                    @q = '%%'
                    OR nombre LIKE @q
                    OR contacto LIKE @q
                    OR correo LIKE @q
                    OR telefono LIKE @q
                    OR direccion LIKE @q
                )
                AND (
                    @estado = ''
                    OR estado = @estado
                )
            ORDER BY
                fecha_registro DESC,
                nombre ASC;
        `);

    return result.recordset;
}

export async function findSupplierById(
    id,
) {
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
                id_proveedor,
                nombre,
                contacto,
                correo,
                telefono,
                direccion,
                estado,
                fecha_registro
            FROM dbo.proveedores
            WHERE id_proveedor = @id;
        `);

    return result.recordset[0] || null;
}

export async function createSupplier(
    data,
) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'nombre',
            sql.NVarChar(150),
            data.nombre,
        )
        .input(
            'contacto',
            sql.NVarChar(150),
            data.contacto || null,
        )
        .input(
            'correo',
            sql.NVarChar(180),
            data.correo || null,
        )
        .input(
            'telefono',
            sql.NVarChar(40),
            data.telefono || null,
        )
        .input(
            'direccion',
            sql.NVarChar(300),
            data.direccion || null,
        )
        .input(
            'estado',
            sql.NVarChar(20),
            data.estado || 'activo',
        )
        .query(`
            INSERT INTO dbo.proveedores (
                nombre,
                contacto,
                correo,
                telefono,
                direccion,
                estado
            )
            OUTPUT
                INSERTED.id_proveedor,
                INSERTED.nombre,
                INSERTED.contacto,
                INSERTED.correo,
                INSERTED.telefono,
                INSERTED.direccion,
                INSERTED.estado,
                INSERTED.fecha_registro
            VALUES (
                @nombre,
                @contacto,
                @correo,
                @telefono,
                @direccion,
                @estado
            );
        `);

    return result.recordset[0];
}

export async function updateSupplier(
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
            'nombre',
            sql.NVarChar(150),
            data.nombre,
        )
        .input(
            'contacto',
            sql.NVarChar(150),
            data.contacto || null,
        )
        .input(
            'correo',
            sql.NVarChar(180),
            data.correo || null,
        )
        .input(
            'telefono',
            sql.NVarChar(40),
            data.telefono || null,
        )
        .input(
            'direccion',
            sql.NVarChar(300),
            data.direccion || null,
        )
        .input(
            'estado',
            sql.NVarChar(20),
            data.estado,
        )
        .query(`
            UPDATE dbo.proveedores
            SET
                nombre = @nombre,
                contacto = @contacto,
                correo = @correo,
                telefono = @telefono,
                direccion = @direccion,
                estado = @estado
            OUTPUT
                INSERTED.id_proveedor,
                INSERTED.nombre,
                INSERTED.contacto,
                INSERTED.correo,
                INSERTED.telefono,
                INSERTED.direccion,
                INSERTED.estado,
                INSERTED.fecha_registro
            WHERE id_proveedor = @id;
        `);

    return result.recordset[0] || null;
}

export async function updateSupplierStatus(
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
            UPDATE dbo.proveedores
            SET estado = @estado
            OUTPUT
                INSERTED.id_proveedor,
                INSERTED.nombre,
                INSERTED.contacto,
                INSERTED.correo,
                INSERTED.telefono,
                INSERTED.direccion,
                INSERTED.estado,
                INSERTED.fecha_registro
            WHERE id_proveedor = @id;
        `);

    return result.recordset[0] || null;
}