import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, ClipboardList, Package, ShoppingBag, Users } from 'lucide-react';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import MainLayout from '../components/MainLayout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { getMetricas } from '../services/metricasService';
import { getScmResumen } from '../services/scmService';
import { getErpMetricas } from '../services/erpService';

const money = value => new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
}).format(Number(value || 0));

const date = value => value
    ? new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const statusTone = { pendiente: 'warning', procesada: 'success', cancelada: 'danger' };

export default function InicioGeneral() {
    const [data, setData] = useState({ crm: null, scm: null, erp: null });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([getMetricas(), getScmResumen(), getErpMetricas()])
            .then(results => {
                const keys = ['crm', 'scm', 'erp'];
                const next = {};
                const failures = [];
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') next[keys[index]] = result.value;
                    else failures.push(result.reason?.response?.data?.message || `No se pudo cargar el resumen ${keys[index].toUpperCase()}.`);
                });
                setData(current => ({ ...current, ...next }));
                setErrors(failures);
            })
            .finally(() => setLoading(false));
    }, []);

    const crm = data.crm || {};
    const scm = data.scm || {};
    const erp = data.erp || {};
    const kpis = erp.kpis || {};

    return (
        <MainLayout>
            <PageHeader title="Inicio general" subtitle="Vista integrada de clientes, inventario y operación empresarial." />

            {errors.map((error, index) => <div className="alert alert-error" key={`${error}-${index}`}>{error}</div>)}

            <div className="stats-grid">
                <StatCard label="Clientes activos" value={loading ? '…' : crm.clientes_activos ?? 0} icon={Users} helper="Relación con clientes (CRM)" />
                <StatCard label="Ventas procesadas" value={loading ? '…' : money(kpis.ventas_totales)} icon={ShoppingBag} helper={`${kpis.ordenes_procesadas || 0} órdenes ERP completadas`} />
                <StatCard label="Productos en catálogo" value={loading ? '…' : scm.productos ?? 0} icon={Package} helper={`${scm.proveedores || 0} proveedores activos`} />
                <StatCard label="Unidades disponibles" value={loading ? '…' : kpis.inventario_disponible ?? scm.stock_total ?? 0} icon={Boxes} helper="Existencias actuales del catálogo" />
            </div>

            <section className="panel general-overview">
                <div className="panel-header">
                    <div><h2>Resumen de módulos</h2><p>Indicadores actuales de las áreas conectadas.</p></div>
                </div>
                <div className="general-module-grid">
                    <Link className="general-module-card" to="/dashboard">
                        <span className="general-module-icon"><Users size={20} /></span>
                        <div><strong>CRM</strong><p>{crm.total_clientes ?? 0} clientes · {crm.interacciones_mes ?? 0} interacciones este mes</p></div>
                        <ArrowRight size={18} />
                    </Link>
                    <Link className="general-module-card" to="/scm">
                        <span className="general-module-icon"><Boxes size={20} /></span>
                        <div><strong>SCM e inventario</strong><p>{scm.productos ?? 0} productos · {scm.ordenes_pendientes ?? 0} reposiciones pendientes</p></div>
                        <ArrowRight size={18} />
                    </Link>
                    <Link className="general-module-card" to="/erp">
                        <span className="general-module-icon"><ClipboardList size={20} /></span>
                        <div><strong>ERP</strong><p>{kpis.ordenes_procesadas ?? 0} órdenes procesadas · {money(kpis.ventas_totales)} en ventas</p></div>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <div className="dashboard-grid general-dashboard-grid">
                <section className="panel">
                    <div className="panel-header"><div><h2>Ventas por mes</h2><p>Ventas empresariales registradas en ERP.</p></div><Link className="text-link" to="/erp">Abrir panel ERP</Link></div>
                    {erp.ventas_por_mes?.length ? (
                        <div className="general-month-list">
                            {erp.ventas_por_mes.map(item => (
                                <div className="general-month-row" key={item.mes}>
                                    <span>{new Date(`${item.mes}-01T12:00:00`).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
                                    <div><span style={{ width: `${Math.max(2, Math.min(100, Number(item.total) / Math.max(1, ...erp.ventas_por_mes.map(month => Number(month.total))) * 100))}%` }} /></div>
                                    <strong>{money(item.total)}</strong>
                                </div>
                            ))}
                        </div>
                    ) : loading ? <p className="general-loading">Cargando ventas…</p> : <EmptyState text="Aún no hay ventas para mostrar." />}
                </section>

                <section className="panel">
                    <div className="panel-header"><div><h2>Productos más vendidos</h2><p>Artículos que generan más movimiento.</p></div><Link className="text-link" to="/scm/productos">Ver catálogo</Link></div>
                    {erp.productos_mas_vendidos?.length ? (
                        <div className="general-top-products">
                            {erp.productos_mas_vendidos.map((product, index) => (
                                <div className="general-top-product" key={product.id_producto}><span>{index + 1}</span><div><strong>{product.nombre}</strong><small>{product.sku}</small></div><Badge tone="success">{product.unidades} uds.</Badge></div>
                            ))}
                        </div>
                    ) : loading ? <p className="general-loading">Cargando productos…</p> : <EmptyState text="Aún no hay productos vendidos." />}
                </section>
            </div>

            <section className="panel general-recent-orders">
                <div className="panel-header"><div><h2>Actividad reciente</h2><p>Órdenes de clientes registradas en el sistema.</p></div><Link className="text-link" to="/erp/ordenes">Ver todas <ArrowRight size={14} /></Link></div>
                {erp.ordenes_recientes?.length ? (
                    <div className="table-wrap"><table><thead><tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Responsable</th><th>Total</th><th>Estado</th></tr></thead><tbody>
                        {erp.ordenes_recientes.slice(0, 6).map(order => <tr key={order.id_orden}><td><Link className="text-link" to="/erp/ordenes">ERP-{String(order.id_orden).padStart(5, '0')}</Link></td><td>{date(order.fecha)}</td><td>{order.cliente_nombre}</td><td>{order.usuario_nombre}</td><td>{money(order.total)}</td><td><Badge tone={statusTone[order.estado] || 'neutral'}>{order.estado}</Badge></td></tr>)}
                    </tbody></table></div>
                ) : loading ? <p className="general-loading">Cargando actividad…</p> : <EmptyState text="Todavía no hay órdenes registradas." />}
            </section>
        </MainLayout>
    );
}
