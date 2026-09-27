import 'dotenv/config';

import {
    getPool,
    sql
} from '../src/config/db.js';


const API =
    'http://localhost:3000/api/auth';

const correo =
    'registro.prueba@negocios2.com';

const password =
    'ClientePrueba123!';


async function cleanup() {
    const pool = await getPool();

    await pool
        .request()
        .input(
            'correo',
            sql.NVarChar(180),
            correo
        )
        .query(`
            DELETE FROM dbo.clientes
            WHERE usuario_id IN (
                SELECT id_usuario
                FROM dbo.usuarios
                WHERE correo = @correo
            );

            DELETE FROM dbo.usuarios
            WHERE correo = @correo;
        `);
}


async function ejecutar() {
    try {
        await cleanup();

        const response = await fetch(
            `${API}/register`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    nombre:
                        'Cliente de Prueba',

                    correo,

                    password,

                    telefono:
                        '4490000000',

                    rol:
                        'SUPER_ADMIN'
                })
            }
        );

        const data =
            await response.json();

        console.log(
            'Status:',
            response.status
        );

        console.log(
            'Rol recibido:',
            data.user?.rol
        );

        if (response.status !== 201) {
            console.log(data);
            return;
        }

        const meResponse =
            await fetch(
                `${API}/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${data.token}`
                    }
                }
            );

        const me =
            await meResponse.json();

        console.log(
            'JWT válido:',
            meResponse.status
        );

        console.log(
            'Rol del JWT:',
            me.user?.rol
        );

    } catch (error) {
        console.error(error);

    } finally {
        await cleanup();

        console.log(
            'Cuenta de prueba eliminada.'
        );

        process.exit(0);
    }
}


ejecutar();