import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

const CartContext =
    createContext(null);

function getCartKey() {
    try {
        const storedUser =
            localStorage.getItem(
                'n2_user',
            );

        if (!storedUser) {
            return null;
        }

        const user =
            JSON.parse(
                storedUser,
            );

        const userId =
            user?.id ??
            user?.id_usuario;

        if (
            !userId ||
            user?.rol !== 'CLIENTE'
        ) {
            return null;
        }

        return `n2_cart_${userId}`;
    } catch {
        return null;
    }
}

function readCart(key) {
    if (!key) {
        return [];
    }

    try {
        return JSON.parse(
            localStorage.getItem(
                key,
            ) || '[]',
        );
    } catch {
        return [];
    }
}

export function CartProvider({
    children,
}) {
    const [
        cartKey,
        setCartKey,
    ] = useState(
        () => getCartKey(),
    );

    const [
        items,
        setItems,
    ] = useState(
        () =>
            readCart(
                getCartKey(),
            ),
    );

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);

    useEffect(() => {
        if (!cartKey) {
            return;
        }

        localStorage.setItem(
            cartKey,
            JSON.stringify(
                items,
            ),
        );
    }, [
        items,
        cartKey,
    ]);

    useEffect(() => {
        function handleSessionChanged() {
            const nextKey =
                getCartKey();

            setCartKey(
                nextKey,
            );

            setItems(
                readCart(
                    nextKey,
                ),
            );

            setIsOpen(false);
        }

        window.addEventListener(
            'n2:session-changed',
            handleSessionChanged,
        );

        return () => {
            window.removeEventListener(
                'n2:session-changed',
                handleSessionChanged,
            );
        };
    }, []);

    function openCart() {
        setIsOpen(true);
    }

    function closeCart() {
        setIsOpen(false);
    }

    function toggleCart() {
        setIsOpen(
            current => !current,
        );
    }

    function addItem(
        product,
        quantity = 1,
    ) {
        if (!cartKey) {
            return;
        }

        const qty =
            Math.max(
                1,
                Number(quantity) || 1,
            );

        setItems(
            current => {
                const existing =
                    current.find(
                        item =>
                            item.id_producto ===
                            product.id_producto,
                    );

                if (existing) {
                    return current.map(
                        item => {
                            if (
                                item.id_producto !==
                                product.id_producto
                            ) {
                                return item;
                            }

                            const nextQuantity =
                                Math.min(
                                    item.cantidad +
                                    qty,
                                    Number(
                                        product.stock_actual,
                                    ),
                                );

                            return {
                                ...item,
                                cantidad:
                                    nextQuantity,
                                stock_actual:
                                    Number(
                                        product.stock_actual,
                                    ),
                            };
                        },
                    );
                }

                return [
                    ...current,
                    {
                        id_producto:
                            product.id_producto,
                        sku:
                            product.sku,
                        nombre:
                            product.nombre,
                        marca:
                            product.marca,
                        imagen_url:
                            product.imagen_url,
                        precio_venta:
                            Number(
                                product.precio_venta,
                            ),
                        stock_actual:
                            Number(
                                product.stock_actual,
                            ),
                        cantidad:
                            Math.min(
                                qty,
                                Number(
                                    product.stock_actual,
                                ),
                            ),
                    },
                ];
            },
        );
    }

    function updateQuantity(
        id,
        quantity,
    ) {
        setItems(
            current =>
                current.map(
                    item => {
                        if (
                            item.id_producto !==
                            id
                        ) {
                            return item;
                        }

                        const nextQuantity =
                            Math.max(
                                1,
                                Math.min(
                                    Number(
                                        quantity,
                                    ),
                                    Number(
                                        item.stock_actual,
                                    ),
                                ),
                            );

                        return {
                            ...item,
                            cantidad:
                                nextQuantity,
                        };
                    },
                ),
        );
    }

    function removeItem(id) {
        setItems(
            current =>
                current.filter(
                    item =>
                        item.id_producto !==
                        id,
                ),
        );
    }

    function clearCart() {
        setItems([]);
    }

    const count =
        items.reduce(
            (
                total,
                item,
            ) =>
                total +
                item.cantidad,
            0,
        );

    const total =
        items.reduce(
            (
                sum,
                item,
            ) =>
                sum +
                Number(
                    item.precio_venta,
                ) *
                item.cantidad,
            0,
        );

    const value =
        useMemo(
            () => ({
                items,
                count,
                total,
                isOpen,
                openCart,
                closeCart,
                toggleCart,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
            }),
            [
                items,
                count,
                total,
                isOpen,
            ],
        );

    return (
        <CartContext.Provider
            value={value}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(
        CartContext,
    );
}