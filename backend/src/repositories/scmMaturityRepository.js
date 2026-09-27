import { getPool, sql } from '../config/db.js';

export async function getState() {
    const pool = await getPool();

    const result = await pool
        .request()
        .query(`
            SELECT TOP 1
                c.id_configuracion,
                c.nivel_scm,
                c.fecha_actualizacion,
                c.usuario_actualizacion,
                u.nombre AS usuario_nombre
            FROM dbo.configuracion_scm c
            LEFT JOIN dbo.usuarios u
                ON u.id_usuario = c.usuario_actualizacion
            ORDER BY c.id_configuracion;
        `);

    return result.recordset[0] || null;
}

export async function updateLevel({
    nivel,
    usuarioId,
}) {
    const pool = await getPool();

    const current = await getState();

    if (!current) {
        const result = await pool
            .request()
            .input(
                'nivel',
                sql.NVarChar(30),
                nivel,
            )
            .input(
                'usuarioId',
                sql.Int,
                usuarioId,
            )
            .query(`
                INSERT INTO dbo.configuracion_scm (
                    nivel_scm,
                    fecha_actualizacion,
                    usuario_actualizacion
                )
                OUTPUT
                    INSERTED.id_configuracion,
                    INSERTED.nivel_scm,
                    INSERTED.fecha_actualizacion,
                    INSERTED.usuario_actualizacion
                VALUES (
                    @nivel,
                    SYSDATETIME(),
                    @usuarioId
                );
            `);

        return result.recordset[0];
    }

    const result = await pool
        .request()
        .input(
            'id',
            sql.TinyInt,
            current.id_configuracion,
        )
        .input(
            'nivel',
            sql.NVarChar(30),
            nivel,
        )
        .input(
            'usuarioId',
            sql.Int,
            usuarioId,
        )
        .query(`
            UPDATE dbo.configuracion_scm
            SET
                nivel_scm = @nivel,
                fecha_actualizacion = SYSDATETIME(),
                usuario_actualizacion = @usuarioId
            OUTPUT
                INSERTED.id_configuracion,
                INSERTED.nivel_scm,
                INSERTED.fecha_actualizacion,
                INSERTED.usuario_actualizacion
            WHERE id_configuracion = @id;
        `);

    return result.recordset[0];
}