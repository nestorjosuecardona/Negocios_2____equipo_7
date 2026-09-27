import * as service
    from '../services/supplierService.js';

export async function index(
    req,
    res,
) {
    const suppliers =
        await service.listSuppliers(
            req.query,
        );

    res.json(suppliers);
}

export async function show(
    req,
    res,
) {
    const supplier =
        await service.getSupplier(
            Number(req.params.id),
        );

    res.json(supplier);
}

export async function store(
    req,
    res,
) {
    const supplier =
        await service.createSupplier(
            req.body,
        );

    res
        .status(201)
        .json(supplier);
}

export async function update(
    req,
    res,
) {
    const supplier =
        await service.updateSupplier(
            Number(req.params.id),
            req.body,
        );

    res.json(supplier);
}

export async function updateStatus(
    req,
    res,
) {
    const supplier =
        await service
            .updateSupplierStatus(
                Number(req.params.id),
                req.body.estado,
            );

    res.json(supplier);
}