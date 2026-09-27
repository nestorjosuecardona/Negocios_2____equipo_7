import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '../src/config/db.js';

const requiredVariables = [
    'SEED_SUPER_ADMIN_EMAIL',
    'SEED_SUPER_ADMIN_PASSWORD',
    'SEED_ADMIN_EMAIL',
    'SEED_ADMIN_PASSWORD',
    'SEED_CLIENTE_EMAIL',
    'SEED_CLIENTE_PASSWORD'
];

for (const variable of requiredVariables) {
    if (!process.env[variable]) {
        console.error(`Falta la variable ${variable} en el archivo .env`);
        process.exit(1);
    }
}

const usuarios = [
    {
        nombre: 'Administrador General',
        correo: process.env.SEED_SUPER_ADMIN_EMAIL,
        password: process.env.SEED_SUPER_ADMIN_PASSWORD,
        rol: 'SUPER_ADMIN'
    },
    {
        nombre: 'Administrador',
        correo: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD,
        rol: 'ADMIN'
    },
    {
        nombre: 'Cliente Demo',
        correo: process.env.SEED_CLIENTE_EMAIL,
        password: process.env.SEED_CLIENTE_PASSWORD,
        rol: 'CLIENTE'
    }
];

async function obtenerRol(pool, nombreRol) {
    const resultado = await pool
        .request()
        .input('nombreRol', sql.NVarChar(30), nombreRol)
        .query(`
            SELECT id_rol
            FROM dbo.roles
            WHERE nombre = @nombreRol
        `);

    if (resultado.recordset.length === 0) {
        throw new Error(`No existe el rol ${nombreRol}`);
    }

    return resultado.recordset[0].id_rol;
}

async function guardarUsuario(pool, usuario) {
    const idRol = await obtenerRol(pool, usuario.rol);

    const passwordHash = await bcrypt.hash(
        usuario.password,
        12
    );

    const existente = await pool
        .request()
        .input(
            'correo',
            sql.NVarChar(180),
            usuario.correo
        )
        .query(`
            SELECT id_usuario
            FROM dbo.usuarios
            WHERE correo = @correo
        `);

    if (existente.recordset.length > 0) {
        await pool
            .request()
            .input(
                'idUsuario',
                sql.Int,
                existente.recordset[0].id_usuario
            )
            .input(
                'nombre',
                sql.NVarChar(120),
                usuario.nombre
            )
            .input(
                'passwordHash',
                sql.NVarChar(255),
                passwordHash
            )
            .input(
                'idRol',
                sql.TinyInt,
                idRol
            )
            .query(`
                UPDATE dbo.usuarios
                SET
                    nombre = @nombre,
                    password_hash = @passwordHash,
                    id_rol = @idRol,
                    estado = N'activo'
                WHERE id_usuario = @idUsuario
            `);

        console.log(
            `${usuario.rol}: usuario actualizado`
        );

        return;
    }

    await pool
        .request()
        .input(
            'nombre',
            sql.NVarChar(120),
            usuario.nombre
        )
        .input(
            'correo',
            sql.NVarChar(180),
            usuario.correo
        )
        .input(
            'passwordHash',
            sql.NVarChar(255),
            passwordHash
        )
        .input(
            'idRol',
            sql.TinyInt,
            idRol
        )
        .query(`
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
            )
        `);

    console.log(
        `${usuario.rol}: usuario creado`
    );
}

async function ejecutarSeed() {
    let pool;

    try {
        pool = await getPool();

        for (const usuario of usuarios) {
            await guardarUsuario(
                pool,
                usuario
            );
        }

        console.log(
            '\nUsuarios iniciales creados correctamente'
        );

    } catch (error) {
        console.error(
            '\nError al crear usuarios iniciales:'
        );

        console.error(error);

        process.exitCode = 1;

    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

ejecutarSeed();