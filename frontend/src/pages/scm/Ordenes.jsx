import {
    useEffect,
    useState,
} from 'react';

import {
    CheckCircle2,
    PackageCheck,
    Plus,
    Search,
    ShoppingCart,
} from 'lucide-react';

import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

import {
    crearOrdenReposicion,
    getOrdenes,
    getProductos,
    surtirOrden,
} from '../../services/scmService';

import '../../styles/scm.css';

const emptyForm = {
    producto_id: '',
    cantidad: 1,
};

export default function Ordenes() {
    const [items, setItems] =
        useState([]);

    const [
        products,
        setProducts,
    ] = useState([]);

    const [search, setSearch] =
        useState('');

    const [
        statusFilter,
        setStatusFilter,
    ] = useState('');

    const [
        typeFilter,
        setTypeFilter,
    ] = useState('');

    const [open, setOpen] =
        useState(false);

    const [form, setForm] =
        useState(emptyForm);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    async function loadOrders() {
        setLoading(true);
        setError('');

        try {
            const data =
                await getOrdenes({
                    q: search,
                    estado:
                        statusFilter,
                    tipo:
                        typeFilter,
                });

            setItems(data);
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar los pedidos.',
            );
        } finally {
            setLoading(false);
        }
    }

    async function loadProducts() {
        try {
            const data =
                await getProductos({
                    estado:
                        'activo',
                });

            setProducts(data);
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar los productos.',
            );
        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        const timeout =
            setTimeout(
                () => {
                    loadOrders();
                },
                250,
            );

        return () =>
            clearTimeout(timeout);
    }, [
        search,
        statusFilter,
        typeFilter,
    ]);

    function openCreate() {
        setForm(
            emptyForm,
        );

        setError('');
        setOpen(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setOpen(false);
        setForm(
            emptyForm,
        );
    }

    function updateField(
        event,
    ) {
        const {
            name,
            value,
        } = event.target;

        setForm(
            (current) => ({
                ...current,
                [name]:
                    value,
            }),
        );
    }

    async function save(
        event,
    ) {
        event.preventDefault();

        setSaving(true);
        setError('');

        try {
            await crearOrdenReposicion({
                producto_id:
                    Number(
                        form.producto_id,
                    ),

                cantidad:
                    Number(
                        form.cantidad,
                    ),
            });

            setOpen(false);

            setForm(
                emptyForm,
            );

            await loadOrders();
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible crear el pedido.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function fulfill(
        order,
    ) {
        try {
            await surtirOrden(
                order.id_pedido,
            );

            await Promise.all([
                loadOrders(),
                loadProducts(),
            ]);
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible surtir el pedido.',
            );
        }
    }

    function formatDate(
        value,
    ) {
        if (!value) {
            return '—';
        }

        return new Date(
            value,
        ).toLocaleString(
            'es-MX',
        );
    }

    return (
        <MainLayout>

            <PageHeader
                title="Pedidos"
                subtitle="Reposiciones automáticas PUSH y pedidos de suministro."
                actions={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={
                            openCreate
                        }
                    >
                        <Plus
                            size={17}
                        />

                        Generar pedido
                    </button>
                }
            />

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            <div className="orders-toolbar">

                <div className="scm-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="search"
                        placeholder="Buscar producto, SKU, proveedor o cliente"
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
                        statusFilter
                    }
                    onChange={(
                        event,
                    ) =>
                        setStatusFilter(
                            event
                                .target
                                .value,
                        )
                    }
                >
                    <option value="">
                        Todos los estados
                    </option>

                    <option value="pendiente">
                        Pendientes
                    </option>

                    <option value="surtido">
                        Surtidos
                    </option>
                </select>

                <select
                    value={
                        typeFilter
                    }
                    onChange={(
                        event,
                    ) =>
                        setTypeFilter(
                            event
                                .target
                                .value,
                        )
                    }
                >
                    <option value="">
                        Todos los tipos
                    </option>

                    <option value="reposición">
                        Reposición
                    </option>

                    <option value="venta">
                        Venta
                    </option>
                </select>

            </div>

            <div className="table-card">

                {loading ? (

                    <div className="empty-state">
                        Cargando pedidos...
                    </div>

                ) : items.length ? (

                    <div className="table-wrap">

                        <table className="orders-table">

                            <thead>
                                <tr>
                                    <th>
                                        Pedido
                                    </th>

                                    <th>
                                        Producto
                                    </th>

                                    <th>
                                        Proveedor
                                    </th>

                                    <th>
                                        Cantidad
                                    </th>

                                    <th>
                                        Tipo
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Fecha
                                    </th>

                                    <th>
                                        Responsable
                                    </th>

                                    <th>
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {items.map(
                                    (
                                        order,
                                    ) => (
                                        <tr
                                            key={
                                                order.id_pedido
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    #
                                                    {
                                                        order.id_pedido
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="order-product">

                                                    <strong>
                                                        {
                                                            order.producto_nombre
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            order.sku
                                                        }
                                                    </small>

                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    order.proveedor_nombre ||
                                                    'Sin proveedor'
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        order.cantidad
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        `order-type order-type-${order.tipo === 'reposición' ? 'restock' : 'sale'}`
                                                    }
                                                >
                                                    <ShoppingCart
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    {
                                                        order.tipo
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <Badge
                                                    tone={
                                                        order.estado ===
                                                            'surtido'
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                >
                                                    {
                                                        order.estado
                                                    }
                                                </Badge>
                                            </td>

                                            <td>
                                                {
                                                    formatDate(
                                                        order.fecha,
                                                    )
                                                }

                                                {order.fecha_surtido && (
                                                    <small className="cell-sub">
                                                        Surtido:{' '}
                                                        {
                                                            formatDate(
                                                                order.fecha_surtido,
                                                            )
                                                        }
                                                    </small>
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    order.usuario_nombre
                                                }
                                            </td>

                                            <td>

                                                {order.estado ===
                                                    'pendiente' &&
                                                    order.tipo ===
                                                    'reposición' ? (

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary order-fulfill-button"
                                                        onClick={() =>
                                                            fulfill(
                                                                order,
                                                            )
                                                        }
                                                    >
                                                        <PackageCheck
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        Surtir
                                                    </button>

                                                ) : (

                                                    <span className="order-completed">
                                                        <CheckCircle2
                                                            size={
                                                                16
                                                            }
                                                        />

                                                        Completado
                                                    </span>

                                                )}

                                            </td>

                                        </tr>
                                    ),
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <EmptyState
                        text="Todavía no hay pedidos."
                    />

                )}

            </div>

            <Modal
                open={open}
                onClose={
                    closeModal
                }
                title="Generar pedido de reposición"
            >

                <form
                    onSubmit={save}
                    className="form-grid"
                >

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

                            {products.map(
                                (
                                    product,
                                ) => (
                                    <option
                                        key={
                                            product.id_producto
                                        }
                                        value={
                                            product.id_producto
                                        }
                                    >
                                        {
                                            product.nombre
                                        }
                                        {' · Stock '}
                                        {
                                            product.stock_actual
                                        }
                                        {' · Mín. '}
                                        {
                                            product.stock_minimo
                                        }
                                    </option>
                                ),
                            )}
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
                                saving
                            }
                        >
                            {
                                saving
                                    ? 'Generando...'
                                    : 'Generar pedido'
                            }
                        </button>

                    </div>

                </form>

            </Modal>

        </MainLayout>
    );
}