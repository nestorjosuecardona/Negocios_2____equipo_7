import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { Boxes, ClipboardCheck, Plus, Search, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import MainLayout from '../../components/MainLayout';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { crearCliente } from '../../services/clientesService';
import { getCatalogoOrdenesErp, getErpMetricas, getEstadoErp } from '../../services/erpService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const money = value => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
}).format(Number(value || 0));

const date = value => value
    ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    : '—';

const statusTone = {
    pendiente: 'warning',
    procesada: 'success',
    cancelada: 'danger',
};

const emptyClient = {
    nombre: '',
    empresa: '',
    correo: '',
    telefono: '',
    estado: 'activo',
    etapa_crm: 'Prospecto',
};

export default function ErpDashboard() {
    const { user } = useAuth();
    const canManageInventory = ['SUPER_ADMIN', 'ADMIN', 'LOGISTICA'].includes(user?.rol);
    const canManageLevel = ['SUPER_ADMIN', 'ADMIN'].includes(user?.rol);
    const [data, setData] = useState(null);
    const [state, setState] = useState(null);
    const [catalog, setCatalog] = useState({ clientes: [], productos: [] });
    const [clientQuery, setClientQuery] = useState('');
    const [clientStage, setClientStage] = useState('');
    const [productQuery, setProductQuery] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [inventoryQuery, setInventoryQuery] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState('');
    const [clientModal, setClientModal] = useState(false);
    const [clientForm, setClientForm] = useState(emptyClient);
    const [savingClient, setSavingClient] = useState(false);
    const [clientError, setClientError] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getErpMetricas(), getEstadoErp(), getCatalogoOrdenesErp()])
            .then(([metrics, erpState, erpCatalog]) => {
                setData(metrics);
                setState(erpState);
                setCatalog(erpCatalog);
            })
            .catch(err => setError(err.response?.data?.message || 'No fue posible cargar el panel ERP.'))
            .finally(() => setLoading(false));
    }, []);

    const filteredClients = useMemo(() => {
        const query = clientQuery.trim().toLocaleLowerCase('es-MX');
        return catalog.clientes.filter(client => {
            const matchesQuery = !query || [client.nombre, client.empresa, client.correo, client.telefono]
                .some(value => String(value || '').toLocaleLowerCase('es-MX').includes(query));
            return matchesQuery && (!clientStage || client.etapa_crm === clientStage);
        });
    }, [catalog.clientes, clientQuery, clientStage]);

    const filteredProducts = useMemo(() => {
        const query = productQuery.trim().toLocaleLowerCase('es-MX');
        return catalog.productos.filter(product => {
            const matchesQuery = !query || [product.nombre, product.sku, product.categoria_nombre]
                .some(value => String(value || '').toLocaleLowerCase('es-MX').includes(query));
            return matchesQuery && (!productCategory || product.categoria_nombre === productCategory);
        });
    }, [catalog.productos, productQuery, productCategory]);

    const productCategories = useMemo(
        () => [...new Set(catalog.productos.map(product => product.categoria_nombre).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es-MX')),
        [catalog.productos],
    );

    const filteredInventory = useMemo(() => {
        const query = inventoryQuery.trim().toLocaleLowerCase('es-MX');
        return catalog.productos.filter(product => {
            const matchesQuery = !query || [product.nombre, product.sku, product.categoria_nombre]
                .some(value => String(value || '').toLocaleLowerCase('es-MX').includes(query));
            const critical = Number(product.stock_actual) <= Number(product.stock_minimo);
            return matchesQuery && (!inventoryFilter || (inventoryFilter === 'critico' ? critical : !critical));
        });
    }, [catalog.productos, inventoryQuery, inventoryFilter]);

    async function saveClient(event) {
        event.preventDefault();
        setSavingClient(true);
        setClientError('');
        try {
            await crearCliente(clientForm);
            const refreshed = await getCatalogoOrdenesErp();
            setCatalog(refreshed);
            setClientForm(emptyClient);
            setClientModal(false);
        } catch (err) {
            setClientError(err.response?.data?.message || 'No se pudo agregar el cliente.');
        } finally {
            setSavingClient(false);
        }
    }

    const kpis = data?.kpis || {};
    const chartData = {
        labels: data?.ventas_por_mes?.map(item => new Date(`${item.mes}-01T12:00:00`).toLocaleDateString('es-MX', { month: 'short' })) || [],
        datasets: [{
            label: 'Ventas ERP',
            data: data?.ventas_por_mes?.map(item => Number(item.total)) || [],
            backgroundColor: '#d6202f',
            borderRadius: 7,
            maxBarThickness: 38,
        }],
    };

    return (
        <MainLayout>
            <PageHeader
                title="Panel ERP"
                subtitle="Operación integrada de clientes, órdenes e inventario."
                actions={<Link className="btn btn-primary" to="/erp/ordenes">Administrar órdenes</Link>}
            />

            {error && <div className="alert alert-error">{error}</div>}

            <div className="erp-level-banner">
                <div>
                    <span>Nivel de implementación</span>
                    <strong>{state?.nivel_erp || 'Básico'}</strong>
                    <p>{state?.descripcion || 'Integra clientes, productos y existencias en una operación.'}</p>
                </div>
                <div className="erp-level-progress" aria-label={`Progreso ERP ${state?.progreso || 0}%`}>
                    <div><span style={{ width: `${state?.progreso || 0}%` }} /></div>
                    <small>{state?.progreso || 0}% de avance</small>
                    {canManageLevel && <Link className="text-link" to="/erp/nivel">Ver nivel ERP</Link>}
                </div>
            </div>

            <div className="stats-grid">
                <StatCard label="Ventas procesadas" value={loading ? '…' : money(kpis.ventas_totales)} icon={TrendingUp} helper="Órdenes ERP completadas" />
                <StatCard label="Órdenes procesadas" value={loading ? '…' : kpis.ordenes_procesadas} icon={ClipboardCheck} />
                <StatCard label="Productos vendidos" value={loading ? '…' : kpis.productos_vendidos} icon={ShoppingBag} helper="Unidades en órdenes ERP" />
                <StatCard label="Clientes activos" value={loading ? '…' : kpis.clientes_activos} icon={Users} />
            </div>

            <div className="stats-grid erp-secondary-stats">
                <StatCard label="Unidades disponibles" value={loading ? '…' : kpis.inventario_disponible} icon={Boxes} helper="Existencias de productos activos" />
            </div>

            <div className="erp-summary-grid">
                <section className="panel erp-summary-panel">
                    <div className="panel-header erp-summary-heading">
                        <div><h2>Clientes CRM</h2><p>Consulta rápida de clientes activos registrados en CRM.</p></div>
                        {canManageLevel && <button className="btn btn-primary erp-small-action" onClick={() => { setClientError(''); setClientModal(true); }}><Plus size={15} />Agregar cliente</button>}
                    </div>
                    <div className="erp-summary-toolbar">
                        <label className="erp-summary-search"><Search size={16} /><input aria-label="Filtrar clientes" placeholder="Buscar cliente, empresa o contacto" value={clientQuery} onChange={event => setClientQuery(event.target.value)} /></label>
                        <select aria-label="Filtrar clientes por etapa" value={clientStage} onChange={event => setClientStage(event.target.value)}>
                            <option value="">Todas las etapas</option>
                            {['Prospecto', 'Activo', 'Frecuente', 'Inactivo'].map(stage => <option key={stage} value={stage}>{stage}</option>)}
                        </select>
                    </div>
                    {loading ? <div className="erp-loading">Cargando clientes CRM…</div> : filteredClients.length ? (
                        <div className="table-wrap erp-summary-table-wrap">
                            <table>
                                <thead><tr><th>Cliente</th><th>Empresa</th><th>Contacto</th></tr></thead>
                                <tbody>{filteredClients.slice(0, 6).map(client => (
                                    <tr key={client.id_cliente}>
                                        <td>{canManageLevel ? <Link className="text-link" to={`/clientes/${client.id_cliente}`}>{client.nombre}</Link> : <strong>{client.nombre}</strong>}<small className="erp-summary-subtext">{client.etapa_crm}</small></td>
                                        <td>{client.empresa || '—'}</td>
                                        <td><span>{client.correo || 'Sin correo'}</span><small className="erp-summary-subtext">{client.telefono || 'Sin teléfono'}</small></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            {filteredClients.length > 6 && <small className="erp-summary-footnote">Mostrando 6 de {filteredClients.length} resultados.</small>}
                        </div>
                    ) : <EmptyState text="No hay clientes CRM que coincidan con el filtro." />}
                    {canManageLevel && <div className="erp-summary-footer"><Link className="text-link" to="/clientes">Abrir módulo CRM →</Link></div>}
                </section>

                <section className="panel erp-summary-panel">
                    <div className="panel-header erp-summary-heading">
                        <div><h2>Catálogo de productos SCM</h2><p>Consulta rápida de productos, categorías y precios.</p></div>
                        {canManageInventory && <Link className="btn btn-secondary erp-small-action" to="/scm/productos?alta=1"><Plus size={15} />Agregar producto</Link>}
                    </div>
                    <div className="erp-summary-toolbar">
                        <label className="erp-summary-search"><Search size={16} /><input aria-label="Filtrar productos" placeholder="Buscar producto, SKU o categoría" value={productQuery} onChange={event => setProductQuery(event.target.value)} /></label>
                        <select aria-label="Filtrar productos por categoría" value={productCategory} onChange={event => setProductCategory(event.target.value)}>
                            <option value="">Todas las categorías</option>
                            {productCategories.map(category => <option key={category} value={category}>{category}</option>)}
                        </select>
                    </div>
                    {loading ? <div className="erp-loading">Cargando inventario SCM…</div> : filteredProducts.length ? (
                        <div className="table-wrap erp-summary-table-wrap">
                            <table>
                                <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th></tr></thead>
                                <tbody>{filteredProducts.slice(0, 6).map(product => (
                                    <tr key={product.id_producto}>
                                        <td><strong>{product.nombre}</strong><small className="erp-summary-subtext">{product.sku} · {product.categoria_nombre}</small></td>
                                        <td>{product.categoria_nombre || '—'}</td>
                                        <td>{money(product.precio_venta)}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                            {filteredProducts.length > 6 && <small className="erp-summary-footnote">Mostrando 6 de {filteredProducts.length} resultados.</small>}
                        </div>
                    ) : <EmptyState text="No hay productos SCM que coincidan con el filtro." />}
                    <div className="erp-summary-footer"><Link className="text-link" to="/scm/productos">Abrir catálogo SCM →</Link></div>
                </section>

                <section className="panel erp-summary-panel erp-inventory-summary">
                    <div className="panel-header erp-summary-heading">
                        <div><h2>Inventario SCM</h2><p>Existencias actuales y productos que requieren reposición.</p></div>
                        {canManageInventory && <Link className="btn btn-secondary erp-small-action" to="/scm/inventario"><Boxes size={15} />Administrar inventario</Link>}
                    </div>
                    <div className="erp-summary-toolbar">
                        <label className="erp-summary-search"><Search size={16} /><input aria-label="Filtrar inventario" placeholder="Buscar producto, SKU o categoría" value={inventoryQuery} onChange={event => setInventoryQuery(event.target.value)} /></label>
                        <select aria-label="Filtrar inventario por disponibilidad" value={inventoryFilter} onChange={event => setInventoryFilter(event.target.value)}>
                            <option value="">Todo el inventario</option>
                            <option value="critico">Stock crítico</option>
                            <option value="disponible">Stock disponible</option>
                        </select>
                    </div>
                    {loading ? <div className="erp-loading">Cargando inventario…</div> : filteredInventory.length ? (
                        <div className="table-wrap erp-summary-table-wrap">
                            <table>
                                <thead><tr><th>Producto</th><th>Existencias</th><th>Mínimo</th><th>Estado</th></tr></thead>
                                <tbody>{filteredInventory.slice(0, 8).map(product => {
                                    const critical = Number(product.stock_actual) <= Number(product.stock_minimo);
                                    return <tr key={product.id_producto}>
                                        <td><strong>{product.nombre}</strong><small className="erp-summary-subtext">{product.sku} · {product.categoria_nombre}</small></td>
                                        <td>{product.stock_actual} uds.</td>
                                        <td>{product.stock_minimo} uds.</td>
                                        <td><Badge tone={critical ? 'danger' : 'success'}>{critical ? 'Requiere reposición' : 'Disponible'}</Badge></td>
                                    </tr>;
                                })}</tbody>
                            </table>
                            {filteredInventory.length > 8 && <small className="erp-summary-footnote">Mostrando 8 de {filteredInventory.length} resultados.</small>}
                        </div>
                    ) : <EmptyState text="No hay productos de inventario que coincidan con el filtro." />}
                    <div className="erp-summary-footer"><Link className="text-link" to="/scm/inventario">Abrir inventario SCM →</Link></div>
                </section>
            </div>


            <div className="dashboard-grid erp-dashboard-grid">
                <section className="panel chart-panel">
                    <div className="panel-header">
                        <div><h2>Ventas por mes</h2><p>Órdenes ERP procesadas durante los últimos seis meses.</p></div>
                    </div>
                    <div className="chart-box">
                        {data?.ventas_por_mes?.length ? (
                            <Bar data={chartData} options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { ticks: { color: '#c4c4cc' }, grid: { display: false } },
                                    y: { beginAtZero: true, ticks: { color: '#858590', callback: value => money(value) }, grid: { color: '#292930' } },
                                },
                            }} />
                        ) : <EmptyState text="Aún no hay ventas ERP para mostrar." />}
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-header">
                        <div><h2>Inventario crítico</h2><p>Productos en el mínimo o por debajo.</p></div>
                        {canManageInventory && <Link className="text-link" to="/scm/inventario">Ver inventario</Link>}
                    </div>
                    {data?.inventario_critico?.length ? (
                        <div className="erp-stock-list">
                            {data.inventario_critico.map(product => (
                                <div className="erp-stock-row" key={product.id_producto}>
                                    <div><strong>{product.nombre}</strong><small>{product.sku}</small></div>
                                    <Badge tone="danger">{product.stock_actual} / {product.stock_minimo}</Badge>
                                </div>
                            ))}
                        </div>
                    ) : <EmptyState text="No hay productos en nivel crítico." />}
                </section>
            </div>

            <section className="panel erp-recent-panel">
                <div className="panel-header">
                    <div><h2>Órdenes recientes</h2><p>Actividad empresarial conectada con CRM e inventario.</p></div>
                    <Link className="text-link" to="/erp/ordenes">Ver todas</Link>
                </div>
                {data?.ordenes_recientes?.length ? (
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Responsable</th><th>Total</th><th>Estado</th></tr></thead>
                            <tbody>{data.ordenes_recientes.map(order => (
                                <tr key={order.id_orden}>
                                    <td><Link className="text-link" to="/erp/ordenes">ERP-{String(order.id_orden).padStart(5, '0')}</Link></td>
                                    <td>{date(order.fecha)}</td>
                                    <td>{order.cliente_nombre}</td>
                                    <td>{order.usuario_nombre}</td>
                                    <td>{money(order.total)}</td>
                                    <td><Badge tone={statusTone[order.estado] || 'neutral'}>{order.estado}</Badge></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                ) : <EmptyState text="Todavía no hay órdenes empresariales." />}
            </section>

            <Modal open={clientModal} onClose={() => setClientModal(false)} title="Agregar cliente CRM">
                <form className="form-grid" onSubmit={saveClient}>
                    {clientError && <div className="alert alert-error full">{clientError}</div>}
                    <label>Cliente<input required maxLength={150} value={clientForm.nombre} onChange={event => setClientForm({ ...clientForm, nombre: event.target.value })} /></label>
                    <label>Empresa<input maxLength={150} value={clientForm.empresa} onChange={event => setClientForm({ ...clientForm, empresa: event.target.value })} /></label>
                    <label>Correo<input type="email" maxLength={180} value={clientForm.correo} onChange={event => setClientForm({ ...clientForm, correo: event.target.value })} /></label>
                    <label>Teléfono<input maxLength={40} value={clientForm.telefono} onChange={event => setClientForm({ ...clientForm, telefono: event.target.value })} /></label>
                    <label>Etapa CRM<select value={clientForm.etapa_crm} onChange={event => setClientForm({ ...clientForm, etapa_crm: event.target.value })}>{['Prospecto', 'Activo', 'Frecuente', 'Inactivo'].map(stage => <option key={stage}>{stage}</option>)}</select></label>
                    <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setClientModal(false)}>Cancelar</button><button className="btn btn-primary" disabled={savingClient}>{savingClient ? 'Guardando…' : 'Guardar cliente'}</button></div>
                </form>
            </Modal>
        </MainLayout>
    );
}

