import {
    ArrowLeft,
    CheckCircle2,
    Minus,
    Package,
    Plus,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Truck,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
    useParams,
} from 'react-router-dom';

import {
    useAuth,
} from '../../context/AuthContext';

import {
    useCart,
} from '../../context/CartContext';

import StoreHeader
    from '../../components/store/StoreHeader';

import {
    getPublicProduct,
} from '../../services/storeService';

import '../../styles/store.css';
export default function ProductoDetalle() {
    const { id } = useParams();
    const {
        user,
        isAuthenticated,
    } = useAuth();

    const {
        addItem,
    } = useCart();

    const [
        quantity,
        setQuantity,
    ] = useState(1);

    const [
        added,
        setAdded,
    ] = useState(false);

    const isClient =
        isAuthenticated &&
        user?.rol === 'CLIENTE';

    const [
        product,
        setProduct,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError('');

            try {
                const data =
                    await getPublicProduct(id);

                setProduct(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'No fue posible cargar el producto.',
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    if (loading) {
        return (
            <div className="store-page">
                <StoreHeader />

                <div className="product-detail-state">
                    Cargando producto...
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="store-page">
                <StoreHeader />

                <div className="product-detail-state">

                    <h2>
                        Producto no disponible
                    </h2>

                    <p>
                        {error}
                    </p>

                    <Link
                        to="/catalogo"
                        className="store-primary-button"
                    >
                        Volver al catálogo
                    </Link>

                </div>
            </div>
        );
    }

    const price =
        Number(
            product.precio_venta,
        ).toLocaleString(
            'es-MX',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            },
        );

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="product-detail-page">

                <Link
                    to="/catalogo"
                    className="product-back"
                >
                    <ArrowLeft size={17} />

                    Volver al catálogo
                </Link>

                <div className="product-detail-layout">

                    <section className="product-detail-image">

                        {product.imagen_url ? (
                            <img
                                src={
                                    product.imagen_url
                                }
                                alt={
                                    product.nombre
                                }
                            />
                        ) : (
                            <Package
                                size={110}
                            />
                        )}

                    </section>

                    <section className="product-detail-info">

                        <span className="product-detail-category">
                            {
                                product.categoria_nombre
                            }
                        </span>

                        <span className="product-detail-brand">
                            {
                                product.marca ||
                                'Negocios 2'
                            }
                        </span>

                        <h1>
                            {product.nombre}
                        </h1>

                        <span className="product-detail-sku">
                            SKU: {product.sku}
                        </span>

                        <p className="product-detail-description">
                            {
                                product.descripcion ||
                                'Accesorio automotriz disponible en nuestra tienda.'
                            }
                        </p>

                        <div className="product-detail-price">
                            ${price}
                        </div>

                        <div
                            className={
                                product.stock_actual > 0
                                    ? 'product-stock available'
                                    : 'product-stock unavailable'
                            }
                        >
                            <CheckCircle2
                                size={18}
                            />

                            {product.stock_actual > 0
                                ? `${product.stock_actual} unidades disponibles`
                                : 'Producto agotado'}
                        </div>

                        {product.stock_actual > 0 && (
                            <div className="product-purchase">

                                {isClient && (
                                    <div className="product-quantity-selector">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity(
                                                    Math.max(
                                                        1,
                                                        quantity - 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                quantity <= 1
                                            }
                                        >
                                            <Minus
                                                size={18}
                                            />
                                        </button>

                                        <span>
                                            {quantity}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity(
                                                    Math.min(
                                                        product.stock_actual,
                                                        quantity + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                quantity >=
                                                product.stock_actual
                                            }
                                        >
                                            <Plus
                                                size={18}
                                            />
                                        </button>

                                    </div>
                                )}

                                <div className="product-detail-actions">

                                    {isClient ? (
                                        <button
                                            type="button"
                                            className="store-primary-button"
                                            onClick={() => {
                                                addItem(
                                                    product,
                                                    quantity,
                                                );

                                                setAdded(
                                                    true,
                                                );

                                                setTimeout(
                                                    () =>
                                                        setAdded(
                                                            false,
                                                        ),
                                                    2500,
                                                );
                                            }}
                                        >
                                            <ShoppingCart
                                                size={18}
                                            />

                                            Agregar al carrito
                                        </button>
                                    ) : (
                                        <Link
                                            to="/login"
                                            className="store-primary-button"
                                        >
                                            <ShoppingBag
                                                size={18}
                                            />

                                            Iniciar sesión para comprar
                                        </Link>
                                    )}

                                    <Link
                                        to="/catalogo"
                                        className="store-secondary-button"
                                    >
                                        Seguir comprando
                                    </Link>

                                </div>

                                {added && (
                                    <div className="product-added-message">
                                        Producto agregado al carrito.
                                    </div>
                                )}

                            </div>
                        )}

                        <div className="product-benefits">

                            <div>
                                <Truck
                                    size={20}
                                />

                                <span>
                                    <strong>
                                        Disponibilidad real
                                    </strong>

                                    Inventario conectado al sistema SCM
                                </span>
                            </div>

                            <div>
                                <ShieldCheck
                                    size={20}
                                />

                                <span>
                                    <strong>
                                        Compra segura
                                    </strong>

                                    Acceso mediante cuenta registrada
                                </span>
                            </div>

                            <div>
                                <Package
                                    size={20}
                                />

                                <span>
                                    <strong>
                                        Stock actualizado
                                    </strong>

                                    Consulta en tiempo real
                                </span>
                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>
    );
}