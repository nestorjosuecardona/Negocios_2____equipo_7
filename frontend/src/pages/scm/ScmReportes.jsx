import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    AlertTriangle,
    BarChart3,
    Boxes,
    ClipboardClock,
    Package,
    TrendingDown,
} from 'lucide-react';

import MainLayout
    from '../../components/MainLayout';

import PageHeader
    from '../../components/PageHeader';

import StatCard
    from '../../components/StatCard';

import Badge
    from '../../components/Badge';

import EmptyState
    from '../../components/EmptyState';

import {
    getScmReportes,
} from '../../services/scmService';

import '../../styles/scm.css';

export default function ScmReportes() {
    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    async function load() {
        setLoading(true);
        setError('');

        try {
            const result =
                await getScmReportes();

            setData(result);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los reportes SCM.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const maxSales =
        useMemo(
            () =>
                Math.max(
                    ...(
                        data
                            ?.productos_mas_vendidos ||
                        []
                    ).map(
                        (item) =>
                            Number(
                                item.unidades_vendidas,
                            ),
                    ),
                    1,
                ),
            [data],
        );

    const push =
        useMemo(
            () =>
                data?.push_pull?.find(
                    (item) =>
                        item.estrategia_logistica ===
                        'PUSH',
                ) || {
                    estrategia_logistica:
                        'PUSH',
                    productos: 0,
                    stock_total: 0,
                    productos_criticos: 0,
                },
            [data],
        );

    const pull =
        useMemo(
            () =>
                data?.push_pull?.find(
                    (item) =>
                        item.estrategia_logistica ===
                        'PULL',
                ) || {
                    estrategia_logistica:
                        'PULL',
                    productos: 0,
                    stock_total: 0,
                    productos_criticos: 0,
                },
            [data],
        );

    const maxStrategyProducts =
        Math.max(
            Number(push.productos),
            Number(pull.productos),
            1,
        );

    function formatDate(value) {
        if (!value) {
            return 'Sin ventas registradas';
        }

        return new Date(
            value,
        ).toLocaleString(
            'es-MX',
        );
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="empty-state">
                    Cargando reportes SCM...
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>

            <PageHeader
                title="Reportes y métricas SCM"
                subtitle="Indicadores para evaluar inventario, ventas y estrategias logísticas."
            />

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {data && (
                <>
                    <div className="stats-grid">

                        <StatCard
                            label="Productos"
                            value={
                                data.resumen
                                    .total_productos
                            }
                            icon={Package}
                        />

                        <StatCard
                            label="Stock total"
                            value={
                                data.resumen
                                    .stock_total
                            }
                            icon={Boxes}
                        />

                        <StatCard
                            label="Inventario crítico"
                            value={
                                data.resumen
                                    .inventario_critico
                            }
                            icon={
                                AlertTriangle
                            }
                        />

                        <StatCard
                            label="Pedidos pendientes"
                            value={
                                data.resumen
                                    .pedidos_pendientes
                            }
                            icon={
                                ClipboardClock
                            }
                        />

                    </div>

                    <div className="scm-report-grid">

                        <section className="panel scm-report-panel">

                            <div className="scm-report-heading">

                                <div>
                                    <h2>
                                        Productos más vendidos
                                    </h2>

                                    <p className="muted">
                                        Unidades registradas como salidas por venta.
                                    </p>
                                </div>

                                <BarChart3
                                    size={22}
                                />

                            </div>

                            {data
                                .productos_mas_vendidos
                                .length ? (

                                <div className="scm-sales-chart">

                                    {data
                                        .productos_mas_vendidos
                                        .map(
                                            (
                                                item,
                                            ) => {
                                                const units =
                                                    Number(
                                                        item.unidades_vendidas,
                                                    );

                                                const width =
                                                    Math.max(
                                                        (
                                                            units /
                                                            maxSales
                                                        ) *
                                                        100,
                                                        4,
                                                    );

                                                return (
                                                    <div
                                                        className="scm-sales-row"
                                                        key={
                                                            item.id_producto
                                                        }
                                                    >

                                                        <div className="scm-sales-label">

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        item.nombre
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    {
                                                                        item.sku
                                                                    }
                                                                    {' · '}
                                                                    {
                                                                        item.estrategia_logistica
                                                                    }
                                                                </small>
                                                            </div>

                                                            <strong>
                                                                {
                                                                    units
                                                                }
                                                            </strong>

                                                        </div>

                                                        <div className="scm-chart-track">
                                                            <div
                                                                className="scm-chart-bar"
                                                                style={{
                                                                    width:
                                                                        `${width}%`,
                                                                }}
                                                            />
                                                        </div>

                                                    </div>
                                                );
                                            },
                                        )}

                                </div>

                            ) : (

                                <EmptyState
                                    text="Todavía no hay ventas registradas."
                                />

                            )}

                        </section>

                        <section className="panel scm-report-panel">

                            <div className="scm-report-heading">

                                <div>
                                    <h2>
                                        Comparación PUSH vs PULL
                                    </h2>

                                    <p className="muted">
                                        Distribución de productos y existencias por estrategia.
                                    </p>
                                </div>

                                <Boxes
                                    size={22}
                                />

                            </div>

                            <div className="strategy-comparison">

                                {[push, pull].map(
                                    (
                                        strategy,
                                    ) => {
                                        const products =
                                            Number(
                                                strategy.productos,
                                            );

                                        const width =
                                            Math.max(
                                                (
                                                    products /
                                                    maxStrategyProducts
                                                ) *
                                                100,
                                                products
                                                    ? 6
                                                    : 0,
                                            );

                                        return (
                                            <div
                                                className="strategy-report-card"
                                                key={
                                                    strategy.estrategia_logistica
                                                }
                                            >

                                                <div className="strategy-report-top">

                                                    <span
                                                        className={
                                                            `inventory-strategy strategy-${strategy.estrategia_logistica.toLowerCase()}`
                                                        }
                                                    >
                                                        {
                                                            strategy.estrategia_logistica
                                                        }
                                                    </span>

                                                    <strong>
                                                        {
                                                            products
                                                        }
                                                        {' '}
                                                        producto
                                                        {
                                                            products ===
                                                                1
                                                                ? ''
                                                                : 's'
                                                        }
                                                    </strong>

                                                </div>

                                                <div className="scm-chart-track">
                                                    <div
                                                        className={
                                                            `scm-chart-bar strategy-bar-${strategy.estrategia_logistica.toLowerCase()}`
                                                        }
                                                        style={{
                                                            width:
                                                                `${width}%`,
                                                        }}
                                                    />
                                                </div>

                                                <div className="strategy-report-data">

                                                    <div>
                                                        <span>
                                                            Stock total
                                                        </span>

                                                        <strong>
                                                            {
                                                                strategy.stock_total
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Críticos
                                                        </span>

                                                        <strong>
                                                            {
                                                                strategy.productos_criticos
                                                            }
                                                        </strong>
                                                    </div>

                                                </div>

                                            </div>
                                        );
                                    },
                                )}

                            </div>

                        </section>

                    </div>

                    <div className="scm-report-grid scm-report-grid-bottom">

                        <section className="panel scm-report-panel">

                            <div className="scm-report-heading">

                                <div>
                                    <h2>
                                        Inventario crítico
                                    </h2>

                                    <p className="muted">
                                        Productos cuyo stock actual alcanzó o bajó del mínimo.
                                    </p>
                                </div>

                                <AlertTriangle
                                    size={22}
                                />

                            </div>

                            {data
                                .inventario_critico
                                .length ? (

                                <div className="scm-report-list">

                                    {data
                                        .inventario_critico
                                        .map(
                                            (
                                                item,
                                            ) => (
                                                <div
                                                    className="scm-report-list-item"
                                                    key={
                                                        item.id_producto
                                                    }
                                                >

                                                    <div>
                                                        <strong>
                                                            {
                                                                item.nombre
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                item.sku
                                                            }
                                                            {' · '}
                                                            {
                                                                item.proveedor_nombre ||
                                                                'Sin proveedor'
                                                            }
                                                        </small>
                                                    </div>

                                                    <div className="critical-stock-data">

                                                        <Badge tone="danger">
                                                            Stock {
                                                                item.stock_actual
                                                            }
                                                        </Badge>

                                                        <span>
                                                            Mín. {
                                                                item.stock_minimo
                                                            }
                                                        </span>

                                                    </div>

                                                </div>
                                            ),
                                        )}

                                </div>

                            ) : (

                                <EmptyState
                                    text="No hay productos con inventario crítico."
                                />

                            )}

                        </section>

                        <section className="panel scm-report-panel">

                            <div className="scm-report-heading">

                                <div>
                                    <h2>
                                        Rotación lenta
                                    </h2>

                                    <p className="muted">
                                        Productos sin ventas durante los últimos 30 días.
                                    </p>
                                </div>

                                <TrendingDown
                                    size={22}
                                />

                            </div>

                            {data
                                .rotacion_lenta
                                .length ? (

                                <div className="scm-report-list">

                                    {data
                                        .rotacion_lenta
                                        .map(
                                            (
                                                item,
                                            ) => (
                                                <div
                                                    className="scm-report-list-item"
                                                    key={
                                                        item.id_producto
                                                    }
                                                >

                                                    <div>
                                                        <strong>
                                                            {
                                                                item.nombre
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                item.sku
                                                            }
                                                            {' · Stock '}
                                                            {
                                                                item.stock_actual
                                                            }
                                                        </small>
                                                    </div>

                                                    <div className="slow-rotation-data">

                                                        <Badge tone="warning">
                                                            0 ventas
                                                        </Badge>

                                                        <span>
                                                            {
                                                                formatDate(
                                                                    item.ultima_venta,
                                                                )
                                                            }
                                                        </span>

                                                    </div>

                                                </div>
                                            ),
                                        )}

                                </div>

                            ) : (

                                <EmptyState
                                    text="No hay productos con rotación lenta."
                                />

                            )}

                        </section>

                    </div>
                </>
            )}

        </MainLayout>
    );
}