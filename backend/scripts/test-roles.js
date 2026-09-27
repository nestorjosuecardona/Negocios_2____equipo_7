import 'dotenv/config';

const API = 'http://localhost:3000/api';

const usuarios = [
    {
        rol: 'SUPER_ADMIN',
        correo: process.env.SEED_SUPER_ADMIN_EMAIL,
        password:
            process.env.SEED_SUPER_ADMIN_PASSWORD
    },
    {
        rol: 'ADMIN',
        correo: process.env.SEED_ADMIN_EMAIL,
        password:
            process.env.SEED_ADMIN_PASSWORD
    },
    {
        rol: 'CLIENTE',
        correo: process.env.SEED_CLIENTE_EMAIL,
        password:
            process.env.SEED_CLIENTE_PASSWORD
    }
];


async function login(usuario) {
    const response = await fetch(
        `${API}/auth/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json'
            },

            body: JSON.stringify({
                correo: usuario.correo,
                password: usuario.password
            })
        }
    );

    return response.json();
}


async function probarAcceso(
    usuario,
    token
) {
    const response = await fetch(
        `${API}/clientes`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

    console.log(
        `${usuario.rol}:`,
        response.status
    );
}


async function ejecutar() {
    for (const usuario of usuarios) {
        const sesion =
            await login(usuario);

        await probarAcceso(
            usuario,
            sesion.token
        );
    }
}


ejecutar();