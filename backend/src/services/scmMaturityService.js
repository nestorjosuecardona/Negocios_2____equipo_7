import * as repository
    from '../repositories/scmMaturityRepository.js';

const levels = [
    'Inicial',
    'En desarrollo',
    'Optimizado',
];

const descriptions = {
    Inicial:
        'El SCM cuenta con funciones básicas de productos, proveedores e inventario.',

    'En desarrollo':
        'El SCM integra inventario, trazabilidad, pedidos y estrategias PUSH y PULL.',

    Optimizado:
        'El SCM integra procesos logísticos, métricas, reportes y seguimiento avanzado.',
};

const checklists = {
    Inicial: [
        {
            key: 'productos',
            label: 'Gestión de productos',
            completed: true,
        },
        {
            key: 'proveedores',
            label: 'Gestión de proveedores',
            completed: true,
        },
        {
            key: 'inventario',
            label: 'Control de inventario',
            completed: false,
        },
        {
            key: 'trazabilidad',
            label: 'Trazabilidad de movimientos',
            completed: false,
        },
        {
            key: 'push_pull',
            label: 'Estrategias PUSH y PULL',
            completed: false,
        },
        {
            key: 'reportes',
            label: 'Reportes y métricas SCM',
            completed: false,
        },
    ],

    'En desarrollo': [
        {
            key: 'productos',
            label: 'Gestión de productos',
            completed: true,
        },
        {
            key: 'proveedores',
            label: 'Gestión de proveedores',
            completed: true,
        },
        {
            key: 'inventario',
            label: 'Control de inventario',
            completed: true,
        },
        {
            key: 'trazabilidad',
            label: 'Trazabilidad de movimientos',
            completed: true,
        },
        {
            key: 'push_pull',
            label: 'Estrategias PUSH y PULL',
            completed: true,
        },
        {
            key: 'reportes',
            label: 'Reportes y métricas SCM',
            completed: false,
        },
    ],

    Optimizado: [
        {
            key: 'productos',
            label: 'Gestión de productos',
            completed: true,
        },
        {
            key: 'proveedores',
            label: 'Gestión de proveedores',
            completed: true,
        },
        {
            key: 'inventario',
            label: 'Control de inventario',
            completed: true,
        },
        {
            key: 'trazabilidad',
            label: 'Trazabilidad de movimientos',
            completed: true,
        },
        {
            key: 'push_pull',
            label: 'Estrategias PUSH y PULL',
            completed: true,
        },
        {
            key: 'reportes',
            label: 'Reportes y métricas SCM',
            completed: true,
        },
    ],
};

function createError(
    message,
    status = 400,
) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function buildResponse(
    config,
) {
    if (!config) {
        return {
            nivel_scm: 'Inicial',
            descripcion:
                descriptions.Inicial,
            checklist:
                checklists.Inicial,
            progreso: 33,
            fecha_actualizacion:
                null,
            usuario_actualizacion:
                null,
            usuario_nombre:
                null,
        };
    }

    const checklist =
        checklists[
        config.nivel_scm
        ] ||
        checklists.Inicial;

    const completed =
        checklist.filter(
            (item) =>
                item.completed,
        ).length;

    const progreso =
        Math.round(
            (
                completed /
                checklist.length
            ) *
            100,
        );

    return {
        ...config,

        descripcion:
            descriptions[
            config.nivel_scm
            ] ||
            descriptions.Inicial,

        checklist,

        progreso,
    };
}

export async function getState() {
    const config =
        await repository
            .getState();

    return buildResponse(
        config,
    );
}

export async function updateLevel({
    nivel,
    usuarioId,
}) {
    if (
        !levels.includes(
            nivel,
        )
    ) {
        throw createError(
            'Nivel SCM no válido.',
        );
    }

    const updated =
        await repository
            .updateLevel({
                nivel,
                usuarioId,
            });

    const state =
        await repository
            .getState();

    return buildResponse(
        state || updated,
    );
}