import * as repository from '../repositories/erpRepository.js';

const levels = ['Básico', 'Integrado', 'Automatizado', 'Optimizado'];
const descriptions = {
    Básico: 'Los datos de clientes, productos y existencias están centralizados.',
    Integrado: 'CRM, inventario y órdenes empresariales comparten la misma operación.',
    Automatizado: 'El procesamiento actualiza existencias e historial en una sola operación.',
    Optimizado: 'La empresa utiliza métricas integradas para mejorar sus procesos.',
};
const checklist = [
    { key: 'clientes', label: 'Clientes CRM disponibles para las órdenes' },
    { key: 'inventario', label: 'Productos y existencias SCM integrados' },
    { key: 'ordenes', label: 'Órdenes empresariales con historial' },
    { key: 'automatizacion', label: 'Descuento de stock y movimiento automáticos' },
    { key: 'metricas', label: 'Indicadores empresariales en un panel' },
];
const completedByLevel = {
    Básico: ['clientes', 'inventario'],
    Integrado: ['clientes', 'inventario', 'ordenes'],
    Automatizado: ['clientes', 'inventario', 'ordenes', 'automatizacion'],
    Optimizado: checklist.map(item => item.key),
};

function createError(message, status = 400) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function positiveInteger(value, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        throw createError(`${label} no es válido.`);
    }
    return number;
}

function normalizeItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw createError('Agrega al menos un producto a la orden.');
    }
    if (items.length > 50) throw createError('La orden no puede tener más de 50 productos distintos.');

    const grouped = new Map();
    for (const item of items) {
        const productId = positiveInteger(item.producto_id, 'El producto');
        const quantity = positiveInteger(item.cantidad, 'La cantidad');
        grouped.set(productId, (grouped.get(productId) || 0) + quantity);
    }
    return [...grouped.entries()]
        .map(([producto_id, cantidad]) => ({ producto_id, cantidad }))
        .sort((a, b) => a.producto_id - b.producto_id);
}

function normalizeOrderId(value) {
    return positiveInteger(value, 'El folio de la orden');
}

function mapState(config) {
    const level = levels.includes(config?.nivel_erp) ? config.nivel_erp : 'Básico';
    const completed = new Set(completedByLevel[level]);
    const items = checklist.map(item => ({ ...item, completed: completed.has(item.key) }));
    return {
        nivel_erp: level,
        descripcion: descriptions[level],
        progreso: Math.round((items.filter(item => item.completed).length / items.length) * 100),
        checklist: items,
        fecha_actualizacion: config?.fecha_actualizacion || null,
        usuario_actualizacion: config?.usuario_actualizacion || null,
        usuario_nombre: config?.usuario_nombre || null,
    };
}

export async function getDashboard() {
    return repository.getDashboard();
}

export async function getOrderCatalog() {
    return repository.getOrderCatalog();
}

export async function listOrders(filters = {}) {
    const estado = filters.estado?.trim() || '';
    if (estado && !['pendiente', 'procesada', 'cancelada'].includes(estado)) {
        throw createError('El filtro de estado no es válido.');
    }
    return repository.listOrders({ q: filters.q || '', estado });
}

export async function getOrder(value) {
    const idOrden = normalizeOrderId(value);
    const order = await repository.findOrderById(idOrden);
    if (!order) throw createError('Orden ERP no encontrada.', 404);
    return order;
}

export async function createOrder({ cliente_id, items, usuarioId }) {
    const clienteId = positiveInteger(cliente_id, 'El cliente');
    return repository.createOrder({
        clienteId,
        usuarioId: positiveInteger(usuarioId, 'El usuario'),
        items: normalizeItems(items),
    });
}

export async function processOrder(value, usuarioId) {
    return repository.processOrder({
        idOrden: normalizeOrderId(value),
        usuarioId: positiveInteger(usuarioId, 'El usuario'),
    });
}

export async function updateOrderStatus(value, estado, usuarioId) {
    const idOrden = normalizeOrderId(value);
    if (estado?.trim().toLowerCase() !== 'cancelada') {
        throw createError('El único cambio manual permitido es cancelar una orden pendiente.');
    }
    return repository.cancelOrder(idOrden, positiveInteger(usuarioId, 'El usuario'));
}

export async function getState() {
    return mapState(await repository.getErpState());
}

export async function updateState({ nivel_erp, usuarioId }) {
    if (!levels.includes(nivel_erp)) throw createError('El nivel ERP seleccionado no es válido.');
    const saved = await repository.saveErpState({
        nivel: nivel_erp,
        usuarioId: positiveInteger(usuarioId, 'El usuario'),
    });
    return mapState(saved);
}
