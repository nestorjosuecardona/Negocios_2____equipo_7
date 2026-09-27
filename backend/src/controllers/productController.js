import * as service
    from '../services/productService.js';


export async function categories(
    req,
    res,
) {
    const items =
        await service
            .listCategories();

    res.json(items);
}


export async function index(
    req,
    res,
) {
    const items =
        await service
            .listProducts(
                req.query,
            );

    res.json(items);
}


export async function show(
    req,
    res,
) {
    const product =
        await service
            .getProduct(
                Number(
                    req.params.id,
                ),
            );

    res.json(product);
}


export async function store(
    req,
    res,
) {
    const product =
        await service
            .createProduct(
                req.body,
            );

    res
        .status(201)
        .json(product);
}


export async function update(
    req,
    res,
) {
    const product =
        await service
            .updateProduct(
                Number(
                    req.params.id,
                ),
                req.body,
            );

    res.json(product);
}


export async function updateStatus(
    req,
    res,
) {
    const product =
        await service
            .changeStatus(
                Number(
                    req.params.id,
                ),
                req.body.estado,
            );

    res.json(product);
}


export async function updateStrategy(
    req,
    res,
) {
    const product =
        await service
            .changeStrategy(
                Number(
                    req.params.id,
                ),
                req.body
                    .estrategia_logistica,
            );

    res.json(product);
}