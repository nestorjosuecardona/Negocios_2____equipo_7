import {
    useEffect,
    useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import {
    AlertTriangle,
    ImageOff,
    Package,
    Pencil,
    Plus,
    Power,
    PowerOff,
    Search,
} from 'lucide-react';

import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import Badge from '../../components/Badge';

import {
    actualizarProducto,
    cambiarEstadoProducto,
    cambiarEstrategiaProducto,
    crearProducto,
    getCategorias,
    getProductos,
    getProveedores,
} from '../../services/scmService';

import '../../styles/scm.css';


const emptyForm = {
    sku: '',
    nombre: '',
    descripcion: '',
    id_categoria: '',
    marca: '',
    proveedor_id: '',
    costo_unitario: 0,
    precio_venta: 0,
    stock_actual: 0,
    stock_minimo: 0,
    estrategia_logistica:
        'PULL',
    imagen_url: '',
    estado: 'activo',
};


export default function Productos() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] =
        useState([]);

    const [
        categories,
        setCategories,
    ] = useState([]);

    const [
        suppliers,
        setSuppliers,
    ] = useState([]);

    const [search, setSearch] =
        useState('');

    const [
        categoryFilter,
        setCategoryFilter,
    ] = useState('');

    const [
        strategyFilter,
        setStrategyFilter,
    ] = useState('');

    const [
        statusFilter,
        setStatusFilter,
    ] = useState('');

    const [open, setOpen] =
        useState(false);

    const [editing, setEditing] =
        useState(null);

    const [form, setForm] =
        useState(emptyForm);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');


    async function loadCatalogs() {
        try {
            const [
                categoriesData,
                suppliersData,
            ] = await Promise.all([
                getCategorias(),

                getProveedores(),
            ]);

            setCategories(
                categoriesData,
            );

            setSuppliers(
                suppliersData,
            );
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar categorías y proveedores.',
            );
        }
    }


    async function loadProducts() {
        setLoading(true);
        setError('');

        try {
            const data =
                await getProductos({
                    q: search,

                    categoria:
                        categoryFilter,

                    estrategia:
                        strategyFilter,

                    estado:
                        statusFilter,
                });

            setItems(data);
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar los productos.',
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadCatalogs();
    }, []);

    useEffect(() => {
        if (searchParams.get('alta') !== '1' || !categories.length || !suppliers.length) return;
        openCreate();
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('alta');
        setSearchParams(nextParams, { replace: true });
    }, [searchParams, categories.length, suppliers.length]);


    useEffect(() => {
        const timeout =
            setTimeout(
                () => {
                    loadProducts();
                },
                250,
            );

        return () =>
            clearTimeout(timeout);
    }, [
        search,
        categoryFilter,
        strategyFilter,
        statusFilter,
    ]);


    function openCreate() {
        setEditing(null);

        setForm(emptyForm);

        setError('');

        setOpen(true);
    }


    function openEdit(product) {
        setEditing(product);

        setForm({
            sku:
                product.sku || '',

            nombre:
                product.nombre || '',

            descripcion:
                product.descripcion ||
                '',

            id_categoria:
                product.id_categoria
                    ? String(
                        product.id_categoria,
                    )
                    : '',

            marca:
                product.marca || '',

            proveedor_id:
                product.proveedor_id
                    ? String(
                        product.proveedor_id,
                    )
                    : '',

            costo_unitario:
                Number(
                    product.costo_unitario ||
                    0,
                ),

            precio_venta:
                Number(
                    product.precio_venta ||
                    0,
                ),

            stock_actual:
                Number(
                    product.stock_actual ||
                    0,
                ),

            stock_minimo:
                Number(
                    product.stock_minimo ||
                    0,
                ),

            estrategia_logistica:
                product.estrategia_logistica ||
                'PULL',

            imagen_url:
                product.imagen_url || '',

            estado:
                product.estado ||
                'activo',
        });

        setError('');

        setOpen(true);
    }


    function closeModal() {
        if (saving) {
            return;
        }

        setOpen(false);

        setEditing(null);

        setForm(emptyForm);
    }


    function updateField(event) {
        const {
            name,
            value,
        } = event.target;

        setForm(
            (current) => ({
                ...current,
                [name]: value,
            }),
        );
    }


    function buildPayload() {
        return {
            ...form,

            id_categoria:
                Number(
                    form.id_categoria,
                ),

            proveedor_id:
                form.proveedor_id
                    ? Number(
                        form.proveedor_id,
                    )
                    : null,

            costo_unitario:
                Number(
                    form.costo_unitario,
                ),

            precio_venta:
                Number(
                    form.precio_venta,
                ),

            stock_actual:
                Number(
                    form.stock_actual,
                ),

            stock_minimo:
                Number(
                    form.stock_minimo,
                ),
        };
    }


    async function save(event) {
        event.preventDefault();

        setSaving(true);
        setError('');

        try {
            const payload =
                buildPayload();

            if (editing) {
                await actualizarProducto(
                    editing.id_producto,
                    payload,
                );
            } else {
                await crearProducto(
                    payload,
                );
            }

            setOpen(false);

            setEditing(null);

            setForm(emptyForm);

            await loadProducts();
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible guardar el producto.',
            );
        } finally {
            setSaving(false);
        }
    }


    async function toggleStatus(
        product,
    ) {
        const nextStatus =
            product.estado ===
                'activo'
                ? 'inactivo'
                : 'activo';

        try {
            await cambiarEstadoProducto(
                product.id_producto,
                nextStatus,
            );

            await loadProducts();
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cambiar el estado del producto.',
            );
        }
    }


    async function changeStrategy(
        product,
        strategy,
    ) {
        try {
            await cambiarEstrategiaProducto(
                product.id_producto,
                strategy,
            );

            await loadProducts();
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cambiar la estrategia logística.',
            );
        }
    }


    function money(value) {
        return new Intl
            .NumberFormat(
                'es-MX',
                {
                    style:
                        'currency',

                    currency:
                        'MXN',
                },
            )
            .format(
                Number(
                    value || 0,
                ),
            );
    }


    return (
        <MainLayout>

            <PageHeader
                title="Productos"
                subtitle="Catálogo de accesorios automotrices y control logístico."
                actions={
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={
                            openCreate
                        }
                    >
                        <Plus size={17} />

                        Nuevo producto
                    </button>
                }
            />


            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}


            <div className="product-toolbar">

                <div className="scm-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="search"
                        placeholder="Buscar por nombre, SKU, marca o descripción"
                        value={search}
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
                        categoryFilter
                    }
                    onChange={(
                        event,
                    ) =>
                        setCategoryFilter(
                            event
                                .target
                                .value,
                        )
                    }
                >
                    <option value="">
                        Todas las categorías
                    </option>

                    {categories.map(
                        (category) => (
                            <option
                                key={
                                    category.id_categoria
                                }
                                value={
                                    category.id_categoria
                                }
                            >
                                {
                                    category.nombre
                                }
                            </option>
                        ),
                    )}
                </select>


                <select
                    value={
                        strategyFilter
                    }
                    onChange={(
                        event,
                    ) =>
                        setStrategyFilter(
                            event
                                .target
                                .value,
                        )
                    }
                >
                    <option value="">
                        PUSH y PULL
                    </option>

                    <option value="PUSH">
                        PUSH
                    </option>

                    <option value="PULL">
                        PULL
                    </option>
                </select>


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

                    <option value="activo">
                        Activos
                    </option>

                    <option value="inactivo">
                        Inactivos
                    </option>
                </select>

            </div>


            <div className="table-card">

                {loading ? (

                    <div className="empty-state">
                        Cargando productos...
                    </div>

                ) : items.length ? (

                    <div className="table-wrap">

                        <table className="products-table">

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
                                        Costo
                                    </th>

                                    <th>
                                        Precio
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Estrategia
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                    <th>
                                        Acciones
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {items.map(
                                    (
                                        product,
                                    ) => (
                                        <tr
                                            key={
                                                product.id_producto
                                            }
                                        >

                                            <td>
                                                <div className="product-cell">

                                                    <div className="scm-product-image">

                                                        {
                                                            product.imagen_url
                                                                ? (
                                                                    <img
                                                                        src={
                                                                            product.imagen_url
                                                                        }
                                                                        alt={
                                                                            product.nombre
                                                                        }
                                                                    />
                                                                )
                                                                : (
                                                                    <ImageOff
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                )
                                                        }

                                                    </div>


                                                    <div className="product-info">

                                                        <strong>
                                                            {
                                                                product.nombre
                                                            }
                                                        </strong>

                                                        <small>
                                                            SKU:{' '}
                                                            {
                                                                product.sku
                                                            }
                                                        </small>

                                                        {
                                                            product.marca &&
                                                            (
                                                                <small>
                                                                    {
                                                                        product.marca
                                                                    }
                                                                </small>
                                                            )
                                                        }

                                                    </div>

                                                </div>
                                            </td>


                                            <td>
                                                {
                                                    product.categoria_nombre
                                                }
                                            </td>


                                            <td>
                                                {
                                                    product.proveedor_nombre ||
                                                    'Sin proveedor'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    money(
                                                        product.costo_unitario,
                                                    )
                                                }
                                            </td>


                                            <td>
                                                <strong>
                                                    {
                                                        money(
                                                            product.precio_venta,
                                                        )
                                                    }
                                                </strong>
                                            </td>


                                            <td>
                                                <div className="stock-cell">

                                                    <strong>
                                                        {
                                                            product.stock_actual
                                                        }
                                                    </strong>

                                                    <small>
                                                        Mín:{' '}
                                                        {
                                                            product.stock_minimo
                                                        }
                                                    </small>

                                                    {
                                                        Boolean(
                                                            product.stock_bajo,
                                                        ) &&
                                                        (
                                                            <span className="stock-warning">
                                                                <AlertTriangle
                                                                    size={
                                                                        13
                                                                    }
                                                                />

                                                                Stock bajo
                                                            </span>
                                                        )
                                                    }

                                                </div>
                                            </td>


                                            <td>
                                                <select
                                                    className={
                                                        `strategy-select strategy-${product.estrategia_logistica.toLowerCase()}`
                                                    }
                                                    value={
                                                        product.estrategia_logistica
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        changeStrategy(
                                                            product,
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                >
                                                    <option value="PUSH">
                                                        PUSH
                                                    </option>

                                                    <option value="PULL">
                                                        PULL
                                                    </option>
                                                </select>
                                            </td>


                                            <td>
                                                <Badge
                                                    tone={
                                                        product.estado ===
                                                            'activo'
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                >
                                                    {
                                                        product.estado
                                                    }
                                                </Badge>
                                            </td>


                                            <td>
                                                <div className="supplier-actions">

                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="Editar producto"
                                                        onClick={() =>
                                                            openEdit(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        <Pencil
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className={
                                                            `icon-button supplier-status-button ${product.estado ===
                                                                'activo'
                                                                ? 'active'
                                                                : 'inactive'
                                                            }`
                                                        }
                                                        title={
                                                            product.estado ===
                                                                'activo'
                                                                ? 'Desactivar producto'
                                                                : 'Activar producto'
                                                        }
                                                        onClick={() =>
                                                            toggleStatus(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        {
                                                            product.estado ===
                                                                'activo'
                                                                ? (
                                                                    <PowerOff
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                )
                                                                : (
                                                                    <Power
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                )
                                                        }
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ),
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <EmptyState
                        text="No se encontraron productos."
                    />

                )}

            </div>


            <Modal
                open={open}
                onClose={
                    closeModal
                }
                title={
                    editing
                        ? 'Editar producto'
                        : 'Nuevo producto'
                }
            >

                <form
                    onSubmit={save}
                    className="form-grid product-form"
                >

                    <label>
                        Nombre

                        <input
                            type="text"
                            name="nombre"
                            value={
                                form.nombre
                            }
                            onChange={
                                updateField
                            }
                            maxLength={
                                180
                            }
                            required
                        />
                    </label>


                    <label>
                        SKU

                        <input
                            type="text"
                            name="sku"
                            value={
                                form.sku
                            }
                            onChange={
                                updateField
                            }
                            maxLength={
                                80
                            }
                            required
                        />
                    </label>


                    <label>
                        Categoría

                        <select
                            name="id_categoria"
                            value={
                                form.id_categoria
                            }
                            onChange={
                                updateField
                            }
                            required
                        >
                            <option value="">
                                Selecciona una categoría
                            </option>

                            {categories.map(
                                (
                                    category,
                                ) => (
                                    <option
                                        key={
                                            category.id_categoria
                                        }
                                        value={
                                            category.id_categoria
                                        }
                                    >
                                        {
                                            category.nombre
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </label>


                    <label>
                        Marca

                        <input
                            type="text"
                            name="marca"
                            value={
                                form.marca
                            }
                            onChange={
                                updateField
                            }
                            placeholder="Ej. Philips, Pioneer..."
                        />
                    </label>


                    <label>
                        Proveedor

                        <select
                            name="proveedor_id"
                            value={
                                form.proveedor_id
                            }
                            onChange={
                                updateField
                            }
                        >
                            <option value="">
                                Sin proveedor
                            </option>

                            {suppliers.map(
                                (
                                    supplier,
                                ) => (
                                    <option
                                        key={
                                            supplier.id_proveedor
                                        }
                                        value={
                                            supplier.id_proveedor
                                        }
                                        disabled={
                                            supplier.estado !==
                                            'activo'
                                        }
                                    >
                                        {
                                            supplier.nombre
                                        }
                                        {
                                            supplier.estado !==
                                                'activo'
                                                ? ' (inactivo)'
                                                : ''
                                        }
                                    </option>
                                ),
                            )}
                        </select>
                    </label>


                    <label>
                        Estrategia logística

                        <select
                            name="estrategia_logistica"
                            value={
                                form.estrategia_logistica
                            }
                            onChange={
                                updateField
                            }
                        >
                            <option value="PUSH">
                                PUSH
                            </option>

                            <option value="PULL">
                                PULL
                            </option>
                        </select>
                    </label>


                    <label>
                        Costo unitario

                        <input
                            type="number"
                            name="costo_unitario"
                            min="0"
                            step="0.01"
                            value={
                                form.costo_unitario
                            }
                            onChange={
                                updateField
                            }
                            required
                        />
                    </label>


                    <label>
                        Precio de venta

                        <input
                            type="number"
                            name="precio_venta"
                            min="0"
                            step="0.01"
                            value={
                                form.precio_venta
                            }
                            onChange={
                                updateField
                            }
                            required
                        />
                    </label>


                    <label>
                        Stock actual

                        <input
                            type="number"
                            name="stock_actual"
                            min="0"
                            step="1"
                            value={
                                form.stock_actual
                            }
                            onChange={
                                updateField
                            }
                            required
                        />
                    </label>


                    <label>
                        Stock mínimo

                        <input
                            type="number"
                            name="stock_minimo"
                            min="0"
                            step="1"
                            value={
                                form.stock_minimo
                            }
                            onChange={
                                updateField
                            }
                            required
                        />
                    </label>


                    <label>
                        Estado

                        <select
                            name="estado"
                            value={
                                form.estado
                            }
                            onChange={
                                updateField
                            }
                        >
                            <option value="activo">
                                Activo
                            </option>

                            <option value="inactivo">
                                Inactivo
                            </option>
                        </select>
                    </label>


                    <label>
                        URL de imagen

                        <input
                            type="url"
                            name="imagen_url"
                            value={
                                form.imagen_url
                            }
                            onChange={
                                updateField
                            }
                            placeholder="https://..."
                        />
                    </label>


                    <label className="supplier-form-full">
                        Descripción

                        <textarea
                            name="descripcion"
                            rows="4"
                            maxLength={
                                1000
                            }
                            value={
                                form.descripcion
                            }
                            onChange={
                                updateField
                            }
                            placeholder="Descripción del accesorio automotriz..."
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
                                    ? 'Guardando...'
                                    : 'Guardar producto'
                            }
                        </button>

                    </div>

                </form>

            </Modal>

        </MainLayout>
    );
}
