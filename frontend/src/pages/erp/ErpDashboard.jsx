import { useEffect, useState } from 'react';
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
import { Boxes, ClipboardCheck, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import { getErpMetricas, getEstadoErp } from '../../services/erpService';

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

export default function ErpDashboard() {
    const { user } = useAuth();
    const canManageInventory = ['SUPER_ADMIN', 'ADMIN', 'LOGISTICA'].includes(user?.rol);
    const canManageLevel = ['SUPER_ADMIN', 'ADMIN'].includes(user?.rol);
    const [data, setData] = useState(null);
    const [state, setState] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getErpMetricas(), getEstadoErp()])
            .then(([metrics, erpState]) => {
                setData(metrics);
                setState(erpState);
            })
            .catch(err => setError(err.response?.data?.message || 'No fue posible cargar el panel ERP.'))
            .finally(() => setLoading(false));
    }, []);

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
        </MainLayout>
    );
}
