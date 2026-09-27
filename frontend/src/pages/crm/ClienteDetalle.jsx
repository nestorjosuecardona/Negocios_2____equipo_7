import {
    useEffect,
    useState,
} from 'react';

import {
    ArrowLeft,
    Mail,
    MessageSquarePlus,
    Phone,
    Star,
    Users,
} from 'lucide-react';

import {
    Link,
    useParams,
} from 'react-router-dom';

import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

import {
    cambiarEtapa,
    getCliente,
    getInteraccionesCliente,
} from '../../services/clientesService';

import {
    crearInteraccion,
} from '../../services/interaccionesService';

import {
    crearEvaluacionCliente,
    getEvaluacionesCliente,
} from '../../services/evaluacionesService';


const stages = [
    'Prospecto',
    'Activo',
    'Frecuente',
    'Inactivo',
];

const interactionTypes = [
    'Llamada',
    'Correo',
    'Reunión',
];


export default function ClienteDetalle() {
    const { id } = useParams();

    const [cliente, setCliente] =
        useState(null);

    const [
        interacciones,
        setInteracciones,
    ] = useState([]);

    const [
        evaluaciones,
        setEvaluaciones,
    ] = useState([]);

    const [
        interactionOpen,
        setInteractionOpen,
    ] = useState(false);

    const [
        evaluationOpen,
        setEvaluationOpen,
    ] = useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


    const [
        interactionForm,
        setInteractionForm,
    ] = useState({
        tipo: 'Llamada',

        descripcion: '',

        fecha: new Date()
            .toISOString()
            .slice(0, 16),
    });


    const [
        evaluationForm,
        setEvaluationForm,
    ] = useState({
        puntuacion: 5,
        comentario: '',
    });


    async function load() {
        setLoading(true);
        setError('');

        try {
            const [
                clienteData,
                interaccionesData,
                evaluacionesData,
            ] = await Promise.all([
                getCliente(id),

                getInteraccionesCliente(id),

                getEvaluacionesCliente(id),
            ]);

            setCliente(clienteData);

            setInteracciones(
                interaccionesData,
            );

            setEvaluaciones(
                evaluacionesData,
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No se pudo cargar la información del cliente.',
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        load();
    }, [id]);


    async function cambiarEtapaCliente(
        event,
    ) {
        const nuevaEtapa =
            event.target.value;

        try {
            await cambiarEtapa(
                id,
                nuevaEtapa,
            );

            setCliente((actual) => ({
                ...actual,
                etapa_crm: nuevaEtapa,
            }));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No se pudo cambiar la etapa CRM.',
            );
        }
    }


    async function guardarInteraccion(
        event,
    ) {
        event.preventDefault();

        try {
            await crearInteraccion({
                cliente_id: Number(id),

                tipo:
                    interactionForm.tipo,

                descripcion:
                    interactionForm.descripcion,

                fecha:
                    interactionForm.fecha,
            });

            setInteractionOpen(false);

            setInteractionForm({
                tipo: 'Llamada',

                descripcion: '',

                fecha: new Date()
                    .toISOString()
                    .slice(0, 16),
            });

            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No se pudo guardar la interacción.',
            );
        }
    }


    async function guardarEvaluacion(
        event,
    ) {
        event.preventDefault();

        try {
            await crearEvaluacionCliente(
                id,
                {
                    puntuacion:
                        Number(
                            evaluationForm
                                .puntuacion,
                        ),

                    comentario:
                        evaluationForm
                            .comentario,
                },
            );

            setEvaluationOpen(false);

            setEvaluationForm({
                puntuacion: 5,
                comentario: '',
            });

            await load();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No se pudo guardar la evaluación.',
            );
        }
    }


    function estrellas(puntuacion) {
        return (
            '★'.repeat(puntuacion) +
            '☆'.repeat(5 - puntuacion)
        );
    }


    function formatearFecha(fecha) {
        return new Date(
            fecha,
        ).toLocaleString(
            'es-MX',
        );
    }


    return (
        <MainLayout>

            <PageHeader
                title={
                    cliente?.nombre ||
                    'Detalle del cliente'
                }
                subtitle={
                    cliente?.empresa ||
                    'Información y seguimiento CRM'
                }
                actions={
                    <>
                        <Link
                            className="btn btn-secondary"
                            to="/clientes"
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Volver
                        </Link>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setEvaluationOpen(
                                    true,
                                )
                            }
                        >
                            <Star size={17} />

                            Nueva evaluación
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                                setInteractionOpen(
                                    true,
                                )
                            }
                        >
                            <MessageSquarePlus
                                size={17}
                            />

                            Nueva interacción
                        </button>
                    </>
                }
            />


            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}


            {loading && (
                <div className="panel">
                    Cargando información...
                </div>
            )}


            {!loading && cliente && (
                <>

                    {/* INFORMACIÓN DEL CLIENTE */}

                    <section className="panel client-summary">

                        <div className="avatar">
                            {cliente.nombre
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>


                        <div className="client-main">

                            <div className="client-title">

                                <h2>
                                    {
                                        cliente.nombre
                                    }
                                </h2>

                                <Badge
                                    tone={
                                        cliente.estado ===
                                            'activo'
                                            ? 'success'
                                            : 'danger'
                                    }
                                >
                                    {
                                        cliente.estado
                                    }
                                </Badge>

                            </div>


                            <div className="client-meta">

                                <span>
                                    <Mail
                                        size={16}
                                    />

                                    {
                                        cliente.correo ||
                                        'Sin correo'
                                    }
                                </span>

                                <span>
                                    <Phone
                                        size={16}
                                    />

                                    {
                                        cliente.telefono ||
                                        'Sin teléfono'
                                    }
                                </span>

                                <span>
                                    <Users
                                        size={16}
                                    />

                                    {
                                        cliente.empresa ||
                                        'Sin empresa'
                                    }
                                </span>

                            </div>

                        </div>


                        <label className="stage-control">

                            Etapa CRM

                            <select
                                value={
                                    cliente.etapa_crm
                                }
                                onChange={
                                    cambiarEtapaCliente
                                }
                            >
                                {stages.map(
                                    (stage) => (
                                        <option
                                            key={
                                                stage
                                            }
                                            value={
                                                stage
                                            }
                                        >
                                            {
                                                stage
                                            }
                                        </option>
                                    ),
                                )}
                            </select>

                        </label>

                    </section>


                    {/* INTERACCIONES */}

                    <section className="panel">

                        <div className="panel-header">

                            <div>
                                <h2>
                                    Historial de interacciones
                                </h2>

                                <p>
                                    Línea de tiempo
                                    centralizada del cliente.
                                </p>
                            </div>

                        </div>


                        {interacciones.length ? (

                            <div className="timeline">

                                {interacciones.map(
                                    (item) => (
                                        <div
                                            className="timeline-item"
                                            key={
                                                item.id_interaccion
                                            }
                                        >

                                            <div className="timeline-dot" />

                                            <div className="timeline-card">

                                                <div className="timeline-head">

                                                    <strong>
                                                        {
                                                            item.tipo
                                                        }
                                                    </strong>

                                                    <time>
                                                        {
                                                            formatearFecha(
                                                                item.fecha,
                                                            )
                                                        }
                                                    </time>

                                                </div>

                                                <p>
                                                    {
                                                        item.descripcion
                                                    }
                                                </p>

                                                <small>
                                                    Responsable:{' '}
                                                    {
                                                        item.usuario_nombre
                                                    }
                                                </small>

                                            </div>

                                        </div>
                                    ),
                                )}

                            </div>

                        ) : (

                            <EmptyState
                                text="Este cliente todavía no tiene interacciones."
                            />

                        )}

                    </section>


                    {/* EVALUACIONES */}

                    <section
                        className="panel"
                        style={{
                            marginTop: '20px',
                        }}
                    >

                        <div className="panel-header">

                            <div>
                                <h2>
                                    Evaluaciones del cliente
                                </h2>

                                <p>
                                    Valoraciones registradas
                                    durante el seguimiento CRM.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    setEvaluationOpen(
                                        true,
                                    )
                                }
                            >
                                <Star size={17} />

                                Nueva evaluación
                            </button>

                        </div>


                        {evaluaciones.length ? (

                            <div
                                style={{
                                    display:
                                        'grid',

                                    gap: '14px',
                                }}
                            >

                                {evaluaciones.map(
                                    (evaluacion) => (
                                        <div
                                            key={
                                                evaluacion.id_evaluacion
                                            }
                                            style={{
                                                padding:
                                                    '18px',

                                                border:
                                                    '1px solid var(--border)',

                                                borderRadius:
                                                    '12px',

                                                background:
                                                    '#0e0e12',
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display:
                                                        'flex',

                                                    justifyContent:
                                                        'space-between',

                                                    gap:
                                                        '20px',

                                                    alignItems:
                                                        'center',
                                                }}
                                            >

                                                <strong
                                                    style={{
                                                        color:
                                                            '#ffd164',

                                                        fontSize:
                                                            '20px',

                                                        letterSpacing:
                                                            '2px',
                                                    }}
                                                >
                                                    {
                                                        estrellas(
                                                            evaluacion.puntuacion,
                                                        )
                                                    }
                                                </strong>

                                                <time
                                                    style={{
                                                        color:
                                                            'var(--muted)',

                                                        fontSize:
                                                            '13px',
                                                    }}
                                                >
                                                    {
                                                        formatearFecha(
                                                            evaluacion.fecha,
                                                        )
                                                    }
                                                </time>

                                            </div>


                                            <p
                                                style={{
                                                    margin:
                                                        '14px 0',
                                                }}
                                            >
                                                {
                                                    evaluacion.comentario ||
                                                    'Sin comentario.'
                                                }
                                            </p>


                                            <small
                                                style={{
                                                    color:
                                                        'var(--muted)',
                                                }}
                                            >
                                                Responsable:{' '}
                                                {
                                                    evaluacion.usuario_nombre ||
                                                    'Sin responsable'
                                                }
                                            </small>

                                        </div>
                                    ),
                                )}

                            </div>

                        ) : (

                            <EmptyState
                                text="Este cliente todavía no tiene evaluaciones."
                            />

                        )}

                    </section>

                </>
            )}


            {/* MODAL INTERACCIÓN */}

            <Modal
                open={interactionOpen}
                onClose={() =>
                    setInteractionOpen(false)
                }
                title="Registrar interacción"
            >

                <form
                    onSubmit={
                        guardarInteraccion
                    }
                    className="form-grid one-column"
                >

                    <label>

                        Tipo

                        <select
                            value={
                                interactionForm.tipo
                            }
                            onChange={(
                                event,
                            ) =>
                                setInteractionForm(
                                    {
                                        ...interactionForm,

                                        tipo:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                        >
                            {interactionTypes.map(
                                (type) => (
                                    <option
                                        key={
                                            type
                                        }
                                        value={
                                            type
                                        }
                                    >
                                        {type}
                                    </option>
                                ),
                            )}
                        </select>

                    </label>


                    <label>

                        Fecha

                        <input
                            type="datetime-local"
                            value={
                                interactionForm.fecha
                            }
                            onChange={(
                                event,
                            ) =>
                                setInteractionForm(
                                    {
                                        ...interactionForm,

                                        fecha:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                            required
                        />

                    </label>


                    <label>

                        Descripción

                        <textarea
                            rows="5"
                            value={
                                interactionForm.descripcion
                            }
                            onChange={(
                                event,
                            ) =>
                                setInteractionForm(
                                    {
                                        ...interactionForm,

                                        descripcion:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                            required
                        />

                    </label>


                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setInteractionOpen(
                                    false,
                                )
                            }
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Guardar interacción
                        </button>

                    </div>

                </form>

            </Modal>


            {/* MODAL EVALUACIÓN */}

            <Modal
                open={evaluationOpen}
                onClose={() =>
                    setEvaluationOpen(false)
                }
                title="Registrar evaluación"
            >

                <form
                    onSubmit={
                        guardarEvaluacion
                    }
                    className="form-grid one-column"
                >

                    <label>

                        Puntuación

                        <select
                            value={
                                evaluationForm.puntuacion
                            }
                            onChange={(
                                event,
                            ) =>
                                setEvaluationForm(
                                    {
                                        ...evaluationForm,

                                        puntuacion:
                                            Number(
                                                event
                                                    .target
                                                    .value,
                                            ),
                                    },
                                )
                            }
                        >
                            <option value={5}>
                                5 - Excelente
                            </option>

                            <option value={4}>
                                4 - Muy buena
                            </option>

                            <option value={3}>
                                3 - Buena
                            </option>

                            <option value={2}>
                                2 - Regular
                            </option>

                            <option value={1}>
                                1 - Mala
                            </option>
                        </select>

                    </label>


                    <label>

                        Comentario

                        <textarea
                            rows="5"
                            maxLength={1000}
                            value={
                                evaluationForm.comentario
                            }
                            onChange={(
                                event,
                            ) =>
                                setEvaluationForm(
                                    {
                                        ...evaluationForm,

                                        comentario:
                                            event
                                                .target
                                                .value,
                                    },
                                )
                            }
                            placeholder="Describe la evaluación o seguimiento del cliente..."
                        />

                    </label>


                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setEvaluationOpen(
                                    false,
                                )
                            }
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Guardar evaluación
                        </button>

                    </div>

                </form>

            </Modal>

        </MainLayout>
    );
}