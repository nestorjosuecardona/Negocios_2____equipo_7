import * as service
    from '../services/saleService.js';

export async function store(
    req,
    res,
) {
    const result =
        await service.createSale({
            usuarioId:
                req.user.id,

            metodoPago:
                req.body.metodo_pago,

            nombreRecibe:
                req.body.nombre_recibe,

            telefono:
                req.body.telefono,

            direccion:
                req.body.direccion,

            ciudad:
                req.body.ciudad,

            codigoPostal:
                req.body.codigo_postal,

            items:
                req.body.items,
        });

    res
        .status(201)
        .json(result);
}

export async function mine(
    req,
    res,
) {
    const sales =
        await service.listMySales(
            req.user.id,
        );

    res.json(sales);
}

export async function showMine(
    req,
    res,
) {
    const sale =
        await service.getMySale(
            req.params.id,
            req.user.id,
        );

    res.json(sale);
}

export async function adminIndex(
    req,
    res,
) {
    const sales =
        await service
            .listAdminSales();

    res.json(sales);
}

export async function adminShow(
    req,
    res,
) {
    const sale =
        await service
            .getAdminSale(
                req.params.id,
            );

    res.json(sale);
}

export async function adminUpdateStatus(
    req,
    res,
) {
    const sale =
        await service
            .updateAdminSaleStatus(
                req.params.id,
                req.body.estado,
            );

    res.json(sale);
}