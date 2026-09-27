import {
    useState,
} from 'react';

import {
    ArrowLeft,
    Banknote,
    CheckCircle2,
    CreditCard,
    MapPin,
    Package,
    ShoppingBag,
} from 'lucide-react';

import {
    Link,
} from 'react-router-dom';

import StoreHeader
    from '../../components/store/StoreHeader';

import {
    useAuth,
} from '../../context/AuthContext';

import {
    useCart,
} from '../../context/CartContext';

import {
    crearVenta,
} from '../../services/ventasService';

export default function Checkout() {
    const {
        user,
    } = useAuth();

    const {
        items,
        total,
        clearCart,
    } = useCart();

    const [
        form,
        setForm,
    ] = useState({
        nombre_recibe:
            user?.nombre || '',
        telefono: '',
        direccion: '',
        ciudad: '',
        codigo_postal: '',
        metodo_pago: 'efectivo',
    });

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    const [
        venta,
        setVenta,
    ] = useState(null);

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

    function handleChange(
        event,
    ) {
        const {
            name,
            value,
        } = event.target;

        setForm(
            current => ({
                ...current,
                [name]: value,
            }),
        );
    }

    async function handleSubmit(
        event,
    ) {
        event.preventDefault();

        if (!items.length) {
            setError(
                'Tu carrito está vacío.',
            );

            return;
        }

        try {
            setLoading(true);
            setError('');

            const result =
                await crearVenta({
                    metodo_pago:
                        form.metodo_pago,

                    nombre_recibe:
                        form.nombre_recibe,

                    telefono:
                        form.telefono,

                    direccion:
                        form.direccion,

                    ciudad:
                        form.ciudad,

                    codigo_postal:
                        form.codigo_postal,

                    items:
                        items.map(
                            item => ({
                                producto_id:
                                    item.id_producto,

                                cantidad:
                                    item.cantidad,
                            }),
                        ),
                });

            setVenta(
                result.venta,
            );

            clearCart();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible completar la compra.',
            );
        } finally {
            setLoading(false);
        }
    }

    if (venta) {
        return (
            <div className="store-page">

                <StoreHeader />

                <main className="checkout-success">

                    <div className="checkout-success-icon">
                        <CheckCircle2
                            size={42}
                        />
                    </div>

                    <span>
                        Compra confirmada
                    </span>

                    <h1>
                        Tu pedido fue registrado
                    </h1>

                    <p>
                        La venta se guardó correctamente
                        y el inventario fue actualizado.
                    </p>

                    <div className="checkout-success-data">

                        <div>
                            <span>
                                Número de venta
                            </span>

                            <strong>
                                #{venta.id_venta}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Estado
                            </span>

                            <strong>
                                {venta.estado}
                            </strong>
                        </div>

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

                        <div>
                            <span>
                                Método de pago
                            </span>

                            <strong>
                                {
                                    venta.metodo_pago
                                }
                            </strong>
                        </div>

                    </div>

                    <Link
                        to="/catalogo"
                        className="store-primary-button checkout-success-button"
                    >
                        Seguir comprando
                    </Link>

                </main>

            </div>
        );
    }

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="checkout-page">

                <div className="checkout-heading">

                    <div>

                        <Link
                            to="/catalogo"
                            className="checkout-back"
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Seguir comprando
                        </Link>

                        <span>
                            Finalizar compra
                        </span>

                        <h1>
                            Checkout
                        </h1>

                        <p>
                            Revisa tus productos
                            y completa los datos
                            para realizar tu pedido.
                        </p>

                    </div>

                    <div className="checkout-secure">
                        <ShoppingBag
                            size={19}
                        />

                        Compra segura
                    </div>

                </div>

                {!items.length ? (

                    <section className="checkout-empty">

                        <ShoppingBag
                            size={42}
                        />

                        <h2>
                            Tu carrito está vacío
                        </h2>

                        <p>
                            Agrega productos antes
                            de continuar con el pago.
                        </p>

                        <Link
                            to="/catalogo"
                            className="store-primary-button"
                        >
                            Ir al catálogo
                        </Link>

                    </section>

                ) : (

                    <form
                        className="checkout-layout"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="checkout-main">

                            {error && (
                                <div className="checkout-error">
                                    {error}
                                </div>
                            )}

                            <section className="checkout-card">

                                <div className="checkout-card-title">

                                    <MapPin
                                        size={21}
                                    />

                                    <div>
                                        <h2>
                                            Datos de entrega
                                        </h2>

                                        <p>
                                            Indica dónde
                                            y quién recibirá
                                            el pedido.
                                        </p>
                                    </div>

                                </div>

                                <div className="checkout-form-grid">

                                    <label>
                                        Nombre de quien recibe

                                        <input
                                            type="text"
                                            name="nombre_recibe"
                                            required
                                            maxLength="150"
                                            value={
                                                form.nombre_recibe
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </label>

                                    <label>
                                        Teléfono

                                        <input
                                            type="tel"
                                            name="telefono"
                                            required
                                            maxLength="30"
                                            value={
                                                form.telefono
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </label>

                                    <label className="checkout-full">
                                        Dirección

                                        <input
                                            type="text"
                                            name="direccion"
                                            required
                                            maxLength="300"
                                            placeholder="Calle, número, colonia"
                                            value={
                                                form.direccion
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </label>

                                    <label>
                                        Ciudad

                                        <input
                                            type="text"
                                            name="ciudad"
                                            required
                                            maxLength="100"
                                            value={
                                                form.ciudad
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </label>

                                    <label>
                                        Código postal

                                        <input
                                            type="text"
                                            name="codigo_postal"
                                            required
                                            maxLength="20"
                                            value={
                                                form.codigo_postal
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </label>

                                </div>

                            </section>

                            <section className="checkout-card">

                                <div className="checkout-card-title">

                                    <CreditCard
                                        size={21}
                                    />

                                    <div>
                                        <h2>
                                            Método de pago
                                        </h2>

                                        <p>
                                            Selecciona cómo
                                            deseas pagar.
                                        </p>
                                    </div>

                                </div>

                                <div className="checkout-payment-options">

                                    <label
                                        className={
                                            `checkout-payment ${form.metodo_pago ===
                                                'efectivo'
                                                ? 'active'
                                                : ''
                                            }`
                                        }
                                    >

                                        <input
                                            type="radio"
                                            name="metodo_pago"
                                            value="efectivo"
                                            checked={
                                                form.metodo_pago ===
                                                'efectivo'
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <Banknote
                                            size={25}
                                        />

                                        <div>
                                            <strong>
                                                Efectivo
                                            </strong>

                                            <span>
                                                Pago al recibir
                                            </span>
                                        </div>

                                    </label>

                                    <label
                                        className={
                                            `checkout-payment ${form.metodo_pago ===
                                                'tarjeta'
                                                ? 'active'
                                                : ''
                                            }`
                                        }
                                    >

                                        <input
                                            type="radio"
                                            name="metodo_pago"
                                            value="tarjeta"
                                            checked={
                                                form.metodo_pago ===
                                                'tarjeta'
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />

                                        <CreditCard
                                            size={25}
                                        />

                                        <div>
                                            <strong>
                                                Tarjeta
                                            </strong>

                                            <span>
                                                Pago con tarjeta
                                            </span>
                                        </div>

                                    </label>

                                </div>

                                {form.metodo_pago ===
                                    'tarjeta' && (
                                        <div className="checkout-card-notice">
                                            La opción de tarjeta
                                            registra el método de pago.
                                            La integración con una
                                            pasarela bancaria puede
                                            agregarse posteriormente.
                                        </div>
                                    )}

                            </section>

                        </div>

                        <aside className="checkout-summary">

                            <div className="checkout-summary-heading">

                                <Package
                                    size={21}
                                />

                                <div>
                                    <h2>
                                        Tu pedido
                                    </h2>

                                    <span>
                                        {
                                            items.reduce(
                                                (
                                                    sum,
                                                    item,
                                                ) =>
                                                    sum +
                                                    item.cantidad,
                                                0,
                                            )
                                        } productos
                                    </span>
                                </div>

                            </div>

                            <div className="checkout-items">

                                {items.map(
                                    item => (
                                        <article
                                            key={
                                                item.id_producto
                                            }
                                            className="checkout-item"
                                        >

                                            <div className="checkout-item-image">

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

                                            <div className="checkout-item-info">

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
                                                        item.precio_venta,
                                                    )}{' '}
                                                    c/u
                                                </small>

                                            </div>

                                            <strong className="checkout-item-total">
                                                {money(
                                                    item.precio_venta *
                                                    item.cantidad,
                                                )}
                                            </strong>

                                        </article>
                                    ),
                                )}

                            </div>

                            <div className="checkout-total">

                                <div>
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {money(
                                            total,
                                        )}
                                    </strong>
                                </div>

                                <div className="checkout-total-final">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {money(
                                            total,
                                        )}
                                    </strong>
                                </div>

                            </div>

                            <button
                                type="submit"
                                className="store-primary-button checkout-submit"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Procesando compra...'
                                    : `Confirmar compra · ${money(
                                        total,
                                    )}`}
                            </button>

                            <p className="checkout-summary-note">
                                El precio y stock final
                                serán verificados nuevamente
                                por el servidor.
                            </p>

                        </aside>

                    </form>

                )}

            </main>

        </div>
    );
}