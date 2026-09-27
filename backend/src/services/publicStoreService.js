import * as repository
    from '../repositories/publicStoreRepository.js';

export async function getCategories() {
    return repository.listCategories();
}

export async function getProducts(filters) {
    return repository.listProducts({
        q: filters.q || '',
        categoria: filters.categoria || 0,
    });
}

export async function getProduct(id) {
    const product =
        await repository.findProductById(
            Number(id),
        );

    if (!product) {
        const error =
            new Error(
                'Producto no encontrado.',
            );

        error.status = 404;

        throw error;
    }

    return product;
}