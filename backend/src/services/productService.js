import * as repository
    from '../repositories/productRepository.js';

import {
    findSupplierById,
} from '../repositories/supplierRepository.js';


const validStates = [
    'activo',
    'inactivo',
];

const validStrategies = [
    'PUSH',
    'PULL',
];


function error(
    message,
    status = 400,
) {
    const err =
        new Error(message);

    err.status = status;

    return err;
}


function numberValue(
    value,
    fallback = 0,
) {
    const number =
        Number(value);

    if (
        Number.isNaN(number)
    ) {
        return fallback;
    }

    return number;
}


function normalize(data) {
    return {
        sku:
            data.sku
                ?.trim()
                .toUpperCase() || '',

        nombre:
            data.nombre
                ?.trim() || '',

        descripcion:
            data.descripcion
                ?.trim() || '',

        id_categoria:
            Number(
                data.id_categoria,
            ),

        marca:
            data.marca
                ?.trim() || '',

        proveedor_id:
            data.proveedor_id
                ? Number(
                    data.proveedor_id,
                )
                : null,

        costo_unitario:
            numberValue(
                data.costo_unitario,
            ),

        precio_venta:
            numberValue(
                data.precio_venta,
            ),

        stock_actual:
            numberValue(
                data.stock_actual,
            ),

        stock_minimo:
            numberValue(
                data.stock_minimo,
            ),

        estrategia_logistica:
            data.estrategia_logistica ||
            'PULL',

        imagen_url:
            data.imagen_url
                ?.trim() || '',

        estado:
            data.estado ||
            'activo',
    };
}


async function validate(
    data,
    currentId = null,
) {
    if (!data.sku) {
        throw error(
            'El SKU es obligatorio.',
        );
    }

    if (!data.nombre) {
        throw error(
            'El nombre del producto es obligatorio.',
        );
    }

    if (
        !Number.isInteger(
            data.id_categoria,
        ) ||
        data.id_categoria <= 0
    ) {
        throw error(
            'Debes seleccionar una categoría.',
        );
    }

    if (
        data.costo_unitario < 0
    ) {
        throw error(
            'El costo unitario no puede ser negativo.',
        );
    }

    if (
        data.precio_venta < 0
    ) {
        throw error(
            'El precio de venta no puede ser negativo.',
        );
    }

    if (
        !Number.isInteger(
            data.stock_actual,
        ) ||
        data.stock_actual < 0
    ) {
        throw error(
            'El stock actual debe ser un entero mayor o igual a cero.',
        );
    }

    if (
        !Number.isInteger(
            data.stock_minimo,
        ) ||
        data.stock_minimo < 0
    ) {
        throw error(
            'El stock mínimo debe ser un entero mayor o igual a cero.',
        );
    }

    if (
        !validStrategies.includes(
            data.estrategia_logistica,
        )
    ) {
        throw error(
            'La estrategia logística debe ser PUSH o PULL.',
        );
    }

    if (
        !validStates.includes(
            data.estado,
        )
    ) {
        throw error(
            'Estado de producto no válido.',
        );
    }


    const category =
        await repository
            .findCategoryById(
                data.id_categoria,
            );

    if (!category) {
        throw error(
            'La categoría seleccionada no existe.',
            404,
        );
    }

    if (
        category.estado !==
        'activo'
    ) {
        throw error(
            'La categoría seleccionada está inactiva.',
        );
    }


    if (data.proveedor_id) {
        const supplier =
            await findSupplierById(
                data.proveedor_id,
            );

        if (!supplier) {
            throw error(
                'El proveedor seleccionado no existe.',
                404,
            );
        }

        if (
            supplier.estado !==
            'activo'
        ) {
            throw error(
                'El proveedor seleccionado está inactivo.',
            );
        }
    }


    const productWithSku =
        await repository
            .findProductBySku(
                data.sku,
            );

    if (
        productWithSku &&
        productWithSku.id_producto !==
        currentId
    ) {
        throw error(
            'Ya existe un producto con ese SKU.',
            409,
        );
    }
}


export async function listCategories() {
    return repository
        .listCategories();
}


export async function listProducts(
    filters,
) {
    const estado =
        filters.estado || '';

    const estrategia =
        filters.estrategia || '';

    if (
        estado &&
        !validStates.includes(
            estado,
        )
    ) {
        throw error(
            'Filtro de estado no válido.',
        );
    }

    if (
        estrategia &&
        !validStrategies.includes(
            estrategia,
        )
    ) {
        throw error(
            'Filtro de estrategia no válido.',
        );
    }

    return repository
        .listProducts({
            q:
                filters.q || '',

            categoria:
                filters.categoria || 0,

            estado,

            estrategia,
        });
}


export async function getProduct(
    id,
) {
    const product =
        await repository
            .findProductById(id);

    if (!product) {
        throw error(
            'Producto no encontrado.',
            404,
        );
    }

    return product;
}


export async function createProduct(
    input,
) {
    const data =
        normalize(input);

    await validate(data);

    return repository
        .createProduct(data);
}


export async function updateProduct(
    id,
    input,
) {
    const current =
        await getProduct(id);

    const data =
        normalize({
            ...current,
            ...input,
        });

    await validate(
        data,
        id,
    );

    const updated =
        await repository
            .updateProduct(
                id,
                data,
            );

    if (!updated) {
        throw error(
            'Producto no encontrado.',
            404,
        );
    }

    return updated;
}


export async function changeStatus(
    id,
    estado,
) {
    if (
        !validStates.includes(
            estado,
        )
    ) {
        throw error(
            'Estado de producto no válido.',
        );
    }

    const updated =
        await repository
            .updateProductStatus(
                id,
                estado,
            );

    if (!updated) {
        throw error(
            'Producto no encontrado.',
            404,
        );
    }

    return updated;
}


export async function changeStrategy(
    id,
    estrategia,
) {
    if (
        !validStrategies.includes(
            estrategia,
        )
    ) {
        throw error(
            'La estrategia debe ser PUSH o PULL.',
        );
    }

    const updated =
        await repository
            .updateProductStrategy(
                id,
                estrategia,
            );

    if (!updated) {
        throw error(
            'Producto no encontrado.',
            404,
        );
    }

    return updated;
}