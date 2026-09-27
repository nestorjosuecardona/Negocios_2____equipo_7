import {
    useEffect,
    useState,
} from 'react';

import {
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Clock3,
    CreditCard,
    Package,
    ReceiptText,
    ShoppingBag,
    Truck,
} from 'lucide-react';

import {
    Link,
} from 'react-router-dom';

import StoreHeader
    from '../../components/store/StoreHeader';

import {
    getMisVentas,
    getMiVenta,
} from '../../services/ventasService';

export default function MisPedidos() {
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
        expandedId,
        setExpandedId,
    ] = useState(null);

    const [
        detail,
        setDetail,
    ] = useState(null);

    const [
        loadingDetail,
        setLoadingDetail,
    ] = useState(false);

    useEffect(() => {
        loadSales();
    }, []);

    async function loadSales() {
        try {
            setLoading(true);
            setError('');

            const data =
                await getMisVentas();

            setVentas(
                Array.isArray(data)
                    ? data
                    : [],
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar tus pedidos.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function toggleDetail(
        id,
    ) {
        if (expandedId === id) {
            setExpandedId(null);
            setDetail(null);
            return;
        }

        try {
            setLoadingDetail(true);
            setExpandedId(id);
            setDetail(null);

            const data =
                await getMiVenta(id);

            setDetail(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar el detalle del pedido.',
            );

            setExpandedId(null);
        } finally {
            setLoadingDetail(false);
        }
    }

    function money(value) {
        return Number(
            value,
        ).toLocaleString(
            'es-MX',
            {
                style: 'currency',
                currency: 'MXN',
            },
        );
    }

    function date(value) {
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

    function statusLabel(
        status,
    ) {
        const labels = {
            pendiente: 'Pendiente',
            confirmado: 'Confirmado',
            preparando: 'Preparando',
            enviado: 'Enviado',
            entregado: 'Entregado',
            cancelado: 'Cancelado',
        };

        return (
            labels[status] ||
            status
        );
    }

    function paymentLabel(
        payment,
    ) {
        return payment ===
            'tarjeta'
            ? 'Tarjeta'
            : 'Efectivo';
    }

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="orders-page">

                <section className="orders-heading">

                    <div>
                        <span>
                            Historial de compras
                        </span>

                        <h1>
                            Mis pedidos
                        </h1>

                        <p>
                            Consulta tus compras,
                            productos, método de pago
                            y estado de cada pedido.
                        </p>
                    </div>

                    <div className="orders-heading-icon">
                        <ShoppingBag
                            size={25}
                        />
                    </div>

                </section>

                {loading && (
                    <div className="orders-message">
                        Cargando pedidos...
                    </div>
                )}

                {error && (
                    <div className="checkout-error">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    ventas.length === 0 && (

                        <section className="orders-empty">

                            <Package
                                size={42}
                            />

                            <h2>
                                Aún no tienes pedidos
                            </h2>

                            <p>
                                Cuando realices una compra,
                                aparecerá aquí.
                            </p>

                            <Link
                                to="/catalogo"
                                className="store-primary-button"
                            >
                                Ver catálogo
                            </Link>

                        </section>
                    )}

                {!loading &&
                    ventas.length > 0 && (

                        <div className="orders-list">

                            {ventas.map(
                                venta => (

                                    <article
                                        key={
                                            venta.id_venta
                                        }
                                        className="order-card"
                                    >

                                        <div className="order-card-top">

                                            <div className="order-number">

                                                <div>
                                                    <ReceiptText
                                                        size={20}
                                                    />
                                                </div>

                                                <div>
                                                    <span>
                                                        Pedido
                                                    </span>

                                                    <strong>
                                                        #
                                                        {
                                                            venta.id_venta
                                                        }
                                                    </strong>
                                                </div>

                                            </div>

                                            <span
                                                className={
                                                    `order-status order-status-${venta.estado}`
                                                }
                                            >
                                                {statusLabel(
                                                    venta.estado,
                                                )}
                                            </span>

                                        </div>

                                        <div className="order-card-data">

                                            <div>
                                                <CalendarDays
                                                    size={18}
                                                />

                                                <span>
                                                    Fecha
                                                </span>

                                                <strong>
                                                    {date(
                                                        venta.fecha,
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <Package
                                                    size={18}
                                                />

                                                <span>
                                                    Unidades
                                                </span>

                                                <strong>
                                                    {
                                                        venta.unidades
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <CreditCard
                                                    size={18}
                                                />

                                                <span>
                                                    Pago
                                                </span>

                                                <strong>
                                                    {paymentLabel(
                                                        venta.metodo_pago,
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <Truck
                                                    size={18}
                                                />

                                                <span>
                                                    Entrega
                                                </span>

                                                <strong>
                                                    {
                                                        venta.ciudad
                                                    }
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="order-card-footer">

                                            <div>
                                                <span>
                                                    Total
                                                </span>

                                                <strong>
                                                    {money(
                                                        venta.total,
                                                    )}
                                                </strong>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleDetail(
                                                        venta.id_venta,
                                                    )
                                                }
                                                className="order-detail-button"
                                            >
                                                {expandedId ===
                                                    venta.id_venta
                                                    ? 'Ocultar detalle'
                                                    : 'Ver detalle'}

                                                {expandedId ===
                                                    venta.id_venta ? (
                                                    <ChevronUp
                                                        size={17}
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        size={17}
                                                    />
                                                )}
                                            </button>

                                        </div>

                                        {expandedId ===
                                            venta.id_venta && (

                                                <div className="order-detail">

                                                    {loadingDetail && (
                                                        <div className="orders-message">
                                                            Cargando detalle...
                                                        </div>
                                                    )}

                                                    {!loadingDetail &&
                                                        detail && (

                                                            <>

                                                                <div className="order-detail-products">

                                                                    {detail.detalles?.map(
                                                                        item => (

                                                                            <div
                                                                                key={
                                                                                    item.id_detalle
                                                                                }
                                                                                className="order-product"
                                                                            >

                                                                                <div className="order-product-image">

                                                                                    {item.imagen_url ? (
                                                                                        <img
                                                                                            src={
                                                                                                item.imagen_url
                                                                                            }
                                                                                            alt={
                                                                                                item.nombre
                                                                                            }
                                                                                        />
                                                                                    ) : (
                                                                                        <Package
                                                                                            size={27}
                                                                                        />
                                                                                    )}

                                                                                </div>

                                                                                <div className="order-product-info">

                                                                                    <strong>
                                                                                        {
                                                                                            item.nombre
                                                                                        }
                                                                                    </strong>

                                                                                    <span>
                                                                                        Cantidad:{' '}
                                                                                        {
                                                                                            item.cantidad
                                                                                        }
                                                                                    </span>

                                                                                    <small>
                                                                                        {money(
                                                                                            item.precio_unitario,
                                                                                        )}{' '}
                                                                                        c/u
                                                                                    </small>

                                                                                </div>

                                                                                <strong className="order-product-total">
                                                                                    {money(
                                                                                        item.subtotal,
                                                                                    )}
                                                                                </strong>

                                                                            </div>

                                                                        ),
                                                                    )}

                                                                </div>

                                                                <div className="order-delivery">

                                                                    <div>
                                                                        <Clock3
                                                                            size={18}
                                                                        />

                                                                        <span>
                                                                            Estado actual
                                                                        </span>

                                                                        <strong>
                                                                            {statusLabel(
                                                                                detail.estado,
                                                                            )}
                                                                        </strong>
                                                                    </div>

                                                                    <div>
                                                                        <Truck
                                                                            size={18}
                                                                        />

                                                                        <span>
                                                                            Dirección de entrega
                                                                        </span>

                                                                        <strong>
                                                                            {
                                                                                detail.direccion
                                                                            }
                                                                            ,{' '}
                                                                            {
                                                                                detail.ciudad
                                                                            }
                                                                            ,{' '}
                                                                            {
                                                                                detail.codigo_postal
                                                                            }
                                                                        </strong>
                                                                    </div>

                                                                </div>

                                                            </>

                                                        )}

                                                </div>

                                            )}

                                    </article>

                                ),
                            )}

                        </div>
                    )}

            </main>

        </div>
    );
}