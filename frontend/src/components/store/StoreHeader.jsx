import {
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    ShoppingBag,
    UserCircle,
    UserPlus,
    X,
} from 'lucide-react';

import {
    Link,
    NavLink,
    useNavigate,
} from 'react-router-dom';

import {
    useState,
} from 'react';

import {
    useAuth,
} from '../../context/AuthContext';

import {
    useCart,
} from '../../context/CartContext';
import CartDrawer from './CartDrawer';

export default function StoreHeader() {
    const [
        open,
        setOpen,
    ] = useState(false);

    const {
        count,
        openCart,
    } = useCart();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();

    const navigate =
        useNavigate();

    const isClient =
        isAuthenticated &&
        user?.rol === 'CLIENTE';

    const isAdmin =
        isAuthenticated &&
        (
            user?.rol === 'ADMIN' ||
            user?.rol === 'SUPER_ADMIN'
        );

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <header className="store-header">

            <div className="store-navbar">

                <Link
                    to="/"
                    className="store-brand"
                >
                    <span className="store-logo">
                        N2
                    </span>

                    <span>
                        <strong>
                            Negocios 2
                        </strong>

                        <small>
                            Accesorios automotrices
                        </small>
                    </span>
                </Link>

                <button
                    type="button"
                    className="store-menu-button"
                    onClick={() =>
                        setOpen(
                            !open,
                        )
                    }
                >
                    {open ? (
                        <X size={22} />
                    ) : (
                        <Menu size={22} />
                    )}
                </button>

                <nav
                    className={
                        `store-nav ${open
                            ? 'open'
                            : ''
                        }`
                    }
                >

                    <NavLink
                        to="/"
                        end
                    >
                        Inicio
                    </NavLink>

                    <NavLink
                        to="/catalogo"
                    >
                        Catálogo
                    </NavLink>

                    <a href="/#nosotros">
                        Nosotros
                    </a>

                    <a href="/#contacto">
                        Contacto
                    </a>

                </nav>

                <div className="store-actions">

                    {!isAuthenticated && (
                        <>
                            <Link
                                to="/login"
                                className="store-login"
                            >
                                <LogIn
                                    size={17}
                                />

                                Iniciar sesión
                            </Link>

                            <Link
                                to="/registro"
                                className="store-register"
                            >
                                <UserPlus
                                    size={17}
                                />

                                Crear cuenta
                            </Link>
                        </>
                    )}

                    {isClient && (
                        <Link
                            to="/cliente/inicio"
                            className="store-user-button"
                        >
                            <UserCircle
                                size={19}
                            />

                            <span>
                                {user?.nombre}
                            </span>
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            to="/dashboard"
                            className="store-user-button"
                        >
                            <LayoutDashboard
                                size={18}
                            />

                            Panel
                        </Link>
                    )}

                    {isAuthenticated && (
                        <button
                            type="button"
                            className="store-logout-button"
                            onClick={
                                handleLogout
                            }
                            title="Cerrar sesión"
                        >
                            <LogOut
                                size={19}
                            />
                        </button>
                    )}

                    {!isAdmin && (
                        isClient ? (
                            <button
                                type="button"
                                className="store-cart-button"
                                title="Carrito"
                                onClick={openCart}
                            >
                                <ShoppingBag
                                    size={19}
                                />

                                {count > 0 && (
                                    <span className="store-cart-count">
                                        {count}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="store-cart-button"
                                title="Carrito"
                            >
                                <ShoppingBag
                                    size={19}
                                />
                            </Link>
                        )
                    )}

                </div>

            </div>

            <CartDrawer />

        </header>
    );
}