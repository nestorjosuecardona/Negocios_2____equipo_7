import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Ban,
    CheckCircle2,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    UserCog,
    Users,
    UserRoundCheck,
    UserRoundX,
} from 'lucide-react';

import MainLayout
    from '../../components/MainLayout';

import Modal
    from '../../components/Modal';

import {
    actualizarEstadoUsuario,
    actualizarUsuario,
    crearAdministrador,
    getUsuarios,
} from '../../services/adminUsuariosService';

const emptyAdmin = {
    nombre: '',
    correo: '',
    password: '',
};

export default function Usuarios() {
    const [
        usuarios,
        setUsuarios,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    const [
        success,
        setSuccess,
    ] = useState('');

    const [
        search,
        setSearch,
    ] = useState('');

    const [
        roleFilter,
        setRoleFilter,
    ] = useState('');

    const [
        statusFilter,
        setStatusFilter,
    ] = useState('');

    const [
        createOpen,
        setCreateOpen,
    ] = useState(false);

    const [
        editOpen,
        setEditOpen,
    ] = useState(false);

    const [
        createForm,
        setCreateForm,
    ] = useState(emptyAdmin);

    const [
        editForm,
        setEditForm,
    ] = useState({
        id_usuario: null,
        nombre: '',
        correo: '',
        rol: '',
    });

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        busyId,
        setBusyId,
    ] = useState(null);

    async function cargarUsuarios() {
        try {
            setError('');

            const data =
                await getUsuarios();

            setUsuarios(data);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar los usuarios.',
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const resumen =
        useMemo(
            () => ({
                total:
                    usuarios.length,

                administradores:
                    usuarios.filter(
                        usuario =>
                            usuario.rol ===
                            'ADMIN',
                    ).length,

                clientes:
                    usuarios.filter(
                        usuario =>
                            usuario.rol ===
                            'CLIENTE',
                    ).length,

                restringidos:
                    usuarios.filter(
                        usuario =>
                            usuario.estado !==
                            'activo',
                    ).length,
            }),
            [usuarios],
        );

    const usuariosFiltrados =
        useMemo(
            () => {
                const text =
                    search
                        .trim()
                        .toLowerCase();

                return usuarios.filter(
                    usuario => {
                        const matchesSearch =
                            !text ||
                            usuario.nombre
                                ?.toLowerCase()
                                .includes(text) ||
                            usuario.correo
                                ?.toLowerCase()
                                .includes(text);

                        const matchesRole =
                            !roleFilter ||
                            usuario.rol ===
                            roleFilter;

                        const matchesStatus =
                            !statusFilter ||
                            usuario.estado ===
                            statusFilter;

                        return (
                            matchesSearch &&
                            matchesRole &&
                            matchesStatus
                        );
                    },
                );
            },
            [
                usuarios,
                search,
                roleFilter,
                statusFilter,
            ],
        );

    function nombreRol(rol) {
        switch (rol) {
            case 'SUPER_ADMIN':
                return 'Administrador General';

            case 'ADMIN':
                return 'Administrador';

            case 'CLIENTE':
                return 'Cliente';

            default:
                return rol;
        }
    }

    function formatDate(value) {
        if (!value) {
            return 'Sin acceso';
        }

        return new Date(
            value,
        ).toLocaleString(
            'es-MX',
        );
    }

    function mostrarExito(message) {
        setSuccess(message);

        setTimeout(
            () => {
                setSuccess('');
            },
            3000,
        );
    }

    async function guardarAdministrador(
        event,
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');

            await crearAdministrador(
                createForm,
            );

            setCreateForm(
                emptyAdmin,
            );

            setCreateOpen(false);

            await cargarUsuarios();

            mostrarExito(
                'Administrador creado correctamente.',
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible crear el administrador.',
            );
        } finally {
            setSaving(false);
        }
    }

    function abrirEditar(usuario) {
        setEditForm({
            id_usuario:
                usuario.id_usuario,

            nombre:
                usuario.nombre,

            correo:
                usuario.correo,

            rol:
                usuario.rol,
        });

        setEditOpen(true);
    }

    async function guardarEdicion(
        event,
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');

            await actualizarUsuario(
                editForm.id_usuario,
                {
                    nombre:
                        editForm.nombre,

                    correo:
                        editForm.correo,
                },
            );

            setEditOpen(false);

            await cargarUsuarios();

            mostrarExito(
                'Usuario actualizado correctamente.',
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible actualizar el usuario.',
            );
        } finally {
            setSaving(false);
        }
    }

    async function cambiarEstado(
        usuario,
        estado,
    ) {
        let message =
            `¿Cambiar el estado de ${usuario.nombre} a "${estado}"?`;

        if (
            estado ===
            'bloqueado'
        ) {
            message =
                `¿Bloquear el acceso de ${usuario.nombre}?`;
        }

        if (
            !window.confirm(
                message,
            )
        ) {
            return;
        }

        try {
            setBusyId(
                usuario.id_usuario,
            );

            setError('');

            await actualizarEstadoUsuario(
                usuario.id_usuario,
                estado,
            );

            await cargarUsuarios();

            mostrarExito(
                'Estado actualizado correctamente.',
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible actualizar el estado.',
            );
        } finally {
            setBusyId(null);
        }
    }

    return (
        <MainLayout>

            <div className="users-page">

                <div className="page-heading">

                    <div>
                        <h1>
                            Administración de usuarios
                        </h1>

                        <p>
                            Gestiona cuentas,
                            administradores, clientes
                            y estados de acceso.
                        </p>
                    </div>

                    <div className="users-heading-actions">

                        <div className="admin-badge">
                            <ShieldCheck
                                size={18}
                            />

                            Solo Administrador General
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() =>
                                setCreateOpen(true)
                            }
                        >
                            <Plus
                                size={17}
                            />

                            Nuevo administrador
                        </button>

                    </div>

                </div>

                <div className="users-summary">

                    <div className="summary-card">
                        <Users
                            size={22}
                        />

                        <div>
                            <span>
                                Total de usuarios
                            </span>

                            <strong>
                                {resumen.total}
                            </strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <UserCog
                            size={22}
                        />

                        <div>
                            <span>
                                Administradores
                            </span>

                            <strong>
                                {
                                    resumen.administradores
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <UserRoundCheck
                            size={22}
                        />

                        <div>
                            <span>
                                Clientes
                            </span>

                            <strong>
                                {resumen.clientes}
                            </strong>
                        </div>
                    </div>

                    <div className="summary-card">
                        <UserRoundX
                            size={22}
                        />

                        <div>
                            <span>
                                Acceso restringido
                            </span>

                            <strong>
                                {
                                    resumen.restringidos
                                }
                            </strong>
                        </div>
                    </div>

                </div>

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle2
                            size={18}
                        />

                        {success}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="table-card">

                    <div className="table-header">

                        <div>
                            <h2>
                                Usuarios del sistema
                            </h2>

                            <p>
                                Cuentas registradas en
                                Negocios 2.
                            </p>
                        </div>

                        <UserCog
                            size={22}
                        />

                    </div>

                    <div className="users-toolbar">

                        <div className="users-search">

                            <Search
                                size={18}
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={
                                    event =>
                                        setSearch(
                                            event.target
                                                .value,
                                        )
                                }
                                placeholder="Buscar por nombre o correo"
                            />

                        </div>

                        <select
                            value={roleFilter}
                            onChange={
                                event =>
                                    setRoleFilter(
                                        event.target
                                            .value,
                                    )
                            }
                        >
                            <option value="">
                                Todos los roles
                            </option>

                            <option value="SUPER_ADMIN">
                                Administrador General
                            </option>

                            <option value="ADMIN">
                                Administradores
                            </option>

                            <option value="CLIENTE">
                                Clientes
                            </option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={
                                event =>
                                    setStatusFilter(
                                        event.target
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

                            <option value="bloqueado">
                                Bloqueados
                            </option>
                        </select>

                    </div>

                    {loading ? (

                        <div className="users-message">
                            Cargando usuarios...
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="users-table">

                                <thead>
                                    <tr>
                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Nombre
                                        </th>

                                        <th>
                                            Correo
                                        </th>

                                        <th>
                                            Rol
                                        </th>

                                        <th>
                                            Estado
                                        </th>

                                        <th>
                                            Registro
                                        </th>

                                        <th>
                                            Último acceso
                                        </th>

                                        <th>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {usuariosFiltrados.map(
                                        usuario => (
                                            <tr
                                                key={
                                                    usuario.id_usuario
                                                }
                                            >

                                                <td>
                                                    {
                                                        usuario.id_usuario
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            usuario.nombre
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        usuario.correo
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            `role-badge role-${usuario.rol
                                                                .toLowerCase()
                                                                .replace(
                                                                    '_',
                                                                    '-',
                                                                )}`
                                                        }
                                                    >
                                                        {
                                                            nombreRol(
                                                                usuario.rol,
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            `status-badge status-${usuario.estado}`
                                                        }
                                                    >
                                                        {
                                                            usuario.estado
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            usuario.fecha_creacion,
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            usuario.ultimo_acceso,
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    {usuario.rol ===
                                                        'SUPER_ADMIN' ? (

                                                        <span className="user-protected">
                                                            <ShieldCheck
                                                                size={15}
                                                            />

                                                            Protegido
                                                        </span>

                                                    ) : (

                                                        <div className="user-actions">

                                                            <button
                                                                type="button"
                                                                className="user-action edit"
                                                                title="Editar usuario"
                                                                onClick={() =>
                                                                    abrirEditar(
                                                                        usuario,
                                                                    )
                                                                }
                                                            >
                                                                <Pencil
                                                                    size={15}
                                                                />

                                                                Editar
                                                            </button>

                                                            {usuario.estado !==
                                                                'activo' && (
                                                                    <button
                                                                        type="button"
                                                                        className="user-action activate"
                                                                        disabled={
                                                                            busyId ===
                                                                            usuario.id_usuario
                                                                        }
                                                                        onClick={() =>
                                                                            cambiarEstado(
                                                                                usuario,
                                                                                'activo',
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckCircle2
                                                                            size={15}
                                                                        />

                                                                        Activar
                                                                    </button>
                                                                )}

                                                            {usuario.estado ===
                                                                'activo' && (
                                                                    <button
                                                                        type="button"
                                                                        className="user-action inactive"
                                                                        disabled={
                                                                            busyId ===
                                                                            usuario.id_usuario
                                                                        }
                                                                        onClick={() =>
                                                                            cambiarEstado(
                                                                                usuario,
                                                                                'inactivo',
                                                                            )
                                                                        }
                                                                    >
                                                                        <UserRoundX
                                                                            size={15}
                                                                        />

                                                                        Desactivar
                                                                    </button>
                                                                )}

                                                            {usuario.estado !==
                                                                'bloqueado' && (
                                                                    <button
                                                                        type="button"
                                                                        className="user-action block"
                                                                        disabled={
                                                                            busyId ===
                                                                            usuario.id_usuario
                                                                        }
                                                                        onClick={() =>
                                                                            cambiarEstado(
                                                                                usuario,
                                                                                'bloqueado',
                                                                            )
                                                                        }
                                                                    >
                                                                        <Ban
                                                                            size={15}
                                                                        />

                                                                        Bloquear
                                                                    </button>
                                                                )}

                                                        </div>
                                                    )}

                                                </td>

                                            </tr>
                                        ),
                                    )}

                                    {!usuariosFiltrados.length && (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="users-empty"
                                            >
                                                No se encontraron usuarios
                                                con los filtros seleccionados.
                                            </td>
                                        </tr>
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>

            <Modal
                open={createOpen}
                onClose={() =>
                    setCreateOpen(false)
                }
                title="Nuevo administrador"
            >

                <form
                    className="form-grid one-column"
                    onSubmit={
                        guardarAdministrador
                    }
                >

                    <label>
                        Nombre

                        <input
                            type="text"
                            required
                            minLength="2"
                            value={
                                createForm.nombre
                            }
                            onChange={
                                event =>
                                    setCreateForm({
                                        ...createForm,
                                        nombre:
                                            event.target
                                                .value,
                                    })
                            }
                        />
                    </label>

                    <label>
                        Correo electrónico

                        <input
                            type="email"
                            required
                            value={
                                createForm.correo
                            }
                            onChange={
                                event =>
                                    setCreateForm({
                                        ...createForm,
                                        correo:
                                            event.target
                                                .value,
                                    })
                            }
                        />
                    </label>

                    <label>
                        Contraseña temporal

                        <input
                            type="password"
                            required
                            minLength="8"
                            value={
                                createForm.password
                            }
                            onChange={
                                event =>
                                    setCreateForm({
                                        ...createForm,
                                        password:
                                            event.target
                                                .value,
                                    })
                            }
                        />

                        <small className="form-help">
                            Mínimo 8 caracteres.
                        </small>
                    </label>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setCreateOpen(false)
                            }
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Plus
                                size={17}
                            />

                            {saving
                                ? 'Guardando...'
                                : 'Crear administrador'}
                        </button>

                    </div>

                </form>

            </Modal>

            <Modal
                open={editOpen}
                onClose={() =>
                    setEditOpen(false)
                }
                title="Editar usuario"
            >

                <form
                    className="form-grid one-column"
                    onSubmit={
                        guardarEdicion
                    }
                >

                    <label>
                        Nombre

                        <input
                            type="text"
                            required
                            minLength="2"
                            value={
                                editForm.nombre
                            }
                            onChange={
                                event =>
                                    setEditForm({
                                        ...editForm,
                                        nombre:
                                            event.target
                                                .value,
                                    })
                            }
                        />
                    </label>

                    <label>
                        Correo electrónico

                        <input
                            type="email"
                            required
                            value={
                                editForm.correo
                            }
                            onChange={
                                event =>
                                    setEditForm({
                                        ...editForm,
                                        correo:
                                            event.target
                                                .value,
                                    })
                            }
                        />
                    </label>

                    <label>
                        Rol

                        <input
                            type="text"
                            disabled
                            value={
                                nombreRol(
                                    editForm.rol,
                                )
                            }
                        />
                    </label>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                setEditOpen(false)
                            }
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Pencil
                                size={17}
                            />

                            {saving
                                ? 'Guardando...'
                                : 'Guardar cambios'}
                        </button>

                    </div>

                </form>

            </Modal>

        </MainLayout>
    );
}