import 'dotenv/config';

const API =
    'http://localhost:3000/api';

async function login() {
    const response =
        await fetch(
            `${API}/auth/login`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                },

                body: JSON.stringify({
                    correo:
                        process.env
                            .SEED_SUPER_ADMIN_EMAIL,

                    password:
                        process.env
                            .SEED_SUPER_ADMIN_PASSWORD,
                }),
            },
        );

    if (!response.ok) {
        throw new Error(
            'No fue posible iniciar sesión.',
        );
    }

    return response.json();
}

async function obtenerCarlos(
    token,
) {
    const response =
        await fetch(
            `${API}/clientes?q=Carlos`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            },
        );

    const clientes =
        await response.json();

    if (!response.ok) {
        throw new Error(
            JSON.stringify(clientes),
        );
    }

    if (!clientes.length) {
        throw new Error(
            'No se encontró a Carlos Ramírez.',
        );
    }

    return clientes[0];
}

async function crearEvaluacion(
    token,
    clientId,
) {
    const response =
        await fetch(
            `${API}/clientes/${clientId}/evaluaciones`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    Authorization:
                        `Bearer ${token}`,
                },

                body: JSON.stringify({
                    puntuacion: 5,

                    comentario:
                        'Cliente con buen seguimiento e interés en accesorios automotrices.',
                }),
            },
        );

    const data =
        await response.json();

    console.log(
        'Crear evaluación:',
        response.status,
    );

    console.log(data);
}

async function listarEvaluaciones(
    token,
    clientId,
) {
    const response =
        await fetch(
            `${API}/clientes/${clientId}/evaluaciones`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            },
        );

    const data =
        await response.json();

    console.log(
        '\nListar evaluaciones:',
        response.status,
    );

    console.table(data);
}

async function ejecutar() {
    try {
        const session =
            await login();

        const client =
            await obtenerCarlos(
                session.token,
            );

        console.log(
            'Cliente:',
            client.nombre,
        );

        console.log(
            'ID:',
            client.id_cliente,
        );

        await crearEvaluacion(
            session.token,
            client.id_cliente,
        );

        await listarEvaluaciones(
            session.token,
            client.id_cliente,
        );
    } catch (error) {
        console.error(
            '\nERROR:',
        );

        console.error(error);
    }
}

ejecutar();