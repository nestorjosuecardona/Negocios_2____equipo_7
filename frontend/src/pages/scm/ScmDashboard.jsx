import {
    useEffect,
    useState,
} from 'react';

import {
    Boxes,
    Check,
    ClipboardClock,
    Package,
    Target,
    Truck,
} from 'lucide-react';

import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

import {
    actualizarNivelScm,
    getScmEstado,
    getScmResumen,
} from '../../services/scmService';

import '../../styles/scm.css';

export default function ScmDashboard() {
    const [metrics, setMetrics] =
        useState({});

    const [state, setState] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    async function load() {
        setLoading(true);
        setError('');

        try {
            const [
                summaryData,
                stateData,
            ] =
                await Promise.all([
                    getScmResumen(),
                    getScmEstado(),
                ]);

            setMetrics(
                summaryData,
            );

            setState(
                stateData,
            );
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar el resumen SCM.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function changeLevel(
        event,
    ) {
        const nivel =
            event.target.value;

        setSaving(true);
        setError('');

        try {
            const data =
                await actualizarNivelScm(
                    nivel,
                );

            setState(data);
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible actualizar el nivel SCM.',
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <MainLayout>
                <div className="empty-state">
                    Cargando SCM...
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>

            <PageHeader
                title="SCM · Cadena de suministro"
                subtitle="Gestión de productos, inventario, proveedores y procesos logísticos."
            />

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="stats-grid">

                <StatCard
                    label="Proveedores"
                    value={
                        metrics.proveedores ??
                        0
                    }
                    icon={Truck}
                />

                <StatCard
                    label="Productos"
                    value={
                        metrics.productos ??
                        0
                    }
                    icon={Package}
                />

                <StatCard
                    label="Stock total"
                    value={
                        metrics.stock_total ??
                        0
                    }
                    icon={Boxes}
                />

                <StatCard
                    label="Pedidos pendientes"
                    value={
                        metrics.ordenes_pendientes ??
                        0
                    }
                    icon={
                        ClipboardClock
                    }
                />

            </div>

            {state && (
                <section className="panel scm-maturity">

                    <div className="scm-maturity-header">

                        <div>
                            <div className="scm-maturity-title">
                                <Target
                                    size={
                                        22
                                    }
                                />

                                <div>
                                    <h2>
                                        Nivel de madurez SCM
                                    </h2>

                                    <p className="muted">
                                        Evaluación del avance actual de la cadena de suministro.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <select
                            className="scm-level-select"
                            value={
                                state.nivel_scm
                            }
                            onChange={
                                changeLevel
                            }
                            disabled={
                                saving
                            }
                        >
                            <option value="Inicial">
                                Inicial
                            </option>

                            <option value="En desarrollo">
                                En desarrollo
                            </option>

                            <option value="Optimizado">
                                Optimizado
                            </option>
                        </select>

                    </div>

                    <div className="scm-level-card">

                        <div className="scm-level-top">

                            <div>
                                <span className="scm-level-label">
                                    Nivel actual
                                </span>

                                <strong className="scm-level-value">
                                    {
                                        state.nivel_scm
                                    }
                                </strong>
                            </div>

                            <div className="scm-progress-number">
                                {
                                    state.progreso
                                }
                                %
                            </div>

                        </div>

                        <p className="scm-level-description">
                            {
                                state.descripcion
                            }
                        </p>

                        <div className="scm-progress-track">
                            <div
                                className="scm-progress-bar"
                                style={{
                                    width:
                                        `${state.progreso}%`,
                                }}
                            />
                        </div>

                    </div>

                    <div className="scm-checklist">

                        <h3>
                            Checklist de avance
                        </h3>

                        <div className="scm-checklist-grid">

                            {state.checklist.map(
                                (
                                    item,
                                ) => (
                                    <div
                                        key={
                                            item.key
                                        }
                                        className={
                                            `scm-check-item ${item.completed
                                                ? 'completed'
                                                : ''
                                            }`
                                        }
                                    >

                                        <span className="scm-check-icon">
                                            {item.completed && (
                                                <Check
                                                    size={
                                                        15
                                                    }
                                                />
                                            )}
                                        </span>

                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>

                                    </div>
                                ),
                            )}

                        </div>

                    </div>

                    <div className="scm-levels">

                        <div
                            className={
                                state.nivel_scm ===
                                    'Inicial'
                                    ? 'scm-level-step active'
                                    : 'scm-level-step'
                            }
                        >
                            <strong>
                                Inicial
                            </strong>

                            <span>
                                Procesos básicos
                            </span>
                        </div>

                        <div
                            className={
                                state.nivel_scm ===
                                    'En desarrollo'
                                    ? 'scm-level-step active'
                                    : 'scm-level-step'
                            }
                        >
                            <strong>
                                En desarrollo
                            </strong>

                            <span>
                                Procesos integrados
                            </span>
                        </div>

                        <div
                            className={
                                state.nivel_scm ===
                                    'Optimizado'
                                    ? 'scm-level-step active'
                                    : 'scm-level-step'
                            }
                        >
                            <strong>
                                Optimizado
                            </strong>

                            <span>
                                Procesos avanzados
                            </span>
                        </div>

                    </div>

                    {state.fecha_actualizacion && (
                        <div className="scm-last-update">
                            Última actualización:{' '}
                            {new Date(
                                state.fecha_actualizacion,
                            ).toLocaleString(
                                'es-MX',
                            )}

                            {state.usuario_nombre
                                ? ` · ${state.usuario_nombre}`
                                : ''}
                        </div>
                    )}

                </section>
            )}

        </MainLayout>
    );
}