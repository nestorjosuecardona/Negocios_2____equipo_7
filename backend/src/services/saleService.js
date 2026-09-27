import * as repository
    from '../repositories/saleRepository.js';

const validPaymentMethods = [
    'efectivo',
    'tarjeta',
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

function requiredText(
    value,
    label,
    maxLength,
) {
    const text =
        value?.trim();

    if (!text) {
        throw createError(
            `${label} es obligatorio.`,
        );
    }

    if (
        text.length >
        maxLength
    ) {
        throw createError(
            `${label} no puede superar ${maxLength} caracteres.`,
        );
    }

    return text;
}

function normalizeItems(items) {
    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {
        throw createError(
            'El carrito está vacío.',
        );
    }

    const grouped =
        new Map();

    for (const item of items) {
        const productoId =
            Number(
                item.producto_id,
            );

        const cantidad =
            Number(
                item.cantidad,
            );

        if (
            !Number.isInteger(
                productoId,
            ) ||
            productoId <= 0
        ) {
            throw createError(
                'Hay un producto no válido en el carrito.',
            );
        }

        if (
            !Number.isInteger(
                cantidad,
            ) ||
            cantidad <= 0
        ) {
            throw createError(
                'Las cantidades del carrito deben ser enteros mayores a cero.',
            );
        }

        grouped.set(
            productoId,
            (grouped.get(
                productoId,
            ) || 0) + cantidad,
        );
    }

    return [...grouped.entries()]
        .map(
            ([producto_id, cantidad]) => ({
                producto_id,
                cantidad,
            }),
        )
        .sort(
            (a, b) =>
                a.producto_id -
                b.producto_id,
        );
}

export async function createSale({
    usuarioId,
    metodoPago,
    nombreRecibe,
    telefono,
    direccion,
    ciudad,
    codigoPostal,
    items,
}) {
    if (
        !validPaymentMethods.includes(
            metodoPago,
        )
    ) {
        throw createError(
            'Método de pago no válido.',
        );
    }

    return repository.createSale({
        usuarioId,

        metodoPago,

        nombreRecibe:
            requiredText(
                nombreRecibe,
                'El nombre de quien recibe',
                150,
            ),

        telefono:
            requiredText(
                telefono,
                'El teléfono',
                30,
            ),

        direccion:
            requiredText(
                direccion,
                'La dirección',
                300,
            ),

        ciudad:
            requiredText(
                ciudad,
                'La ciudad',
                100,
            ),

        codigoPostal:
            requiredText(
                codigoPostal,
                'El código postal',
                20,
            ),

        items:
            normalizeItems(items),
    });
}

export async function listMySales(
    usuarioId,
) {
    return repository
        .listSalesByUser(
            usuarioId,
        );
}

export async function getMySale(
    ventaId,
    usuarioId,
) {
    const id =
        Number(ventaId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw createError(
            'Venta no válida.',
        );
    }

    const sale =
        await repository
            .findSaleByUser(
                id,
                usuarioId,
            );

    if (!sale) {
        throw createError(
            'Venta no encontrada.',
            404,
        );
    }

    return sale;
}

const saleStatusTransitions = {
    pendiente: [
        'confirmado',
    ],
    confirmado: [
        'preparando',
    ],
    preparando: [
        'enviado',
    ],
    enviado: [
        'entregado',
    ],
    entregado: [],
    cancelado: [],
};

function normalizeSaleId(
    ventaId,
) {
    const id =
        Number(ventaId);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw createError(
            'Venta no válida.',
        );
    }

    return id;
}

export async function listAdminSales() {
    return repository
        .listSalesForAdmin();
}

export async function getAdminSale(
    ventaId,
) {
    const id =
        normalizeSaleId(
            ventaId,
        );

    const sale =
        await repository
            .findSaleForAdmin(
                id,
            );

    if (!sale) {
        throw createError(
            'Venta no encontrada.',
            404,
        );
    }

    return sale;
}

export async function updateAdminSaleStatus(
    ventaId,
    estado,
) {
    const id =
        normalizeSaleId(
            ventaId,
        );

    const nextStatus =
        estado
            ?.trim()
            .toLowerCase();

    const sale =
        await repository
            .findSaleForAdmin(
                id,
            );

    if (!sale) {
        throw createError(
            'Venta no encontrada.',
            404,
        );
    }

    if (
        sale.estado ===
        nextStatus
    ) {
        return sale;
    }

    const allowed =
        saleStatusTransitions[
        sale.estado
        ] || [];

    if (
        !allowed.includes(
            nextStatus,
        )
    ) {
        throw createError(
            `No se puede cambiar una venta de ${sale.estado} a ${nextStatus || 'un estado vacío'}.`,
            409,
        );
    }

    await repository
        .updateSaleStatus(
            id,
            nextStatus,
        );

    return repository
        .findSaleForAdmin(
            id,
        );
}