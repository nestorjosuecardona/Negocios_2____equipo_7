import {
    ArrowRight,
    BadgeCheck,
    Package,
    ShoppingBag,
    UserCircle,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import {
    Link,
} from 'react-router-dom';

import {
    useAuth,
} from '../../context/AuthContext';

import StoreHeader
    from '../../components/store/StoreHeader';

import {
    getPublicProducts,
} from '../../services/storeService';

import '../../styles/store.css';

import {
    useCart,
} from '../../context/CartContext';

export default function InicioCliente() {
    const {
        user,
    } = useAuth();

    const {
        openCart,
    } = useCart();

    const [
        products,
        setProducts,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data =
                    await getPublicProducts();

                setProducts(
                    data.slice(
                        0,
                        4,
                    ),
                );
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="client-home">

                <section className="client-welcome">

                    <div className="client-welcome-content">

                        <span className="store-eyebrow">
                            <BadgeCheck
                                size={17}
                            />

                            Cuenta activa
                        </span>

                        <h1>
                            Bienvenido,
                            <span>
                                {' '}
                                {user?.nombre}
                            </span>
                        </h1>

                        <p>
                            Explora nuestro catálogo,
                            revisa productos disponibles
                            y administra tu experiencia
                            en Negocios 2.
                        </p>

                        <div className="client-welcome-actions">

                            <Link
                                to="/catalogo"
                                className="store-primary-button"
                            >
                                Explorar catálogo

                                <ArrowRight
                                    size={18}
                                />
                            </Link>

                        </div>

                    </div>

                    <div className="client-account-card">

                        <div className="client-avatar">
                            <UserCircle
                                size={46}
                            />
                        </div>

                        <span>
                            Mi cuenta
                        </span>

                        <strong>
                            {user?.nombre}
                        </strong>

                        <small>
                            {user?.correo}
                        </small>

                        <div className="client-account-role">
                            Cliente
                        </div>

                    </div>

                </section>

                <section className="client-shortcuts">

                    <Link
                        to="/catalogo"
                        className="client-shortcut-card"
                    >
                        <span>
                            <Package
                                size={25}
                            />
                        </span>

                        <div>
                            <strong>
                                Catálogo
                            </strong>

                            <small>
                                Explora todos nuestros productos
                            </small>
                        </div>

                        <ArrowRight
                            size={18}
                        />
                    </Link>

                    <button
                        type="button"
                        onClick={openCart}
                        className="client-shortcut-card client-shortcut-button"
                    >
                        <span>
                            <ShoppingBag
                                size={25}
                            />
                        </span>

                        <div>
                            <strong>
                                Mi carrito
                            </strong>

                            <small>
                                Revisa tus productos
                            </small>
                        </div>

                        <ArrowRight
                            size={18}
                        />
                    </button>

                    <Link
                        to="/cliente/pedidos"
                        className="client-shortcut-card"
                    >
                        <span>
                            <Package
                                size={25}
                            />
                        </span>

                        <div>
                            <strong>
                                Mis pedidos
                            </strong>

                            <small>
                                Consulta tus compras
                            </small>
                        </div>

                        <ArrowRight
                            size={18}
                        />
                    </Link>

                    <Link
                        to="/cliente/perfil"
                        className="client-shortcut-card"
                    >
                        <span>
                            <UserCircle
                                size={25}
                            />
                        </span>

                        <div>
                            <strong>
                                Mi perfil
                            </strong>

                            <small>
                                Administra tus datos
                            </small>
                        </div>

                        <ArrowRight
                            size={18}
                        />
                    </Link>

                </section>

                <section className="client-products">

                    <div className="client-section-heading">

                        <div>
                            <span className="store-section-label">
                                Para ti
                            </span>

                            <h2>
                                Productos disponibles
                            </h2>

                            <p>
                                Productos actualmente
                                disponibles en nuestra tienda.
                            </p>
                        </div>

                        <Link
                            to="/catalogo"
                            className="client-view-all"
                        >
                            Ver catálogo completo

                            <ArrowRight
                                size={16}
                            />
                        </Link>

                    </div>

                    {loading ? (

                        <div className="catalog-empty">
                            Cargando productos...
                        </div>

                    ) : products.length ? (

                        <div className="product-grid">

                            {products.map(
                                (
                                    product,
                                ) => (
                                    <article
                                        className="product-card"
                                        key={
                                            product.id_producto
                                        }
                                    >

                                        <div className="product-image">

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
                                                    size={
                                                        54
                                                    }
                                                />
                                            )}

                                            <span className="product-category">
                                                {
                                                    product.categoria_nombre
                                                }
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

                                            <div className="product-bottom">

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
                                                            },
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            product.stock_actual
                                                        }
                                                        {' '}
                                                        disponibles
                                                    </span>
                                                </div>

                                                <Link
                                                    to={`/producto/${product.id_producto}`}
                                                    className="product-detail-button"
                                                >
                                                    Ver producto
                                                </Link>

                                            </div>

                                        </div>

                                    </article>
                                ),
                            )}

                        </div>

                    ) : (

                        <div className="catalog-empty">
                            No hay productos disponibles.
                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}