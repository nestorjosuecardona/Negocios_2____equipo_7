import * as service
    from '../services/orderService.js';

export async function index(
    req,
    res,
) {
    const orders =
        await service
            .listOrders(
                req.query,
            );

    res.json(orders);
}

export async function show(
    req,
    res,
) {
    const order =
        await service
            .getOrder(
                Number(
                    req.params.id,
                ),
            );

    res.json(order);
}

export async function store(
    req,
    res,
) {
    const order =
        await service
            .createReplenishment({
                productoId:
                    req.body
                        .producto_id,

                usuarioId:
                    req.user.id,

                cantidad:
                    req.body
                        .cantidad,
            });

    res
        .status(201)
        .json(order);
}

export async function fulfill(
    req,
    res,
) {
    const result =
        await service
            .fulfillOrder({
                pedidoId:
                    req.params.id,

                usuarioId:
                    req.user.id,
            });

    res.json(result);
}