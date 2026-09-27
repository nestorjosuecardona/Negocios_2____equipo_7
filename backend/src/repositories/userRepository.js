import {
    getPool,
    sql,
} from '../config/db.js';

export async function findUserByEmail(correo) {
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
            .query(`
                SELECT TOP 1
                    u.id_usuario,
                    u.nombre,
                    u.correo,
                    u.password_hash,
                    u.estado,
                    u.fecha_creacion,
                    u.ultimo_acceso,
                    r.id_rol,
                    r.nombre AS rol
                FROM dbo.usuarios u
                INNER JOIN dbo.roles r
                    ON r.id_rol = u.id_rol
                WHERE
                    u.correo = @correo
            `);

    return (
        result.recordset[0] ||
        null
    );
}

export async function updateLastAccess(
    idUsuario,
) {
    const pool =
        await getPool();

    await pool
        .request()
        .input(
            'idUsuario',
            sql.Int,
            idUsuario,
        )
        .query(`
            UPDATE dbo.usuarios
            SET
                ultimo_acceso =
                    SYSDATETIME()
            WHERE
                id_usuario =
                    @idUsuario
        `);
}

export async function createUser({
    nombre,
    correo,
    passwordHash,
    rol = 'CLIENTE',
}) {
    const pool =
        await getPool();

    const roleResult =
        await pool
            .request()
            .input(
                'rol',
                sql.NVarChar(30),
                rol,
            )
            .query(`
                SELECT
                    id_rol
                FROM dbo.roles
                WHERE
                    nombre = @rol
            `);

    if (
        roleResult.recordset.length ===
        0
    ) {
        throw new Error(
            `El rol ${rol} no existe.`,
        );
    }

    const idRol =
        roleResult.recordset[0]
            .id_rol;

    const result =
        await pool
            .request()
            .input(
                'nombre',
                sql.NVarChar(120),
                nombre,
            )
            .input(
                'correo',
                sql.NVarChar(180),
                correo,
            )
            .input(
                'passwordHash',
                sql.NVarChar(255),
                passwordHash,
            )
            .input(
                'idRol',
                sql.TinyInt,
                idRol,
            )
            .query(`
                INSERT INTO dbo.usuarios (
                    nombre,
                    correo,
                    password_hash,
                    id_rol,
                    estado
                )
                OUTPUT
                    INSERTED.id_usuario,
                    INSERTED.nombre,
                    INSERTED.correo,
                    INSERTED.id_rol,
                    INSERTED.estado
                VALUES (
                    @nombre,
                    @correo,
                    @passwordHash,
                    @idRol,
                    N'activo'
                )
            `);

    return {
        ...result.recordset[0],
        rol,
    };
}

export async function createClientAccount({
    nombre,
    correo,
    passwordHash,
    telefono = null,
}) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'nombre',
                sql.NVarChar(120),
                nombre,
            )
            .input(
                'correo',
                sql.NVarChar(180),
                correo,
            )
            .input(
                'passwordHash',
                sql.NVarChar(255),
                passwordHash,
            )
            .input(
                'telefono',
                sql.NVarChar(40),
                telefono,
            )
            .query(`
                SET XACT_ABORT ON;

                BEGIN TRY

                    BEGIN TRANSACTION;

                    DECLARE @idRol TINYINT;

                    SELECT
                        @idRol = id_rol
                    FROM dbo.roles
                    WHERE
                        nombre = N'CLIENTE';

                    IF @idRol IS NULL
                    BEGIN
                        THROW 50001,
                        'El rol CLIENTE no existe.',
                        1;
                    END;

                    IF EXISTS (
                        SELECT 1
                        FROM dbo.usuarios
                        WHERE
                            correo = @correo
                    )
                    BEGIN
                        THROW 50002,
                        'El correo ya está registrado.',
                        1;
                    END;

                    INSERT INTO dbo.usuarios (
                        nombre,
                        correo,
                        password_hash,
                        id_rol,
                        estado
                    )
                    VALUES (
                        @nombre,
                        @correo,
                        @passwordHash,
                        @idRol,
                        N'activo'
                    );

                    DECLARE @idUsuario INT;

                    SET @idUsuario =
                        CONVERT(
                            INT,
                            SCOPE_IDENTITY()
                        );

                    INSERT INTO dbo.clientes (
                        usuario_id,
                        nombre,
                        correo,
                        telefono,
                        estado,
                        etapa_crm
                    )
                    VALUES (
                        @idUsuario,
                        @nombre,
                        @correo,
                        @telefono,
                        N'activo',
                        N'Prospecto'
                    );

                    DECLARE @idCliente INT;

                    SET @idCliente =
                        CONVERT(
                            INT,
                            SCOPE_IDENTITY()
                        );

                    COMMIT TRANSACTION;

                    SELECT
                        @idUsuario
                            AS id_usuario,
                        @idCliente
                            AS id_cliente,
                        @nombre
                            AS nombre,
                        @correo
                            AS correo,
                        N'CLIENTE'
                            AS rol,
                        N'activo'
                            AS estado;

                END TRY

                BEGIN CATCH

                    IF @@TRANCOUNT > 0
                        ROLLBACK TRANSACTION;

                    THROW;

                END CATCH;
            `);

    return result.recordset[0];
}

export async function getAllUsers() {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .query(`
                SELECT
                    u.id_usuario,
                    u.nombre,
                    u.correo,
                    u.estado,
                    u.fecha_creacion,
                    u.ultimo_acceso,
                    r.id_rol,
                    r.nombre AS rol
                FROM dbo.usuarios u
                INNER JOIN dbo.roles r
                    ON r.id_rol =
                        u.id_rol
                ORDER BY
                    CASE r.nombre
                        WHEN 'SUPER_ADMIN'
                            THEN 1
                        WHEN 'ADMIN'
                            THEN 2
                        WHEN 'CLIENTE'
                            THEN 3
                        ELSE 4
                    END,
                    u.nombre ASC
            `);

    return result.recordset;
}

export async function findUserById(
    idUsuario,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'idUsuario',
                sql.Int,
                idUsuario,
            )
            .query(`
                SELECT
                    u.id_usuario,
                    u.nombre,
                    u.correo,
                    u.estado,
                    u.fecha_creacion,
                    u.ultimo_acceso,
                    r.id_rol,
                    r.nombre AS rol
                FROM dbo.usuarios u
                INNER JOIN dbo.roles r
                    ON r.id_rol =
                        u.id_rol
                WHERE
                    u.id_usuario =
                        @idUsuario
            `);

    return (
        result.recordset[0] ||
        null
    );
}

export async function updateUserData(
    idUsuario,
    {
        nombre,
        correo,
    },
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'idUsuario',
                sql.Int,
                idUsuario,
            )
            .input(
                'nombre',
                sql.NVarChar(120),
                nombre,
            )
            .input(
                'correo',
                sql.NVarChar(180),
                correo,
            )
            .query(`
                SET XACT_ABORT ON;

                BEGIN TRY

                    BEGIN TRANSACTION;

                    UPDATE dbo.usuarios
                    SET
                        nombre = @nombre,
                        correo = @correo
                    WHERE
                        id_usuario =
                            @idUsuario;

                    IF @@ROWCOUNT = 0
                    BEGIN
                        ROLLBACK TRANSACTION;

                        SELECT
                            CAST(
                                NULL AS INT
                            )
                            AS id_usuario;

                        RETURN;
                    END;

                    UPDATE dbo.clientes
                    SET
                        nombre = @nombre,
                        correo = @correo
                    WHERE
                        usuario_id =
                            @idUsuario;

                    COMMIT TRANSACTION;

                    SELECT
                        u.id_usuario,
                        u.nombre,
                        u.correo,
                        u.estado,
                        u.fecha_creacion,
                        u.ultimo_acceso,
                        r.id_rol,
                        r.nombre AS rol
                    FROM dbo.usuarios u
                    INNER JOIN dbo.roles r
                        ON r.id_rol =
                            u.id_rol
                    WHERE
                        u.id_usuario =
                            @idUsuario;

                END TRY

                BEGIN CATCH

                    IF @@TRANCOUNT > 0
                        ROLLBACK TRANSACTION;

                    THROW;

                END CATCH;
            `);

    const item =
        result.recordset?.[0];

    if (
        !item ||
        item.id_usuario === null
    ) {
        return null;
    }

    return item;
}

export async function updateUserStatus(
    idUsuario,
    estado,
) {
    const pool =
        await getPool();

    const result =
        await pool
            .request()
            .input(
                'idUsuario',
                sql.Int,
                idUsuario,
            )
            .input(
                'estado',
                sql.NVarChar(20),
                estado,
            )
            .query(`
                UPDATE dbo.usuarios
                SET
                    estado = @estado
                WHERE
                    id_usuario =
                        @idUsuario;

                SELECT
                    u.id_usuario,
                    u.nombre,
                    u.correo,
                    u.estado,
                    u.fecha_creacion,
                    u.ultimo_acceso,
                    r.id_rol,
                    r.nombre AS rol
                FROM dbo.usuarios u
                INNER JOIN dbo.roles r
                    ON r.id_rol =
                        u.id_rol
                WHERE
                    u.id_usuario =
                        @idUsuario;
            `);

    return (
        result.recordset[0] ||
        null
    );
}