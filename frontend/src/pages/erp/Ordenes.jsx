import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Eye, Plus, Search, XCircle } from 'lucide-react';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import MainLayout from '../../components/MainLayout';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import {
    cambiarEstadoOrdenErp,
    crearOrdenErp,
    getCatalogoOrdenesErp,
    getOrdenErp,
    getOrdenesErp,
    procesarOrdenErp,
} from '../../services/erpService';

const emptyForm = { cliente_id: '', producto_id: '', cantidad: '1', items: [] };
const money = value => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value || 0));
const date = value => value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const statusTone = { pendiente: 'warning', procesada: 'success', cancelada: 'danger' };
const folio = id => `ERP-${String(id).padStart(5, '0')}`;

export default function Ordenes() {
    const { user } = useAuth();
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.rol);
    const canCreate = isAdmin || user?.rol === 'VENTAS';
    const canProcess = isAdmin || ['VENTAS', 'LOGISTICA'].includes(user?.rol);
    const [orders, setOrders] = useState([]);
    const [catalog, setCatalog] = useState({ clientes: [], productos: [] });
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getOrdenesErp({ q: search, estado: status });
            setOrders(result);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'No fue posible cargar las órdenes ERP.');
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    useEffect(() => { loadOrders(); }, [loadOrders]);
    useEffect(() => {
        getCatalogoOrdenesErp()
            .then(setCatalog)
            .catch(err => setError(err.response?.data?.message || 'No fue posible cargar clientes y productos.'));
    }, []);

    const selectedProduct = catalog.productos.find(product => Number(product.id_producto) === Number(form.producto_id));
    const selectedItems = useMemo(() => form.items.map(item => ({
        ...item,
        producto: catalog.productos.find(product => Number(product.id_producto) === item.producto_id),
    })), [form.items, catalog.productos]);
    const total = selectedItems.reduce((sum, item) => sum + Number(item.producto?.precio_venta || 0) * item.cantidad, 0);

    function addProduct() {
        if (!selectedProduct) return;
        const quantity = Number(form.cantidad);
        if (!Number.isInteger(quantity) || quantity < 1) {
            setError('La cantidad debe ser un número entero mayor a cero.');
            return;
        }
        const existing = form.items.find(item => item.producto_id === Number(selectedProduct.id_producto));
        const nextQuantity = (existing?.cantidad || 0) + quantity;
        if (nextQuantity > Number(selectedProduct.stock_actual)) {
            setError(`Solo hay ${selectedProduct.stock_actual} unidades de ${selectedProduct.nombre}.`);
            return;
        }
        setForm(current => ({
            ...current,
            items: existing
                ? current.items.map(item => item.producto_id === Number(selectedProduct.id_producto) ? { ...item, cantidad: nextQuantity } : item)
                : [...current.items, { producto_id: Number(selectedProduct.id_producto), cantidad: quantity }],
        }));
        setError('');
    }

    function updateQuantity(productId, value) {
        const quantity = Number(value);
        const product = catalog.productos.find(item => Number(item.id_producto) === productId);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > Number(product?.stock_actual || 0)) return;
        setForm(current => ({ ...current, items: current.items.map(item => item.producto_id === productId ? { ...item, cantidad: quantity } : item) }));
    }

    async function saveOrder(event) {
        event.preventDefault();
        if (!form.cliente_id || !form.items.length) {
            setError('Selecciona un cliente y agrega productos a la orden.');
            return;
        }
        let created = null;
        try {
            setSaving(true);
            setError('');
            setNotice('');
            created = await crearOrdenErp({ cliente_id: Number(form.cliente_id), items: form.items });
            const processed = await procesarOrdenErp(created.id_orden);
            setCreateOpen(false);
            setForm(emptyForm);
            setNotice(`${folio(processed.id_orden)} fue procesada. El inventario y el historial ya están actualizados.`);
            await loadOrders();
            setSelectedOrder(processed);
            setDetailsOpen(true);
        } catch (err) {
            const message = err.response?.data?.message || 'No fue posible guardar la orden ERP.';
            if (created?.id_orden) {
                setCreateOpen(false);
                setForm(emptyForm);
                setError(`${folio(created.id_orden)} quedó pendiente. ${message} Se puede volver a procesar desde el listado.`);
                await loadOrders();
            } else {
                setError(message);
            }
        } finally {
            setSaving(false);
        }
    }

    async function showDetails(id) {
        try {
            setError('');
            setSelectedOrder(await getOrdenErp(id));
            setDetailsOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || 'No fue posible cargar el detalle de la orden.');
        }
    }

    async function processPending(order) {
        try {
            setBusyId(order.id_orden);
            setError('');
            const result = await procesarOrdenErp(order.id_orden);
            setNotice(`${folio(result.id_orden)} fue procesada correctamente.`);
            await loadOrders();
            if (detailsOpen && selectedOrder?.id_orden === result.id_orden) setSelectedOrder(result);
        } catch (err) {
            setError(err.response?.data?.message || 'No fue posible procesar la orden.');
        } finally {
            setBusyId(null);
        }
    }

    async function cancelPending(order) {
        if (!window.confirm(`¿Cancelar la orden ${folio(order.id_orden)}?`)) return;
        try {
            setBusyId(order.id_orden);
            setError('');
            const result = await cambiarEstadoOrdenErp(order.id_orden, 'cancelada');
            setNotice(`${folio(result.id_orden)} fue cancelada.`);
            await loadOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'No fue posible cancelar la orden.');
        } finally {
            setBusyId(null);
        }
    }

    return (
        <MainLayout>
            <PageHeader
                title="Órdenes empresariales"
                subtitle="Crea y procesa órdenes integradas con clientes CRM e inventario SCM."
                actions={canCreate && <button className="btn btn-primary" onClick={() => { setError(''); setForm(emptyForm); setCreateOpen(true); }}><Plus size={17} /> Nueva orden</button>}
            />

            {error && <div className="alert alert-error">{error}</div>}
            {notice && <div className="alert alert-success">{notice}</div>}

            <div className="toolbar erp-orders-toolbar">
                <div className="search-box"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por folio, cliente o responsable" /></div>
                <select value={status} onChange={event => setStatus(event.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="procesada">Procesadas</option>
                    <option value="cancelada">Canceladas</option>
                </select>
            </div>

            <div className="table-card">
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Responsable</th><th>Unidades</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id_orden}>
                                    <td><strong>{folio(order.id_orden)}</strong></td>
                                    <td>{date(order.fecha)}</td>
                                    <td><div>{order.cliente_nombre}</div><small>{order.cliente_correo}</small></td>
                                    <td>{order.usuario_nombre}</td>
                                    <td>{order.unidades}</td>
                                    <td>{money(order.total)}</td>
                                    <td><Badge tone={statusTone[order.estado] || 'neutral'}>{order.estado}</Badge></td>
                                    <td>
                                        <div className="row-actions">
                                            <button className="icon-button" title="Ver detalle" onClick={() => showDetails(order.id_orden)}><Eye size={17} /></button>
                                            {canProcess && order.estado === 'pendiente' && <button className="btn btn-secondary erp-small-action" disabled={busyId === order.id_orden} onClick={() => processPending(order)}>{busyId === order.id_orden ? 'Procesando…' : 'Procesar'}</button>}
                                            {isAdmin && order.estado === 'pendiente' && <button className="icon-button danger" title="Cancelar orden" disabled={busyId === order.id_orden} onClick={() => cancelPending(order)}><XCircle size={17} /></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && !orders.length && <EmptyState text="No hay órdenes empresariales con estos filtros." />}
                {loading && <div className="erp-loading">Cargando órdenes…</div>}
            </div>

            <Modal open={createOpen} title="Nueva orden ERP" onClose={() => !saving && setCreateOpen(false)}>
                <form className="erp-order-form" onSubmit={saveOrder}>
                    <div className="erp-form-step"><span>1</span><div><strong>Selecciona el cliente</strong><small>Se consulta el registro existente en CRM.</small></div></div>
                    <label>Cliente
                        <select required value={form.cliente_id} onChange={event => setForm(current => ({ ...current, cliente_id: event.target.value }))}>
                            <option value="">Seleccionar cliente activo</option>
                            {catalog.clientes.map(client => <option key={client.id_cliente} value={client.id_cliente}>{client.nombre}{client.empresa ? ` · ${client.empresa}` : ''}</option>)}
                        </select>
                    </label>

                    <div className="erp-form-step"><span>2</span><div><strong>Agrega productos</strong><small>Los precios y existencias vienen del inventario SCM.</small></div></div>
                    <div className="erp-add-product">
                        <label>Producto
                            <select value={form.producto_id} onChange={event => setForm(current => ({ ...current, producto_id: event.target.value }))}>
                                <option value="">Seleccionar producto</option>
                                {catalog.productos.map(product => <option key={product.id_producto} value={product.id_producto} disabled={Number(product.stock_actual) < 1}>{product.nombre} · {product.stock_actual} disponibles · {money(product.precio_venta)}</option>)}
                            </select>
                        </label>
                        <label className="erp-quantity-field">Cantidad
                            <input type="number" min="1" max={selectedProduct?.stock_actual || undefined} value={form.cantidad} onChange={event => setForm(current => ({ ...current, cantidad: event.target.value }))} />
                        </label>
                        <button type="button" className="btn btn-secondary" disabled={!selectedProduct} onClick={addProduct}><Plus size={16} /> Agregar</button>
                    </div>

                    {selectedItems.length ? <div className="table-wrap erp-order-preview">
                        <table>
                            <thead><tr><th>Producto</th><th>Existencia</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr></thead>
                            <tbody>{selectedItems.map(item => (
                                <tr key={item.producto_id}>
                                    <td><strong>{item.producto?.nombre || 'Producto no disponible'}</strong><small>{item.producto?.sku}</small></td>
                                    <td>{item.producto?.stock_actual ?? 0}</td>
                                    <td>{money(item.producto?.precio_venta)}</td>
                                    <td><input className="erp-line-quantity" type="number" min="1" max={item.producto?.stock_actual || 1} value={item.cantidad} onChange={event => updateQuantity(item.producto_id, event.target.value)} /></td>
                                    <td>{money(Number(item.producto?.precio_venta || 0) * item.cantidad)}</td>
                                    <td><button type="button" className="icon-button danger" aria-label="Quitar producto" onClick={() => setForm(current => ({ ...current, items: current.items.filter(value => value.producto_id !== item.producto_id) }))}><XCircle size={17} /></button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div> : <div className="erp-order-empty"><ClipboardList size={22} /> Aún no agregas productos.</div>}

                    <div className="erp-order-total"><span>Total estimado</span><strong>{money(total)}</strong></div>
                    <p className="form-help">Al confirmar, el sistema valida el stock, registra la orden y descuenta existencias junto con su movimiento de inventario.</p>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setCreateOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={saving || !form.cliente_id || !form.items.length}>{saving ? 'Procesando orden…' : 'Confirmar y procesar'}</button>
                    </div>
                </form>
            </Modal>

            <Modal open={detailsOpen} title={selectedOrder ? `Detalle ${folio(selectedOrder.id_orden)}` : 'Detalle de orden'} onClose={() => setDetailsOpen(false)}>
                {selectedOrder && <div className="erp-order-details">
                    <div className="erp-detail-grid">
                        <div><small>Cliente</small><strong>{selectedOrder.cliente_nombre}</strong></div>
                        <div><small>Estado</small><Badge tone={statusTone[selectedOrder.estado] || 'neutral'}>{selectedOrder.estado}</Badge></div>
                        <div><small>Creada</small><strong>{date(selectedOrder.fecha)}</strong></div>
                        <div><small>Responsable</small><strong>{selectedOrder.usuario_nombre}</strong></div>
                    </div>
                    <div className="table-wrap">
                        <table><thead><tr><th>Producto</th><th>SKU</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
                            <tbody>{selectedOrder.detalles?.map(line => <tr key={line.id_detalle}><td>{line.producto_nombre}</td><td>{line.sku}</td><td>{line.cantidad}</td><td>{money(line.precio_unitario)}</td><td>{money(line.subtotal)}</td></tr>)}</tbody>
                        </table>
                    </div>
                    <section className="erp-process-history">
                        <h3>Historial de proceso</h3>
                        {selectedOrder.historial?.length ? [...selectedOrder.historial].reverse().map(process => (
                            <div className="erp-process-event" key={process.id_proceso}>
                                <span className="erp-process-dot" />
                                <div>
                                    <strong>{process.tipo}</strong>
                                    <p>{process.descripcion}</p>
                                    <small>{process.usuario_nombre} · {date(process.fecha)}</small>
                                </div>
                            </div>
                        )) : <p className="form-help">No hay eventos registrados.</p>}
                    </section>
                    <div className="erp-order-total"><span>Total</span><strong>{money(selectedOrder.total)}</strong></div>
                    {selectedOrder.fecha_procesada && <p className="erp-processed-at">Procesada el {date(selectedOrder.fecha_procesada)}</p>}
                </div>}
            </Modal>
        </MainLayout>
    );
}
