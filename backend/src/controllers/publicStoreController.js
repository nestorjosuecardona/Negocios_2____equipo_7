import * as service
    from '../services/publicStoreService.js';

export async function categories(
    req,
    res,
) {
    res.json(
        await service.getCategories(),
    );
}

export async function products(
    req,
    res,
) {
    res.json(
        await service.getProducts(
            req.query,
        ),
    );
}

export async function product(
    req,
    res,
) {
    res.json(
        await service.getProduct(
            req.params.id,
        ),
    );
}