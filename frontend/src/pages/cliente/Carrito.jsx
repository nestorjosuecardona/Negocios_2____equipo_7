import {
    ArrowLeft,
    Minus,
    Package,
    Plus,
    ShoppingBag,
    Trash2,
} from 'lucide-react';

import {
    Link,
} from 'react-router-dom';

import StoreHeader
    from '../../components/store/StoreHeader';

import {
    useCart,
} from '../../context/CartContext';

import '../../styles/store.css';

export default function Carrito() {
    const {
        items,
        total,
        updateQuantity,
        removeItem,
        clearCart,
    } = useCart();

    const money = (
        value,
    ) =>
        Number(
            value,
        ).toLocaleString(
            'es-MX',
            {
                style: 'currency',
                currency: 'MXN',
            },
        );

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="cart-page">

                <Link
                    to="/catalogo"
                    className="product-back"
                >
                    <ArrowLeft
                        size={17}
                    />

                    Seguir comprando
                </Link>

                <div className="cart-heading">

                    <div>
                        <span className="store-section-label">
                            Tu compra
                        </span>

                        <h1>
                            Mi carrito
                        </h1>

                        <p>
                            Revisa los productos
                            antes de continuar.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            className="cart-clear"
                            onClick={
                                clearCart
                            }
                        >
                            <Trash2
                                size={17}
                            />

                            Vaciar carrito
                        </button>
                    )}

                </div>

                {!items.length ? (

                    <section className="cart-empty">

                        <div>
                            <ShoppingBag
                                size={48}
                            />
                        </div>

                        <h2>
                            Tu carrito está vacío
                        </h2>

                        <p>
                            Explora el catálogo y
                            agrega productos para
                            comenzar tu compra.
                        </p>

                        <Link
                            to="/catalogo"
                            className="store-primary-button"
                        >
                            Explorar catálogo
                        </Link>

                    </section>

                ) : (

                    <div className="cart-layout">

                        <section className="cart-items">

                            {items.map(
                                (
                                    item,
                                ) => (
                                    <article
                                        key={
                                            item.id_producto
                                        }
                                        className="cart-item"
                                    >

                                        <div className="cart-item-image">

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
                                                    size={
                                                        42
                                                    }
                                                />
                                            )}

                                        </div>

                                        <div className="cart-item-info">

                                            <span>
                                                {
                                                    item.marca
                                                }
                                            </span>

                                            <h2>
                                                {
                                                    item.nombre
                                                }
                                            </h2>

                                            <small>
                                                SKU: {
                                                    item.sku
                                                }
                                            </small>

                                            <strong>
                                                {money(
                                                    item.precio_venta,
                                                )}
                                            </strong>

                                        </div>

                                        <div className="cart-quantity">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id_producto,
                                                        item.cantidad -
                                                        1,
                                                    )
                                                }
                                                disabled={
                                                    item.cantidad <=
                                                    1
                                                }
                                            >
                                                <Minus
                                                    size={
                                                        17
                                                    }
                                                />
                                            </button>

                                            <span>
                                                {
                                                    item.cantidad
                                                }
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.id_producto,
                                                        item.cantidad +
                                                        1,
                                                    )
                                                }
                                                disabled={
                                                    item.cantidad >=
                                                    item.stock_actual
                                                }
                                            >
                                                <Plus
                                                    size={
                                                        17
                                                    }
                                                />
                                            </button>

                                        </div>

                                        <div className="cart-item-total">

                                            <small>
                                                Subtotal
                                            </small>

                                            <strong>
                                                {money(
                                                    item.precio_venta *
                                                    item.cantidad,
                                                )}
                                            </strong>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(
                                                        item.id_producto,
                                                    )
                                                }
                                            >
                                                <Trash2
                                                    size={
                                                        17
                                                    }
                                                />

                                                Eliminar
                                            </button>

                                        </div>

                                    </article>
                                ),
                            )}

                        </section>

                        <aside className="cart-summary">

                            <h2>
                                Resumen
                            </h2>

                            <div className="cart-summary-row">
                                <span>
                                    Productos
                                </span>

                                <strong>
                                    {items.reduce(
                                        (
                                            sum,
                                            item,
                                        ) =>
                                            sum +
                                            item.cantidad,
                                        0,
                                    )}
                                </strong>
                            </div>

                            <div className="cart-summary-row">
                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    {money(
                                        total,
                                    )}
                                </strong>
                            </div>

                            <div className="cart-summary-row">
                                <span>
                                    Envío
                                </span>

                                <strong>
                                    Se calcula después
                                </strong>
                            </div>

                            <div className="cart-summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    {money(
                                        total,
                                    )}
                                </strong>

                            </div>

                            <button
                                type="button"
                                className="store-primary-button cart-checkout-button"
                            >
                                Continuar al checkout
                            </button>

                            <small className="cart-summary-note">
                                El pago y la confirmación
                                se agregarán en el siguiente
                                paso.
                            </small>

                        </aside>

                    </div>

                )}

            </main>

        </div>
    );
}