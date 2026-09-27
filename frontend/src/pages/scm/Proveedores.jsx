import {
    useEffect,
    useState,
} from 'react';

import {
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
    actualizarProveedor,
    cambiarEstadoProveedor,
    crearProveedor,
    getProveedores,
} from '../../services/scmService';

import '../../styles/scm.css';


const emptyForm = {
    nombre: '',
    contacto: '',
    correo: '',
    telefono: '',
    direccion: '',
    estado: 'activo',
};


export default function Proveedores() {
    const [items, setItems] =
        useState([]);

    const [search, setSearch] =
        useState('');

    const [estado, setEstado] =
        useState('');

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


    async function load() {
        setLoading(true);
        setError('');

        try {
            const data =
                await getProveedores({
                    q: search,
                    estado,
                });

            setItems(data);
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cargar los proveedores.',
            );
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        const timeout =
            setTimeout(
                () => {
                    load();
                },
                250,
            );

        return () =>
            clearTimeout(timeout);
    }, [search, estado]);


    function openCreate() {
        setEditing(null);

        setForm(emptyForm);

        setError('');

        setOpen(true);
    }


    function openEdit(
        supplier,
    ) {
        setEditing(supplier);

        setForm({
            nombre:
                supplier.nombre || '',

            contacto:
                supplier.contacto || '',

            correo:
                supplier.correo || '',

            telefono:
                supplier.telefono || '',

            direccion:
                supplier.direccion || '',

            estado:
                supplier.estado ||
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
                [name]: value,
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
            if (editing) {
                await actualizarProveedor(
                    editing.id_proveedor,
                    form,
                );
            } else {
                await crearProveedor(
                    form,
                );
            }

            closeModal();

            await load();
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible guardar el proveedor.',
            );
        } finally {
            setSaving(false);
        }
    }


    async function toggleStatus(
        supplier,
    ) {
        const nextStatus =
            supplier.estado ===
                'activo'
                ? 'inactivo'
                : 'activo';

        try {
            await cambiarEstadoProveedor(
                supplier.id_proveedor,
                nextStatus,
            );

            await load();
        } catch (err) {
            setError(
                err.response?.data
                    ?.message ||
                'No fue posible cambiar el estado del proveedor.',
            );
        }
    }


    return (
        <MainLayout>

            <PageHeader
                title="Proveedores"
                subtitle="Gestiona los proveedores de accesorios automotrices."
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

                        Nuevo proveedor
                    </button>
                }
            />


            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}


            <div className="scm-toolbar">

                <div className="scm-search">

                    <Search
                        size={18}
                    />

                    <input
                        type="search"
                        placeholder="Buscar por nombre, contacto, correo, teléfono o dirección"
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
                    className="scm-state-filter"
                    value={estado}
                    onChange={(
                        event,
                    ) =>
                        setEstado(
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
                        Cargando proveedores...
                    </div>

                ) : items.length ? (

                    <div className="table-wrap">

                        <table>

                            <thead>
                                <tr>
                                    <th>
                                        Proveedor
                                    </th>

                                    <th>
                                        Contacto
                                    </th>

                                    <th>
                                        Correo
                                    </th>

                                    <th>
                                        Teléfono
                                    </th>

                                    <th>
                                        Dirección
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
                                        supplier,
                                    ) => (
                                        <tr
                                            key={
                                                supplier.id_proveedor
                                            }
                                        >

                                            <td>
                                                <div className="supplier-name">

                                                    <strong>
                                                        {
                                                            supplier.nombre
                                                        }
                                                    </strong>

                                                    <small>
                                                        ID #
                                                        {
                                                            supplier.id_proveedor
                                                        }
                                                    </small>

                                                </div>
                                            </td>


                                            <td>
                                                {
                                                    supplier.contacto ||
                                                    '—'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    supplier.correo ||
                                                    '—'
                                                }
                                            </td>


                                            <td>
                                                {
                                                    supplier.telefono ||
                                                    '—'
                                                }
                                            </td>


                                            <td className="supplier-address">
                                                {
                                                    supplier.direccion ||
                                                    '—'
                                                }
                                            </td>


                                            <td>
                                                <Badge
                                                    tone={
                                                        supplier.estado ===
                                                            'activo'
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                >
                                                    {
                                                        supplier.estado
                                                    }
                                                </Badge>
                                            </td>


                                            <td>
                                                <div className="supplier-actions">

                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="Editar proveedor"
                                                        onClick={() =>
                                                            openEdit(
                                                                supplier,
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
                                                            `icon-button supplier-status-button ${supplier.estado ===
                                                                'activo'
                                                                ? 'active'
                                                                : 'inactive'
                                                            }`
                                                        }
                                                        title={
                                                            supplier.estado ===
                                                                'activo'
                                                                ? 'Desactivar proveedor'
                                                                : 'Activar proveedor'
                                                        }
                                                        onClick={() =>
                                                            toggleStatus(
                                                                supplier,
                                                            )
                                                        }
                                                    >

                                                        {
                                                            supplier.estado ===
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
                        text="No se encontraron proveedores."
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
                        ? 'Editar proveedor'
                        : 'Nuevo proveedor'
                }
            >

                <form
                    onSubmit={save}
                    className="form-grid"
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
                                150
                            }
                            required
                        />
                    </label>


                    <label>
                        Contacto

                        <input
                            type="text"
                            name="contacto"
                            value={
                                form.contacto
                            }
                            onChange={
                                updateField
                            }
                            maxLength={
                                150
                            }
                        />
                    </label>


                    <label>
                        Correo

                        <input
                            type="email"
                            name="correo"
                            value={
                                form.correo
                            }
                            onChange={
                                updateField
                            }
                            maxLength={
                                180
                            }
                        />
                    </label>


                    <label>
                        Teléfono

                        <input
                            type="text"
                            name="telefono"
                            value={
                                form.telefono
                            }
                            onChange={
                                updateField
                            }
                            maxLength={
                                40
                            }
                        />
                    </label>


                    <label className="supplier-form-full">
                        Dirección

                        <input
                            type="text"
                            name="direccion"
                            value={
                                form.direccion
                            }
                            onChange={
                                updateField
                            }
                            maxLength={
                                300
                            }
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
                                    : 'Guardar'
                            }
                        </button>

                    </div>

                </form>

            </Modal>

        </MainLayout>
    );
}