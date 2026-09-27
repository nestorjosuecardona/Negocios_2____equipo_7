import {
    Search,
    ShoppingBag,
    ShoppingCart,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

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
    getPublicCategories,
    getPublicProducts,
} from '../../services/storeService';

import '../../styles/store.css';

export default function Catalogo() {
    const [
        products,
        setProducts,
    ] = useState([]);

    const [
        categories,
        setCategories,
    ] = useState([]);

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        category,
        setCategory,
    ] = useState('');

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    const [
        addedId,
        setAddedId,
    ] = useState(null);

    const [
        quantities,
        setQuantities,
    ] = useState({});

    const {
        user,
        isAuthenticated,
    } = useAuth();

    const {
        items,
        addItem,
    } = useCart();

    const isClient =
        isAuthenticated &&
        user?.rol === 'CLIENTE';

    useEffect(() => {
        getPublicCategories()
            .then(
                setCategories,
            )
            .catch(() => {
            });
    }, []);

    useEffect(() => {
        const timeout =
            setTimeout(
                async () => {
                    setLoading(true);
                    setError('');

                    try {
                        const data =
                            await getPublicProducts({
                                q: search,
                                categoria:
                                    category,
                            });

                        setProducts(data);
                    } catch (err) {
                        setError(
                            err.response?.data?.message ||
                            'No fue posible cargar el catálogo.',
                        );
                    } finally {
                        setLoading(false);
                    }
                },
                250,
            );

        return () =>
            clearTimeout(
                timeout,
            );
    }, [
        search,
        category,
    ]);

    function getCartQuantity(productId) {
        return (
            items.find(
                (item) =>
                    item.id_producto ===
                    productId,
            )?.cantidad || 0
        );
    }

    function getAvailableToAdd(product) {
        return Math.max(
            0,
            Number(product.stock_actual) -
                getCartQuantity(
                    product.id_producto,
                ),
        );
    }

    function getQuantity(product) {
        const available =
            getAvailableToAdd(product);

        if (available <= 0) {
            return 0;
        }

        const current =
            quantities[product.id_producto] || 1;

        return Math.min(
            Math.max(1, current),
            available,
        );
    }

    function changeQuantity(product, amount) {
        const available =
            getAvailableToAdd(product);

        if (available <= 0) {
            return;
        }

        const current =
            getQuantity(product);

        const next =
            Math.max(
                1,
                Math.min(
                    available,
                    current + amount,
                ),
            );

        setQuantities(
            (prev) => ({
                ...prev,
                [product.id_producto]:
                    next,
            }),
        );
    }

    function handleAdd(product) {
        const available =
            getAvailableToAdd(product);

        if (
            !isClient ||
            available <= 0
        ) {
            return;
        }

        const quantity =
            getQuantity(product);

        if (quantity <= 0) {
            return;
        }

        addItem(
            product,
            quantity,
        );

        setQuantities(
            (prev) => ({
                ...prev,
                [product.id_producto]: 1,
            }),
        );

        setAddedId(
            product.id_producto,
        );

        setTimeout(
            () => {
                setAddedId(null);
            },
            1800,
        );
    }

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="catalog-page">

                <div className="catalog-heading">

                    <span className="store-section-label">
                        Tienda
                    </span>

                    <h1>
                        Catálogo de productos
                    </h1>

                    <p>
                        Explora nuestros accesorios automotrices disponibles.
                    </p>

                </div>

                <div className="catalog-toolbar">

                    <div className="catalog-search">

                        <Search
                            size={19}
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={
                                (event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                            }
                            placeholder="Buscar por producto, marca o SKU"
                        />

                    </div>

                    <select
                        value={category}
                        onChange={
                            (event) =>
                                setCategory(
                                    event.target.value,
                                )
                        }
                    >
                        <option value="">
                            Todas las categorías
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={
                                        item.id_categoria
                                    }
                                    value={
                                        item.id_categoria
                                    }
                                >
                                    {item.nombre}
                                </option>
                            ),
                        )}

                    </select>

                </div>

                {error && (
                    <div className="store-error">
                        {error}
                    </div>
                )}

                {loading ? (

                    <div className="catalog-empty">
                        Cargando productos...
                    </div>

                ) : products.length ? (

                    <div className="product-grid">

                        {products.map(
                            (product) => {
                                const stock =
                                    Number(
                                        product.stock_actual,
                                    );

                                const hasStock =
                                    stock > 0;

                                const availableToAdd =
                                    isClient
                                        ? getAvailableToAdd(
                                            product,
                                        )
                                        : stock;

                                const selectedQuantity =
                                    isClient
                                        ? getQuantity(
                                            product,
                                        )
                                        : 1;

                                const canAddToCart =
                                    availableToAdd > 0;

                                return (
                                    <article
                                        className="product-card"
                                        key={
                                            product.id_producto
                                        }
                                    >

                                        <div className="catalog-product-media">

                                            {product.imagen_url ? (
                                                <img
                                                    className="catalog-product-image"
                                                    src={product.imagen_url}
                                                    alt={product.nombre}
                                                />
                                            ) : (
                                                <ShoppingBag
                                                    size={54}
                                                />
                                            )}

                                            <span className="product-category">
                                                {product.categoria_nombre}
                                            </span>

                                        </div>

                                        <div className="product-content">

                                            <small>
                                                {
                                                    product.marca ||
                                                    'Negocios 2'
                                                }
                                            </small>

                                            <h2>
                                                {
                                                    product.nombre
                                                }
                                            </h2>

                                            <p>
                                                {
                                                    product.descripcion ||
                                                    'Accesorio automotriz disponible.'
                                                }
                                            </p>

                                            <div className="product-price-row">

                                                <div>
                                                    <strong>
                                                        $
                                                        {Number(
                                                            product.precio_venta,
                                                        ).toLocaleString(
                                                            'es-MX',
                                                            {
                                                                minimumFractionDigits:
                                                                    2,
                                                                maximumFractionDigits:
                                                                    2,
                                                            },
                                                        )}
                                                    </strong>

                                                    <span
                                                        className={
                                                            hasStock && canAddToCart
                                                                ? 'product-stock-text'
                                                                : 'product-stock-text out'
                                                        }
                                                    >
                                                        {!hasStock
                                                            ? 'Agotado'
                                                            : isClient && !canAddToCart
                                                                ? 'Máximo agregado al carrito'
                                                                : `${product.stock_actual} disponibles`}
                                                    </span>
                                                </div>

                                            </div>

                                            <div className="catalog-purchase-area">

                                                {isClient && canAddToCart && (
                                                    <div className="catalog-quantity">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeQuantity(
                                                                    product,
                                                                    -1,
                                                                )
                                                            }
                                                            disabled={
                                                                selectedQuantity <= 1
                                                            }
                                                        >
                                                            −
                                                        </button>

                                                        <span>
                                                            {selectedQuantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                changeQuantity(
                                                                    product,
                                                                    1,
                                                                )
                                                            }
                                                            disabled={
                                                                selectedQuantity >=
                                                                availableToAdd
                                                            }
                                                        >
                                                            +
                                                        </button>

                                                    </div>
                                                )}

                                                <div className="product-card-actions">

                                                    {isClient ? (
                                                        <button
                                                            type="button"
                                                            className="product-add-button"
                                                            disabled={!canAddToCart}
                                                            onClick={() =>
                                                                handleAdd(
                                                                    product,
                                                                )
                                                            }
                                                        >
                                                            <ShoppingCart
                                                                size={17}
                                                            />

                                                            {addedId ===
                                                                product.id_producto
                                                                ? 'Agregado'
                                                                : !hasStock
                                                                    ? 'Agotado'
                                                                    : !canAddToCart
                                                                        ? 'Máximo en carrito'
                                                                        : 'Agregar al carrito'}
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            to="/login"
                                                            className="product-add-button"
                                                        >
                                                            <ShoppingCart
                                                                size={17}
                                                            />

                                                            Iniciar sesión
                                                        </Link>
                                                    )}

                                                    <Link
                                                        to={`/producto/${product.id_producto}`}
                                                        className="product-detail-button"
                                                    >
                                                        Ver producto
                                                    </Link>

                                                </div>

                                            </div>

                                        </div>

                                    </article>
                                );
                            },
                        )}

                    </div>

                ) : (

                    <div className="catalog-empty">
                        No encontramos productos con esos filtros.
                    </div>

                )}

            </main>

        </div>
    );
}