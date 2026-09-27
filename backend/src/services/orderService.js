import * as repository
    from '../repositories/orderRepository.js';

const validStates = [
    'pendiente',
    'surtido',
];

const validTypes = [
    'venta',
    'reposición',
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

export async function listOrders(
    filters,
) {
    const estado =
        filters.estado || '';

    const tipo =
        filters.tipo || '';

    if (
        estado &&
        !validStates.includes(
            estado,
        )
    ) {
        throw createError(
            'Estado de pedido no válido.',
        );
    }

    if (
        tipo &&
        !validTypes.includes(
            tipo,
        )
    ) {
        throw createError(
            'Tipo de pedido no válido.',
        );
    }

    return repository
        .listOrders({
            q: filters.q || '',
            estado,
            tipo,
        });
}

export async function getOrder(
    id,
) {
    const order =
        await repository
            .findOrderById(id);

    if (!order) {
        throw createError(
            'Pedido no encontrado.',
            404,
        );
    }

    return order;
}

export async function createReplenishment({
    productoId,
    usuarioId,
    cantidad,
}) {
    const parsedProductId =
        Number(
            productoId,
        );

    const parsedQuantity =
        Number(
            cantidad,
        );

    if (
        !Number.isInteger(
            parsedProductId,
        ) ||
        parsedProductId <= 0
    ) {
        throw createError(
            'Producto no válido.',
        );
    }

    if (
        !Number.isInteger(
            parsedQuantity,
        ) ||
        parsedQuantity <= 0
    ) {
        throw createError(
            'La cantidad debe ser mayor a cero.',
        );
    }

    return repository
        .createReplenishmentOrder({
            productoId:
                parsedProductId,

            usuarioId,

            cantidad:
                parsedQuantity,
        });
}

export async function fulfillOrder({
    pedidoId,
    usuarioId,
}) {
    return repository
        .fulfillOrder({
            pedidoId:
                Number(
                    pedidoId,
                ),

            usuarioId,
        });
}