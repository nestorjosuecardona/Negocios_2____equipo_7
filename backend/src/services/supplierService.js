import * as repository
    from '../repositories/supplierRepository.js';

const validStates = [
    'activo',
    'inactivo',
];

function createError(
    message,
    status,
) {
    const error = new Error(message);

    error.status = status;

    return error;
}

function normalize(data) {
    return {
        nombre:
            data.nombre?.trim() || '',

        contacto:
            data.contacto?.trim() || '',

        correo:
            data.correo
                ?.trim()
                .toLowerCase() || '',

        telefono:
            data.telefono?.trim() || '',

        direccion:
            data.direccion?.trim() || '',

        estado:
            data.estado || 'activo',
    };
}

function validateSupplier(data) {
    if (!data.nombre) {
        throw createError(
            'El nombre del proveedor es obligatorio.',
            400,
        );
    }

    if (
        data.nombre.length > 150
    ) {
        throw createError(
            'El nombre del proveedor es demasiado largo.',
            400,
        );
    }

    if (
        data.estado &&
        !validStates.includes(
            data.estado,
        )
    ) {
        throw createError(
            'Estado de proveedor no válido.',
            400,
        );
    }

    if (
        data.correo &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            data.correo,
        )
    ) {
        throw createError(
            'El correo del proveedor no es válido.',
            400,
        );
    }
}

export async function listSuppliers(
    filters,
) {
    const estado =
        filters.estado || '';

    if (
        estado &&
        !validStates.includes(estado)
    ) {
        throw createError(
            'Filtro de estado no válido.',
            400,
        );
    }

    return repository.listSuppliers({
        q: filters.q || '',
        estado,
    });
}

export async function getSupplier(
    id,
) {
    const supplier =
        await repository
            .findSupplierById(id);

    if (!supplier) {
        throw createError(
            'Proveedor no encontrado.',
            404,
        );
    }

    return supplier;
}

export async function createSupplier(
    data,
) {
    const supplier =
        normalize(data);

    validateSupplier(supplier);

    return repository
        .createSupplier(supplier);
}

export async function updateSupplier(
    id,
    data,
) {
    const current =
        await getSupplier(id);

    const supplier =
        normalize({
            ...current,
            ...data,
        });

    validateSupplier(supplier);

    const updated =
        await repository
            .updateSupplier(
                id,
                supplier,
            );

    if (!updated) {
        throw createError(
            'Proveedor no encontrado.',
            404,
        );
    }

    return updated;
}

export async function updateSupplierStatus(
    id,
    estado,
) {
    if (
        !validStates.includes(estado)
    ) {
        throw createError(
            'Estado de proveedor no válido.',
            400,
        );
    }

    const updated =
        await repository
            .updateSupplierStatus(
                id,
                estado,
            );

    if (!updated) {
        throw createError(
            'Proveedor no encontrado.',
            404,
        );
    }

    return updated;
}