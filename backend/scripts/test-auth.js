import 'dotenv/config';

const API_URL = 'http://localhost:3000/api/auth';

const usuarios = [
    {
        nombre: 'SUPER_ADMIN',
        correo: process.env.SEED_SUPER_ADMIN_EMAIL,
        password: process.env.SEED_SUPER_ADMIN_PASSWORD
    },
    {
        nombre: 'ADMIN',
        correo: process.env.SEED_ADMIN_EMAIL,
        password: process.env.SEED_ADMIN_PASSWORD
    },
    {
        nombre: 'CLIENTE',
        correo: process.env.SEED_CLIENTE_EMAIL,
        password: process.env.SEED_CLIENTE_PASSWORD
    }
];

async function probarUsuario(usuario) {
    console.log(`\nProbando ${usuario.nombre}...`);

    const loginResponse = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            correo: usuario.correo,
            password: usuario.password
        })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
        console.error(
            `Error en login de ${usuario.nombre}:`,
            loginData
        );

        return;
    }

    console.log('Login correcto');
    console.log('Usuario:', loginData.user.nombre);
    console.log('Correo:', loginData.user.correo);
    console.log('Rol:', loginData.user.rol);

    const meResponse = await fetch(`${API_URL}/me`, {
        headers: {
            Authorization: `Bearer ${loginData.token}`
        }
    });

    const meData = await meResponse.json();

    if (!meResponse.ok) {
        console.error(
            `Error al validar token de ${usuario.nombre}:`,
            meData
        );

        return;
    }

    console.log('JWT correcto');
    console.log('Sesión validada como:', meData.user.rol);
}

async function ejecutar() {
    try {
        for (const usuario of usuarios) {
            await probarUsuario(usuario);
        }

        console.log('\nPruebas de autenticación terminadas.');
    } catch (error) {
        console.error('\nError durante las pruebas:');
        console.error(error);
    }
}

ejecutar();