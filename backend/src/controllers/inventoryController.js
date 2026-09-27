import * as service
    from '../services/inventoryService.js';

export async function index(
    req,
    res,
) {
    const inventory =
        await service
            .listInventory(
                req.query,
            );

    res.json(inventory);
}

export async function movements(
    req,
    res,
) {
    const items =
        await service
            .listMovements(
                req.query,
            );

    res.json(items);
}

export async function productMovements(
    req,
    res,
) {
    const items =
        await service
            .listMovements({
                ...req.query,

                producto_id:
                    Number(
                        req.params.id,
                    ),
            });

    res.json(items);
}

export async function storeMovement(
    req,
    res,
) {
    const result =
        await service
            .createMovement({
                productoId:
                    req.body
                        .producto_id,

                usuarioId:
                    req.user.id,

                tipo:
                    req.body.tipo,

                cantidad:
                    req.body
                        .cantidad,

                motivo:
                    req.body.motivo,

                descripcion:
                    req.body
                        .descripcion,
            });

    res
        .status(201)
        .json(result);
}