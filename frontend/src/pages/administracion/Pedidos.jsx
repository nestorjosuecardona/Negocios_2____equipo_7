import {
    CheckCircle2,
    Clock3,
    Eye,
    PackageCheck,
    RefreshCw,
    ShoppingBag,
    Truck,
} from 'lucide-react';

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import MainLayout
    from '../../components/MainLayout';

import {
    actualizarEstadoVenta,
    getAdminVenta,
    getAdminVentas,
} from '../../services/adminVentasService';

const nextStatus = {
    pendiente: {
        estado: 'confirmado',
        texto: 'Confirmar',
    },
    confirmado: {
        estado: 'preparando',
        texto: 'Preparar',
    },
    preparando: {
        estado: 'enviado',
        texto: 'Marcar enviado',
    },
    enviado: {
        estado: 'entregado',
        texto: 'Marcar entregado',
    },
};

function formatMoney(
    value,
) {
    return new Intl.NumberFormat(
        'es-MX',
        {
            style: 'currency',
            currency: 'MXN',
        },
    ).format(
        Number(value) || 0,
    );
}

function formatDate(
    value,
) {
    if (!value) {
        return 'Sin fecha';
    }

    return new Date(
        value,
    ).toLocaleString(
        'es-MX',
        {
            dateStyle: 'medium',
            timeStyle: 'short',
        },
    );
}

function statusName(
    estado,
) {
    const names = {
        pendiente:
            'Pendiente',
        confirmado:
            'Confirmado',
        preparando:
            'Preparando',
        enviado:
            'Enviado',
        entregado:
            'Entregado',
        cancelado:
            'Cancelado',
    };

    return names[estado] ||
        estado;
}

export default function Pedidos() {
    const [
        ventas,
        setVentas,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    const [
        success,
        setSuccess,
    ] = useState('');

    const [
        selected,
        setSelected,
    ] = useState(null);

    const [
        loadingDetail,
        setLoadingDetail,
    ] = useState(false);

    const [
        changingId,
        setChangingId,
    ] = useState(null);

    const [
        filter,
        setFilter,
    ] = useState('todos');

    useEffect(() => {
        loadSales();
    }, []);

    async function loadSales() {
        try {
            setLoading(true);
            setError('');

            const data =
                await getAdminVentas();

            setVentas(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los pedidos.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function showDetail(
        id,
    ) {
        try {
            setLoadingDetail(true);
            setError('');

            const data =
                await getAdminVenta(
                    id,
                );

            setSelected(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar el pedido.',
            );
        } finally {
            setLoadingDetail(false);
        }
    }

    async function changeStatus(
        venta,
    ) {
        const transition =
            nextStatus[
            venta.estado
            ];

        if (!transition) {
            return;
        }

        try {
            setChangingId(
                venta.id_venta,
            );

            setError('');
            setSuccess('');

            const updated =
                await actualizarEstadoVenta(
                    venta.id_venta,
                    transition.estado,
                );

            setVentas(
                current =>
                    current.map(
                        item =>
                            item.id_venta ===
                                venta.id_venta
                                ? {
                                    ...item,
                                    estado:
                                        updated.estado,
                                }
                                : item,
                    ),
            );

            if (
                selected?.id_venta ===
                venta.id_venta
            ) {
                setSelected(
                    updated,
                );
            }

            setSuccess(
                `Pedido #${venta.id_venta} actualizado a ${statusName(updated.estado)}.`,
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible actualizar el pedido.',
            );
        } finally {
            setChangingId(null);
        }
    }

    const filteredSales =
        useMemo(
            () => {
                if (
                    filter ===
                    'todos'
                ) {
                    return ventas;
                }

                return ventas.filter(
                    venta =>
                        venta.estado ===
                        filter,
                );
            },
            [
                ventas,
                filter,
            ],
        );

    const pending =
        ventas.filter(
            venta =>
                venta.estado ===
                'pendiente',
        ).length;

    const active =
        ventas.filter(
            venta =>
                [
                    'confirmado',
                    'preparando',
                    'enviado',
                ].includes(
                    venta.estado,
                ),
        ).length;

    const delivered =
        ventas.filter(
            venta =>
                venta.estado ===
                'entregado',
        ).length;

    return (
        <MainLayout>

            <div className="users-page">

                <div className="page-heading">

                    <div>
                        <h1>
                            Pedidos de clientes
                        </h1>

                        <p>
                            Consulta y administra
                            las ventas realizadas
                            desde la tienda.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={
                            loadSales
                        }
                    >
                        <RefreshCw
                            size={17}
                        />

                        Actualizar
                    </button>

                </div>

                <div className="users-summary">

                    <div className="summary-card">

                        <ShoppingBag
                            size={22}
                        />

                        <div>
                            <span>
                                Total pedidos
                            </span>

                            <strong>
                                {ventas.length}
                            </strong>
                        </div>

                    </div>

                    <div className="summary-card">

                        <Clock3
                            size={22}
                        />

                        <div>
                            <span>
                                Pendientes
                            </span>

                            <strong>
                                {pending}
                            </strong>
                        </div>

                    </div>

                    <div className="summary-card">

                        <Truck
                            size={22}
                        />

                        <div>
                            <span>
                                En proceso
                            </span>

                            <strong>
                                {active}
                            </strong>
                        </div>

                    </div>

                    <div className="summary-card">

                        <CheckCircle2
                            size={22}
                        />

                        <div>
                            <span>
                                Entregados
                            </span>

                            <strong>
                                {delivered}
                            </strong>
                        </div>

                    </div>

                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <div className="table-card">

                    <div className="table-header">

                        <div>
                            <h2>
                                Ventas registradas
                            </h2>

                            <p>
                                Pedidos realizados
                                por los clientes.
                            </p>
                        </div>

                        <select
                            value={filter}
                            onChange={
                                event =>
                                    setFilter(
                                        event.target.value,
                                    )
                            }
                            className="form-control"
                        >
                            <option value="todos">
                                Todos
                            </option>

                            <option value="pendiente">
                                Pendientes
                            </option>

                            <option value="confirmado">
                                Confirmados
                            </option>

                            <option value="preparando">
                                Preparando
                            </option>

                            <option value="enviado">
                                Enviados
                            </option>

                            <option value="entregado">
                                Entregados
                            </option>
                        </select>

                    </div>

                    {loading ? (
                        <div className="users-message">
                            Cargando pedidos...
                        </div>
                    ) : (
                        <div className="table-responsive">

                            <table className="users-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Pedido
                                        </th>

                                        <th>
                                            Cliente
                                        </th>

                                        <th>
                                            Fecha
                                        </th>

                                        <th>
                                            Estado
                                        </th>

                                        <th>
                                            Unidades
                                        </th>

                                        <th>
                                            Pago
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filteredSales.map(
                                        venta => (
                                            <tr
                                                key={
                                                    venta.id_venta
                                                }
                                            >
                                                <td>
                                                    <strong>
                                                        #
                                                        {
                                                            venta.id_venta
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            venta.cliente_nombre ||
                                                            venta.nombre_recibe
                                                        }
                                                    </strong>

                                                    <div>
                                                        {
                                                            venta.cliente_correo ||
                                                            ''
                                                        }
                                                    </div>
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            venta.fecha,
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge status-${venta.estado}`}
                                                    >
                                                        {
                                                            statusName(
                                                                venta.estado,
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        venta.unidades
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        venta.metodo_pago
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            formatMoney(
                                                                venta.total,
                                                            )
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div
                                                        style={{
                                                            display:
                                                                'flex',
                                                            gap:
                                                                '8px',
                                                            flexWrap:
                                                                'wrap',
                                                        }}
                                                    >

                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            onClick={
                                                                () =>
                                                                    showDetail(
                                                                        venta.id_venta,
                                                                    )
                                                            }
                                                        >
                                                            <Eye
                                                                size={16}
                                                            />

                                                            Ver
                                                        </button>

                                                        {nextStatus[
                                                            venta.estado
                                                        ] && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-primary"
                                                                    disabled={
                                                                        changingId ===
                                                                        venta.id_venta
                                                                    }
                                                                    onClick={
                                                                        () =>
                                                                            changeStatus(
                                                                                venta,
                                                                            )
                                                                    }
                                                                >
                                                                    <PackageCheck
                                                                        size={16}
                                                                    />

                                                                    {
                                                                        changingId ===
                                                                            venta.id_venta
                                                                            ? 'Actualizando...'
                                                                            : nextStatus[
                                                                                venta.estado
                                                                            ].texto
                                                                    }
                                                                </button>
                                                            )}

                                                    </div>
                                                </td>
                                            </tr>
                                        ),
                                    )}

                                    {filteredSales.length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    style={{
                                                        textAlign:
                                                            'center',
                                                        padding:
                                                            '30px',
                                                    }}
                                                >
                                                    No hay pedidos
                                                    en este estado.
                                                </td>
                                            </tr>
                                        )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

                {loadingDetail && (
                    <div className="users-message">
                        Cargando detalle...
                    </div>
                )}

                {selected && (
                    <div
                        className="table-card"
                        style={{
                            marginTop:
                                '20px',
                        }}
                    >

                        <div className="table-header">

                            <div>
                                <h2>
                                    Pedido #
                                    {
                                        selected.id_venta
                                    }
                                </h2>

                                <p>
                                    {
                                        selected.nombre_recibe
                                    }
                                    {' · '}
                                    {
                                        selected.telefono
                                    }
                                </p>
                            </div>

                            <span
                                className={`badge status-${selected.estado}`}
                            >
                                {
                                    statusName(
                                        selected.estado,
                                    )
                                }
                            </span>

                        </div>

                        <div
                            style={{
                                padding:
                                    '0 20px 20px',
                            }}
                        >
                            <p>
                                <strong>
                                    Entrega:
                                </strong>
                                {' '}
                                {
                                    selected.direccion
                                },
                                {' '}
                                {
                                    selected.ciudad
                                }
                                {' '}
                                {
                                    selected.codigo_postal
                                }
                            </p>

                            <p>
                                <strong>
                                    Método de pago:
                                </strong>
                                {' '}
                                {
                                    selected.metodo_pago
                                }
                            </p>
                        </div>

                        <div className="table-responsive">

                            <table className="users-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Producto
                                        </th>

                                        <th>
                                            SKU
                                        </th>

                                        <th>
                                            Cantidad
                                        </th>

                                        <th>
                                            Precio
                                        </th>

                                        <th>
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {selected.detalles?.map(
                                        detalle => (
                                            <tr
                                                key={
                                                    detalle.id_detalle
                                                }
                                            >
                                                <td>
                                                    {
                                                        detalle.nombre
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        detalle.sku
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        detalle.cantidad
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatMoney(
                                                            detalle.precio_unitario,
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            formatMoney(
                                                                detalle.subtotal,
                                                            )
                                                        }
                                                    </strong>
                                                </td>
                                            </tr>
                                        ),
                                    )}

                                </tbody>

                            </table>

                        </div>

                        <div
                            style={{
                                padding:
                                    '20px',
                                textAlign:
                                    'right',
                            }}
                        >
                            <strong
                                style={{
                                    fontSize:
                                        '20px',
                                }}
                            >
                                Total:{' '}
                                {
                                    formatMoney(
                                        selected.total,
                                    )
                                }
                            </strong>
                        </div>

                    </div>
                )}

            </div>

        </MainLayout>
    );
}