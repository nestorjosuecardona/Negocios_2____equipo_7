import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Boxes,
    History,
    PackagePlus,
    Search,
} from 'lucide-react';

import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import StatCard from '../../components/StatCard';

import {
    crearMovimientoInventario,
    getInventario,
    getMovimientosInventario,
} from '../../services/scmService';

import '../../styles/scm.css';

const emptyMovement = {
    producto_id: '',
    tipo: 'entrada',
    cantidad: 1,
    motivo: 'reposición',
    descripcion: '',
};

export default function Inventario() {
    const [items, setItems] =
        useState([]);

    const [
        movements,
        setMovements,
    ] = useState([]);

    const [search, setSearch] =
        useState('');

    const [
        stockFilter,
        setStockFilter,
    ] = useState('');

    const [
        movementProductFilter,
        setMovementProductFilter,
    ] = useState('');

    const [
        movementTypeFilter,
        setMovementTypeFilter,
    ] = useState('');

    const [open, setOpen] =
        useState(false);

    const [form, setForm] =
        useState(emptyMovement);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [
        pageError,
        setPageError,
    ] = useState('');

    const [
        modalError,
        setModalError,
    ] = useState('');

    async function loadInventory() {
        setLoading(true);
        setPageError('');

        try {
            const data =
                await getInventario({
                    q: search,
                    estadoStock:
                        stockFilter,
                });

            setItems(data);
        } catch (err) {
            setPageError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar el inventario.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadMovements() {
        try {
            const data =
                await getMovimientosInventario({
                    producto_id:
                        movementProductFilter,

                    tipo:
                        movementTypeFilter,
                });

            setMovements(data);
        } catch (err) {
            setPageError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar los movimientos.',
            );
        }
    }

    useEffect(() => {
        const timeout =
            setTimeout(
                () => {
                    loadInventory();
                },
                250,
            );

        return () =>
            clearTimeout(timeout);
    }, [
        search,
        stockFilter,
    ]);

    useEffect(() => {
        loadMovements();
    }, [
        movementProductFilter,
        movementTypeFilter,
    ]);

    const totals =
        useMemo(
            () => ({
                productos:
                    items.length,

                unidades:
                    items.reduce(
                        (
                            total,
                            item,
                        ) =>
                            total +
                            Number(
                                item.stock_actual ||
                                0,
                            ),
                        0,
                    ),

                stockBajo:
                    items.filter(
                        (item) =>
                            Boolean(
                                item.stock_bajo,
                            ),
                    ).length,
            }),
            [items],
        );

    const selectedProduct =
        useMemo(
            () =>
                items.find(
                    (item) =>
                        String(
                            item.id_producto,
                        ) ===
                        String(
                            form.producto_id,
                        ),
                ) || null,
            [
                items,
                form.producto_id,
            ],
        );

    const quantity =
        Number(
            form.cantidad ||
            0,
        );

    const currentStock =
        Number(
            selectedProduct
                ?.stock_actual ||
            0,
        );

    const minimumStock =
        Number(
            selectedProduct
                ?.stock_minimo ||
            0,
        );

    const projectedStock =
        selectedProduct
            ? form.tipo ===
                'entrada'
                ? currentStock +
                quantity
                : currentStock -
                quantity
            : 0;

    const insufficientStock =
        Boolean(
            selectedProduct &&
            form.tipo ===
            'salida' &&
            quantity >
            currentStock,
        );

    const projectedLowStock =
        Boolean(
            selectedProduct &&
            projectedStock <=
            minimumStock,
        );

    function openMovement(
        product = null,
    ) {
        setForm({
            ...emptyMovement,

            producto_id:
                product
                    ? String(
                        product.id_producto,
                    )
                    : '',
        });

        setModalError('');
        setOpen(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setOpen(false);
        setModalError('');
        setForm(
            emptyMovement,
        );
    }

    function updateField(
        event,
    ) {
        const {
            name,
            value,
        } = event.target;

        setModalError('');

        setForm(
            (current) => {
                const next = {
                    ...current,
                    [name]:
                        value,
                };

                if (
                    name ===
                    'tipo'
                ) {
                    next.motivo =
                        value ===
                            'entrada'
                            ? 'reposición'
                            : 'venta';
                }

                return next;
            },
        );
    }

    async function saveMovement(
        event,
    ) {
        event.preventDefault();

        setModalError('');

        if (!selectedProduct) {
            setModalError(
                'Debes seleccionar un producto.',
            );

            return;
        }

        if (
            !Number.isInteger(
                quantity,
            ) ||
            quantity <= 0
        ) {
            setModalError(
                'La cantidad debe ser mayor a cero.',
            );

            return;
        }

        if (insufficientStock) {
            setModalError(
                `No hay stock suficiente. Disponible: ${currentStock}. Solicitado: ${quantity}.`,
            );

            return;
        }

        setSaving(true);

        try {
            await crearMovimientoInventario({
                producto_id:
                    Number(
                        form.producto_id,
                    ),

                tipo:
                    form.tipo,

                cantidad:
                    quantity,

                motivo:
                    form.motivo,

                descripcion:
                    form.descripcion,
            });

            setOpen(false);
            setModalError('');
            setForm(
                emptyMovement,
            );

            await Promise.all([
                loadInventory(),
                loadMovements(),
            ]);
        } catch (err) {
            setModalError(
                err.response?.data
                    ?.message ||
                'No fue posible registrar el movimiento.',
            );
        } finally {
            setSaving(false);
        }
    }

    function formatDate(
        value,
    ) {
        return new Date(
            value,
        ).toLocaleString(
            'es-MX',
        );
    }

    return (
        <MainLayout>

            <PageHeader
                title="Inventario"
                subtitle="Control de existencias y trazabilidad de movimientos."
                actions={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() =>
                            openMovement()
                        }
                    >
                        <PackagePlus
                            size={17}
                        />

                        Nuevo movimiento
                    </button>
                }
            />

            {pageError && (
                <div className="alert alert-error">
                    {pageError}
                </div>
            )}

            <div className="stats-grid">

                <StatCard
                    label="Productos"
                    value={
                        totals.productos
                    }
                    icon={Boxes}
                />

                <StatCard
                    label="Unidades en stock"
                    value={
                        totals.unidades
                    }
                    icon={
                        PackagePlus
                    }
                />

                <StatCard
                    label="Productos con stock bajo"
                    value={
                        totals.stockBajo
                    }
                    icon={
                        AlertTriangle
                    }
                />

            </div>

            <div className="inventory-toolbar">

                <div className="scm-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="search"
                        placeholder="Buscar producto, SKU o marca"
                        value={
                            search
                        }
                        onChange={(
                            event,
                        ) =>
                            setSearch(
                                event
                                    .target
                                    .value,
                            )
                        }
                    />

                </div>

                <select
                    value={
                        stockFilter
                    }
                    onChange={(
                        event,
                    ) =>
                        setStockFilter(
                            event
                                .target
                                .value,
                        )
                    }
                >
                    <option value="">
                        Todo el inventario
                    </option>

                    <option value="bajo">
                        Stock bajo
                    </option>

                    <option value="normal">
                        Stock normal
                    </option>
                </select>

            </div>

            <div className="table-card inventory-card">

                {loading ? (

                    <div className="empty-state">
                        Cargando inventario...
                    </div>

                ) : items.length ? (

                    <div className="table-wrap">

                        <table>

                            <thead>
                                <tr>
                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Categoría
                                    </th>

                                    <th>
                                        Proveedor
                                    </th>

                                    <th>
                                        Estrategia
                                    </th>

                                    <th>
                                        Stock actual
                                    </th>

                                    <th>
                                        Stock mínimo
                                    </th>

                                    <th>
                                        Indicador
                                    </th>

                                    <th>
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {items.map(
                                    (
                                        item,
                                    ) => (
                                        <tr
                                            key={
                                                item.id_producto
                                            }
                                        >

                                            <td>
                                                <div className="inventory-product">

                                                    <strong>
                                                        {
                                                            item.nombre
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            item.sku
                                                        }
                                                    </small>

                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    item.categoria_nombre
                                                }
                                            </td>

                                            <td>
                                                {
                                                    item.proveedor_nombre ||
                                                    'Sin proveedor'
                                                }
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        `inventory-strategy strategy-${item.estrategia_logistica.toLowerCase()}`
                                                    }
                                                >
                                                    {
                                                        item.estrategia_logistica
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="inventory-stock-number">
                                                    {
                                                        item.stock_actual
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    item.stock_minimo
                                                }
                                            </td>

                                            <td>
                                                <Badge
                                                    tone={
                                                        item.stock_bajo
                                                            ? 'danger'
                                                            : 'success'
                                                    }
                                                >
                                                    {
                                                        item.stock_bajo
                                                            ? 'Stock bajo'
                                                            : 'Normal'
                                                    }
                                                </Badge>
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary inventory-movement-button"
                                                    onClick={() =>
                                                        openMovement(
                                                            item,
                                                        )
                                                    }
                                                >
                                                    <PackagePlus
                                                        size={
                                                            15
                                                        }
                                                    />

                                                    Movimiento
                                                </button>
                                            </td>

                                        </tr>
                                    ),
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <EmptyState
                        text="No se encontraron productos en inventario."
                    />

                )}

            </div>

            <section className="panel inventory-history">

                <div className="inventory-history-header">

                    <div>
                        <h2>
                            Historial de movimientos
                        </h2>

                        <p className="muted">
                            Entradas y salidas registradas en el inventario.
                        </p>
                    </div>

                    <History
                        size={22}
                    />

                </div>

                <div className="movement-filters">

                    <select
                        value={
                            movementProductFilter
                        }
                        onChange={(
                            event,
                        ) =>
                            setMovementProductFilter(
                                event
                                    .target
                                    .value,
                            )
                        }
                    >
                        <option value="">
                            Todos los productos
                        </option>

                        {items.map(
                            (item) => (
                                <option
                                    key={
                                        item.id_producto
                                    }
                                    value={
                                        item.id_producto
                                    }
                                >
                                    {
                                        item.nombre
                                    }
                                </option>
                            ),
                        )}
                    </select>

                    <select
                        value={
                            movementTypeFilter
                        }
                        onChange={(
                            event,
                        ) =>
                            setMovementTypeFilter(
                                event
                                    .target
                                    .value,
                            )
                        }
                    >
                        <option value="">
                            Entradas y salidas
                        </option>

                        <option value="entrada">
                            Entradas
                        </option>

                        <option value="salida">
                            Salidas
                        </option>
                    </select>

                </div>

                {movements.length ? (

                    <div className="table-wrap">

                        <table className="movements-table">

                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Producto</th>
                                    <th>Tipo</th>
                                    <th>Cantidad</th>
                                    <th>Motivo</th>
                                    <th>Stock</th>
                                    <th>Responsable</th>
                                    <th>Descripción</th>
                                </tr>
                            </thead>

                            <tbody>

                                {movements.map(
                                    (
                                        movement,
                                    ) => (
                                        <tr
                                            key={
                                                movement.id_movimiento
                                            }
                                        >

                                            <td>
                                                {
                                                    formatDate(
                                                        movement.fecha,
                                                    )
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        movement.producto_nombre
                                                    }
                                                </strong>

                                                <small className="cell-sub">
                                                    {
                                                        movement.sku
                                                    }
                                                </small>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        `movement-type movement-${movement.tipo}`
                                                    }
                                                >
                                                    {
                                                        movement.tipo ===
                                                            'entrada'
                                                            ? (
                                                                <ArrowDown
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )
                                                            : (
                                                                <ArrowUp
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )
                                                    }

                                                    {
                                                        movement.tipo
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {
                                                    movement.cantidad
                                                }
                                            </td>

                                            <td>
                                                {
                                                    movement.motivo
                                                }
                                            </td>

                                            <td>
                                                <span className="stock-change">
                                                    {
                                                        movement.stock_anterior
                                                    }
                                                    {' → '}
                                                    {
                                                        movement.stock_resultante
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                {
                                                    movement.usuario_nombre
                                                }
                                            </td>

                                            <td>
                                                {
                                                    movement.descripcion ||
                                                    '—'
                                                }
                                            </td>

                                        </tr>
                                    ),
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <EmptyState
                        text="Todavía no hay movimientos de inventario."
                    />

                )}

            </section>

            <Modal
                open={open}
                onClose={
                    closeModal
                }
                title="Registrar movimiento"
            >

                <form
                    onSubmit={
                        saveMovement
                    }
                    className="form-grid"
                >

                    {modalError && (
                        <div className="alert alert-error inventory-modal-alert">
                            <AlertTriangle
                                size={18}
                            />

                            <span>
                                {
                                    modalError
                                }
                            </span>
                        </div>
                    )}

                    <label className="supplier-form-full">
                        Producto

                        <select
                            name="producto_id"
                            value={
                                form.producto_id
                            }
                            onChange={
                                updateField
                            }
                            required
                        >
                            <option value="">
                                Selecciona un producto
                            </option>

                            {items.map(
                                (
                                    item,
                                ) => (
                                    <option
                                        key={
                                            item.id_producto
                                        }
                                        value={
                                            item.id_producto
                                        }
                                    >
                                        {
                                            item.nombre
                                        }
                                        {' · Stock '}
                                        {
                                            item.stock_actual
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    {selectedProduct && (
                        <div className="inventory-modal-stock">

                            <div>
                                <span>
                                    Stock actual
                                </span>

                                <strong>
                                    {
                                        currentStock
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Stock mínimo
                                </span>

                                <strong>
                                    {
                                        minimumStock
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Estado actual
                                </span>

                                <Badge
                                    tone={
                                        selectedProduct.stock_bajo
                                            ? 'danger'
                                            : 'success'
                                    }
                                >
                                    {
                                        selectedProduct.stock_bajo
                                            ? 'Stock bajo'
                                            : 'Normal'
                                    }
                                </Badge>
                            </div>

                            <div>
                                <span>
                                    Estrategia
                                </span>

                                <strong>
                                    {
                                        selectedProduct.estrategia_logistica
                                    }
                                </strong>
                            </div>

                        </div>
                    )}

                    <label>
                        Tipo

                        <select
                            name="tipo"
                            value={
                                form.tipo
                            }
                            onChange={
                                updateField
                            }
                        >
                            <option value="entrada">
                                Entrada
                            </option>

                            <option value="salida">
                                Salida
                            </option>
                        </select>
                    </label>

                    <label>
                        Cantidad

                        <input
                            type="number"
                            name="cantidad"
                            min="1"
                            step="1"
                            value={
                                form.cantidad
                            }
                            onChange={
                                updateField
                            }
                            required
                        />
                    </label>

                    <label>
                        Motivo

                        <select
                            name="motivo"
                            value={
                                form.motivo
                            }
                            onChange={
                                updateField
                            }
                        >
                            <option value="venta">
                                Venta
                            </option>

                            <option value="ajuste">
                                Ajuste
                            </option>

                            <option value="reposición">
                                Reposición
                            </option>
                        </select>
                    </label>

                    {selectedProduct && (
                        <div
                            className={
                                `inventory-projection ${insufficientStock
                                    ? 'inventory-projection-error'
                                    : projectedLowStock
                                        ? 'inventory-projection-warning'
                                        : 'inventory-projection-ok'
                                }`
                            }
                        >

                            <span>
                                Stock después del movimiento
                            </span>

                            <strong>
                                {
                                    projectedStock
                                }
                            </strong>

                            {insufficientStock && (
                                <small>
                                    Stock insuficiente para realizar esta salida.
                                </small>
                            )}

                            {!insufficientStock &&
                                projectedLowStock && (
                                    <small>
                                        El producto quedará con stock bajo.
                                    </small>
                                )}

                            {!insufficientStock &&
                                !projectedLowStock && (
                                    <small>
                                        El producto quedará con stock normal.
                                    </small>
                                )}

                        </div>
                    )}

                    <label className="supplier-form-full">
                        Descripción

                        <textarea
                            name="descripcion"
                            rows="4"
                            maxLength={
                                500
                            }
                            value={
                                form.descripcion
                            }
                            onChange={
                                updateField
                            }
                            placeholder="Describe el motivo del movimiento..."
                        />
                    </label>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={
                                closeModal
                            }
                            disabled={
                                saving
                            }
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                saving ||
                                insufficientStock
                            }
                        >
                            {
                                saving
                                    ? 'Guardando...'
                                    : 'Guardar movimiento'
                            }
                        </button>

                    </div>

                </form>

            </Modal>

        </MainLayout>
    );
}