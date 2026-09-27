import * as repository
    from '../repositories/inventoryRepository.js';

const validTypes = [
    'entrada',
    'salida',
];

const validReasons = [
    'venta',
    'ajuste',
    'reposición',
];

const validStockStates = [
    'bajo',
    'normal',
];

function createError(
    message,
    status = 400,
) {
    const error =
        new Error(message);

    error.status = status;

    return error;
}

export async function listInventory(
    filters,
) {
    const estadoStock =
        filters.estadoStock || '';

    if (
        estadoStock &&
        !validStockStates.includes(
            estadoStock,
        )
    ) {
        throw createError(
            'Filtro de stock no válido.',
        );
    }

    return repository
        .listInventory({
            q: filters.q || '',
            estadoStock,
        });
}

export async function listMovements(
    filters,
) {
    const tipo =
        filters.tipo || '';

    if (
        tipo &&
        !validTypes.includes(tipo)
    ) {
        throw createError(
            'Tipo de movimiento no válido.',
        );
    }

    return repository
        .listMovements({
            productoId:
                filters.producto_id ||
                0,

            tipo,
        });
}

export async function createMovement({
    productoId,
    usuarioId,
    tipo,
    cantidad,
    motivo,
    descripcion,
}) {
    const parsedProductId =
        Number(productoId);

    const parsedQuantity =
        Number(cantidad);

    if (
        !Number.isInteger(
            parsedProductId,
        ) ||
        parsedProductId <= 0
    ) {
        throw createError(
            'Debes seleccionar un producto válido.',
        );
    }

    if (
        !validTypes.includes(tipo)
    ) {
        throw createError(
            'El tipo debe ser entrada o salida.',
        );
    }

    if (
        !Number.isInteger(
            parsedQuantity,
        ) ||
        parsedQuantity <= 0
    ) {
        throw createError(
            'La cantidad debe ser un entero mayor a cero.',
        );
    }

    if (
        !validReasons.includes(
            motivo,
        )
    ) {
        throw createError(
            'Motivo de movimiento no válido.',
        );
    }

    if (
        descripcion &&
        descripcion.trim().length >
        500
    ) {
        throw createError(
            'La descripción no puede superar los 500 caracteres.',
        );
    }

    return repository
        .createMovement({
            productoId:
                parsedProductId,

            usuarioId,

            tipo,

            cantidad:
                parsedQuantity,

            motivo,

            descripcion:
                descripcion
                    ?.trim() ||
                null,
        });
}