import * as service from '../services/erpService.js';

export async function dashboard(req, res) {
    res.json(await service.getDashboard());
}

export async function catalog(req, res) {
    res.json(await service.getOrderCatalog());
}

export async function indexOrders(req, res) {
    res.json(await service.listOrders(req.query));
}

export async function showOrder(req, res) {
    res.json(await service.getOrder(req.params.id));
}

export async function createOrder(req, res) {
    const order = await service.createOrder({
        ...req.body,
        usuarioId: req.user.id,
    });
    res.status(201).json(order);
}

export async function processOrder(req, res) {
    res.json(await service.processOrder(req.params.id, req.user.id));
}

export async function processOrderFromBody(req, res) {
    res.json(await service.processOrder(req.body.id_orden, req.user.id));
}

export async function updateOrderStatus(req, res) {
    res.json(await service.updateOrderStatus(req.params.id, req.body.estado, req.user.id));
}

export async function showState(req, res) {
    res.json(await service.getState());
}

export async function updateState(req, res) {
    res.json(await service.updateState({
        nivel_erp: req.body.nivel_erp,
        usuarioId: req.user.id,
    }));
}
