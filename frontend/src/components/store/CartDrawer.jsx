import {
    Minus,
    Package,
    Plus,
    ShoppingBag,
    Trash2,
    X,
} from 'lucide-react';

import {
    useEffect,
} from 'react';

import {
    useCart,
} from '../../context/CartContext';
import {
    useNavigate,
} from 'react-router-dom';

export default function CartDrawer() {
    const navigate = useNavigate();
    const {
        items,
        count,
        total,
        isOpen,
        closeCart,
        updateQuantity,
        removeItem,
    } = useCart();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            'hidden';

        function handleEscape(event) {
            if (
                event.key ===
                'Escape'
            ) {
                closeCart();
            }
        }

        window.addEventListener(
            'keydown',
            handleEscape,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            window.removeEventListener(
                'keydown',
                handleEscape,
            );
        };
    }, [isOpen]);

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

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={
                `cart-drawer-overlay ${isOpen
                    ? 'open'
                    : ''
                }`
            }
            onMouseDown={
                event => {
                    if (
                        event.target ===
                        event.currentTarget
                    ) {
                        closeCart();
                    }
                }
            }
        >

            <aside className="cart-drawer open">

                <div className="cart-drawer-header">

                    <div>

                        <span>
                            Tu compra
                        </span>

                        <h2>
                            Mi carrito
                        </h2>

                        <small>
                            {count}{' '}
                            {count === 1
                                ? 'producto'
                                : 'productos'}
                        </small>

                    </div>

                    <button
                        type="button"
                        onClick={closeCart}
                        className="cart-drawer-close"
                        title="Cerrar carrito"
                    >
                        <X
                            size={22}
                        />
                    </button>

                </div>

                {!items.length ? (

                    <div className="cart-drawer-empty">

                        <div>
                            <ShoppingBag
                                size={38}
                            />
                        </div>

                        <h3>
                            Tu carrito está vacío
                        </h3>

                        <p>
                            Agrega productos desde
                            nuestro catálogo para
                            comenzar tu compra.
                        </p>

                        <button
                            type="button"
                            className="store-primary-button"
                            onClick={closeCart}
                        >
                            Seguir comprando
                        </button>

                    </div>

                ) : (

                    <>

                        <div className="cart-drawer-items">

                            {items.map(
                                item => (
                                    <article
                                        key={
                                            item.id_producto
                                        }
                                        className="cart-drawer-item"
                                    >

                                        <div className="cart-drawer-image">

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
                                                    size={30}
                                                />
                                            )}

                                        </div>

                                        <div className="cart-drawer-info">

                                            <span>
                                                {
                                                    item.marca ||
                                                    'Negocios 2'
                                                }
                                            </span>

                                            <h3>
                                                {
                                                    item.nombre
                                                }
                                            </h3>

                                            <strong>
                                                {money(
                                                    item.precio_venta,
                                                )}
                                            </strong>

                                            <div className="cart-drawer-item-bottom">

                                                <div className="cart-drawer-quantity">

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            item.cantidad <=
                                                            1
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id_producto,
                                                                item.cantidad -
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <Minus
                                                            size={15}
                                                        />
                                                    </button>

                                                    <span>
                                                        {
                                                            item.cantidad
                                                        }
                                                    </span>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            item.cantidad >=
                                                            item.stock_actual
                                                        }
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id_producto,
                                                                item.cantidad +
                                                                1,
                                                            )
                                                        }
                                                    >
                                                        <Plus
                                                            size={15}
                                                        />
                                                    </button>

                                                </div>

                                                <button
                                                    type="button"
                                                    className="cart-drawer-remove"
                                                    onClick={() =>
                                                        removeItem(
                                                            item.id_producto,
                                                        )
                                                    }
                                                    title="Eliminar producto"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                        <div className="cart-drawer-subtotal">

                                            {money(
                                                item.precio_venta *
                                                item.cantidad,
                                            )}

                                        </div>

                                    </article>
                                ),
                            )}

                        </div>

                        <div className="cart-drawer-footer">

                            <div className="cart-drawer-total">

                                <div>
                                    <span>
                                        Total
                                    </span>

                                    <small>
                                        Impuestos y envío
                                        se calculan después
                                    </small>
                                </div>

                                <strong>
                                    {money(
                                        total,
                                    )}
                                </strong>

                            </div>

                                <button
                                    type="button"
                                    className="store-primary-button cart-drawer-continue"
                                    onClick={() => {
                                        closeCart();

                                        navigate(
                                            '/cliente/checkout',
                                        );
                                    }}
                                >
                                    Finalizar compra
                                </button>

                        </div>

                    </>

                )}

            </aside>

        </div>
    );
}