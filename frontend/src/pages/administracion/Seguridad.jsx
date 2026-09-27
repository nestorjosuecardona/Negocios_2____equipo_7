import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Activity,
    CheckCircle2,
    Clock3,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    UserCheck,
    UserRoundX,
    Users,
} from 'lucide-react';

import MainLayout
    from '../../components/MainLayout';

import {
    getUsuarios,
} from '../../services/adminUsuariosService';

export default function Seguridad() {
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

    useEffect(() => {
        async function load() {
            try {
                const data =
                    await getUsuarios();

                setUsuarios(data);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'No fue posible cargar la información de seguridad.',
                );

            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const resumen =
        useMemo(
            () => ({
                total:
                    usuarios.length,

                activos:
                    usuarios.filter(
                        usuario =>
                            usuario.estado ===
                            'activo',
                    ).length,

                restringidos:
                    usuarios.filter(
                        usuario =>
                            usuario.estado !==
                            'activo',
                    ).length,

                administradores:
                    usuarios.filter(
                        usuario =>
                            usuario.rol ===
                            'ADMIN' ||
                            usuario.rol ===
                            'SUPER_ADMIN',
                    ).length,
            }),
            [usuarios],
        );

    const ultimosAccesos =
        useMemo(
            () =>
                [...usuarios]
                    .filter(
                        usuario =>
                            usuario.ultimo_acceso,
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                b.ultimo_acceso,
                            ) -
                            new Date(
                                a.ultimo_acceso,
                            ),
                    )
                    .slice(
                        0,
                        8,
                    ),
            [usuarios],
        );

    function nombreRol(rol) {
        if (
            rol ===
            'SUPER_ADMIN'
        ) {
            return 'Administrador General';
        }

        if (
            rol ===
            'ADMIN'
        ) {
            return 'Administrador';
        }

        if (
            rol ===
            'CLIENTE'
        ) {
            return 'Cliente';
        }

        return rol;
    }

    return (
        <MainLayout>

            <div className="security-page">

                <div className="page-heading">

                    <div>
                        <h1>
                            Seguridad del sistema
                        </h1>

                        <p>
                            Estado de cuentas,
                            accesos y protecciones
                            de Negocios 2.
                        </p>
                    </div>

                    <div className="admin-badge">
                        <ShieldCheck
                            size={18}
                        />

                        Solo Administrador General
                    </div>

                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <div className="security-summary">

                    <div className="security-stat">

                        <Users
                            size={22}
                        />

                        <div>
                            <span>
                                Cuentas registradas
                            </span>

                            <strong>
                                {resumen.total}
                            </strong>
                        </div>

                    </div>

                    <div className="security-stat">

                        <UserCheck
                            size={22}
                        />

                        <div>
                            <span>
                                Cuentas activas
                            </span>

                            <strong>
                                {resumen.activos}
                            </strong>
                        </div>

                    </div>

                    <div className="security-stat">

                        <UserRoundX
                            size={22}
                        />

                        <div>
                            <span>
                                Acceso restringido
                            </span>

                            <strong>
                                {resumen.restringidos}
                            </strong>
                        </div>

                    </div>

                    <div className="security-stat">

                        <ShieldCheck
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

                </div>

                <div className="security-grid">

                    <section className="security-panel">

                        <div className="security-panel-heading">

                            <div>
                                <h2>
                                    Protecciones activas
                                </h2>

                                <p>
                                    Mecanismos implementados
                                    actualmente.
                                </p>
                            </div>

                            <LockKeyhole
                                size={22}
                            />

                        </div>

                        <div className="security-checks">

                            <div>
                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    Contraseñas protegidas
                                    mediante hash
                                </span>
                            </div>

                            <div>
                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    Autenticación mediante
                                    JWT
                                </span>
                            </div>

                            <div>
                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    Rutas protegidas
                                    mediante autenticación
                                </span>
                            </div>

                            <div>
                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    Restricción de vistas
                                    según rol
                                </span>
                            </div>

                            <div>
                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    Cuentas inactivas o
                                    bloqueadas sin acceso
                                </span>
                            </div>

                            <div>
                                <CheckCircle2
                                    size={18}
                                />

                                <span>
                                    Administración exclusiva
                                    para SUPER_ADMIN
                                </span>
                            </div>

                        </div>

                    </section>

                    <section className="security-panel">

                        <div className="security-panel-heading">

                            <div>
                                <h2>
                                    Control de acceso
                                </h2>

                                <p>
                                    Distribución actual
                                    de permisos.
                                </p>
                            </div>

                            <KeyRound
                                size={22}
                            />

                        </div>

                        <div className="security-role-list">

                            <div>
                                <span>
                                    Administrador General
                                </span>

                                <strong>
                                    {
                                        usuarios.filter(
                                            usuario =>
                                                usuario.rol ===
                                                'SUPER_ADMIN',
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Administradores
                                </span>

                                <strong>
                                    {
                                        usuarios.filter(
                                            usuario =>
                                                usuario.rol ===
                                                'ADMIN',
                                        ).length
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Clientes
                                </span>

                                <strong>
                                    {
                                        usuarios.filter(
                                            usuario =>
                                                usuario.rol ===
                                                'CLIENTE',
                                        ).length
                                    }
                                </strong>
                            </div>

                        </div>

                    </section>

                </div>

                <section className="security-panel security-access-panel">

                    <div className="security-panel-heading">

                        <div>
                            <h2>
                                Últimos accesos
                            </h2>

                            <p>
                                Actividad reciente registrada
                                por las cuentas del sistema.
                            </p>
                        </div>

                        <Activity
                            size={22}
                        />

                    </div>

                    {loading ? (

                        <div className="users-message">
                            Cargando actividad...
                        </div>

                    ) : ultimosAccesos.length ? (

                        <div className="table-responsive">

                            <table className="users-table">

                                <thead>
                                    <tr>
                                        <th>
                                            Usuario
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
                                            Último acceso
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {ultimosAccesos.map(
                                        usuario => (
                                            <tr
                                                key={
                                                    usuario.id_usuario
                                                }
                                            >

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
                                                    {
                                                        nombreRol(
                                                            usuario.rol,
                                                        )
                                                    }
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
                                                    <div className="security-date">
                                                        <Clock3
                                                            size={15}
                                                        />

                                                        {
                                                            new Date(
                                                                usuario.ultimo_acceso,
                                                            )
                                                                .toLocaleString(
                                                                    'es-MX',
                                                                )
                                                        }
                                                    </div>
                                                </td>

                                            </tr>
                                        ),
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="users-message">
                            Todavía no existen accesos registrados.
                        </div>

                    )}

                </section>

            </div>

        </MainLayout>
    );
}