import {
    getPool,
    sql,
} from '../config/db.js';

export async function getProfileByUserId(
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
                    u.id_usuario,
                    u.nombre,
                    u.correo,
                    u.estado,
                    u.fecha_creacion,
                    u.ultimo_acceso,
                    r.nombre AS rol,
                    c.id_cliente,
                    c.telefono,
                    c.empresa,
                    c.estado AS estado_cliente,
                    c.etapa_crm
                FROM dbo.usuarios u
                INNER JOIN dbo.roles r
                    ON r.id_rol = u.id_rol
                LEFT JOIN dbo.clientes c
                    ON c.usuario_id = u.id_usuario
                WHERE
                    u.id_usuario = @usuarioId;
            `);

    return (
        result.recordset[0] ||
        null
    );
}

export async function emailExistsForOtherUser(
    correo,
    usuarioId,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'correo',
                sql.NVarChar(180),
                correo,
            )
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .query(`
                SELECT TOP 1
                    id_usuario
                FROM dbo.usuarios
                WHERE
                    correo = @correo
                    AND id_usuario <> @usuarioId;
            `);

    return !!result.recordset[0];
}

export async function updateProfile({
    usuarioId,
    nombre,
    correo,
    telefono,
}) {
    const pool =
        await getPool();

    const transaction =
        new sql.Transaction(pool);

    await transaction.begin();

    try {
        await new sql.Request(
            transaction,
        )
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .input(
                'nombre',
                sql.NVarChar(150),
                nombre,
            )
            .input(
                'correo',
                sql.NVarChar(180),
                correo,
            )
            .query(`
                UPDATE dbo.usuarios
                SET
                    nombre = @nombre,
                    correo = @correo
                WHERE
                    id_usuario = @usuarioId;
            `);

        await new sql.Request(
            transaction,
        )
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .input(
                'nombre',
                sql.NVarChar(150),
                nombre,
            )
            .input(
                'correo',
                sql.NVarChar(180),
                correo,
            )
            .input(
                'telefono',
                sql.NVarChar(40),
                telefono || null,
            )
            .query(`
                UPDATE dbo.clientes
                SET
                    nombre = @nombre,
                    correo = @correo,
                    telefono = @telefono
                WHERE
                    usuario_id = @usuarioId;
            `);

        await transaction.commit();

        return await getProfileByUserId(
            usuarioId,
        );

    } catch (error) {
        try {
            await transaction.rollback();
        } catch {
        }

        throw error;
    }
}