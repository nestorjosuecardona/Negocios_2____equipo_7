import { getPool, sql } from '../config/db.js';

export async function getEvaluationsByClient(clientId) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'clientId',
            sql.Int,
            clientId,
        )
        .query(`
            SELECT
                e.id_evaluacion,
                e.cliente_id,
                e.usuario_id,
                e.puntuacion,
                e.comentario,
                e.fecha,
                u.nombre AS usuario_nombre,
                r.nombre AS usuario_rol
            FROM dbo.evaluaciones e
            LEFT JOIN dbo.usuarios u
                ON u.id_usuario = e.usuario_id
            LEFT JOIN dbo.roles r
                ON r.id_rol = u.id_rol
            WHERE e.cliente_id = @clientId
            ORDER BY e.fecha DESC;
        `);

    return result.recordset;
}

export async function createEvaluation({
    clientId,
    userId,
    puntuacion,
    comentario,
}) {
    const pool = await getPool();

    const result = await pool
        .request()
        .input(
            'clientId',
            sql.Int,
            clientId,
        )
        .input(
            'userId',
            sql.Int,
            userId,
        )
        .input(
            'puntuacion',
            sql.TinyInt,
            puntuacion,
        )
        .input(
            'comentario',
            sql.NVarChar(1000),
            comentario || null,
        )
        .query(`
            INSERT INTO dbo.evaluaciones (
                cliente_id,
                usuario_id,
                puntuacion,
                comentario
            )
            OUTPUT
                INSERTED.id_evaluacion,
                INSERTED.cliente_id,
                INSERTED.usuario_id,
                INSERTED.puntuacion,
                INSERTED.comentario,
                INSERTED.fecha
            VALUES (
                @clientId,
                @userId,
                @puntuacion,
                @comentario
            );
        `);

    return result.recordset[0];
}