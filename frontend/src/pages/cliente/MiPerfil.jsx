import {
    CalendarDays,
    CheckCircle2,
    Mail,
    Phone,
    Save,
    ShieldCheck,
    UserCircle,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import StoreHeader
    from '../../components/store/StoreHeader';

import {
    useAuth,
} from '../../context/AuthContext';

import {
    actualizarPerfil,
    getPerfil,
} from '../../services/perfilService';

export default function MiPerfil() {
    const {
        updateUser,
    } = useAuth();

    const [
        profile,
        setProfile,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState({
        nombre: '',
        correo: '',
        telefono: '',
    });

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState('');

    const [
        success,
        setSuccess,
    ] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            setLoading(true);
            setError('');

            const data =
                await getPerfil();

            setProfile(data);

            setForm({
                nombre:
                    data.nombre || '',
                correo:
                    data.correo || '',
                telefono:
                    data.telefono || '',
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible cargar tu perfil.',
            );
        } finally {
            setLoading(false);
        }
    }

    function handleChange(
        event,
    ) {
        const {
            name,
            value,
        } = event.target;

        setForm(
            current => ({
                ...current,
                [name]: value,
            }),
        );
    }

    async function handleSubmit(
        event,
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const data =
                await actualizarPerfil({
                    nombre:
                        form.nombre,
                    correo:
                        form.correo,
                    telefono:
                        form.telefono,
                });

            setProfile(data);

            setForm({
                nombre:
                    data.nombre || '',
                correo:
                    data.correo || '',
                telefono:
                    data.telefono || '',
            });

            updateUser({
                nombre:
                    data.nombre,
                correo:
                    data.correo,
            });

            setSuccess(
                'Tus datos fueron actualizados correctamente.',
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible actualizar tu perfil.',
            );
        } finally {
            setSaving(false);
        }
    }

    function formatDate(value) {
        if (!value) {
            return 'Sin registro';
        }

        return new Date(
            value,
        ).toLocaleString(
            'es-MX',
            {
                dateStyle: 'medium',
                timeStyle: 'short',
            },
        );
    }

    if (loading) {
        return (
            <div className="store-page">

                <StoreHeader />

                <main className="profile-page">

                    <div className="profile-loading">
                        Cargando perfil...
                    </div>

                </main>

            </div>
        );
    }

    return (
        <div className="store-page">

            <StoreHeader />

            <main className="profile-page">

                <section className="profile-heading">

                    <div>

                        <span>
                            Mi cuenta
                        </span>

                        <h1>
                            Mi perfil
                        </h1>

                        <p>
                            Consulta y actualiza
                            la información asociada
                            a tu cuenta.
                        </p>

                    </div>

                    <div className="profile-heading-icon">
                        <UserCircle
                            size={29}
                        />
                    </div>

                </section>

                {error && (
                    <div className="checkout-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="profile-success">

                        <CheckCircle2
                            size={18}
                        />

                        {success}

                    </div>
                )}

                <div className="profile-layout">

                    <form
                        className="profile-card"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="profile-card-heading">

                            <UserCircle
                                size={22}
                            />

                            <div>
                                <h2>
                                    Datos personales
                                </h2>

                                <p>
                                    Información principal
                                    de tu cuenta.
                                </p>
                            </div>

                        </div>

                        <div className="profile-form">

                            <label>
                                Nombre

                                <div className="profile-input">

                                    <UserCircle
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        name="nombre"
                                        required
                                        maxLength="150"
                                        value={
                                            form.nombre
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>
                            </label>

                            <label>
                                Correo electrónico

                                <div className="profile-input">

                                    <Mail
                                        size={18}
                                    />

                                    <input
                                        type="email"
                                        name="correo"
                                        required
                                        maxLength="180"
                                        value={
                                            form.correo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>
                            </label>

                            <label>
                                Teléfono

                                <div className="profile-input">

                                    <Phone
                                        size={18}
                                    />

                                    <input
                                        type="tel"
                                        name="telefono"
                                        maxLength="40"
                                        placeholder="Agrega tu teléfono"
                                        value={
                                            form.telefono
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>
                            </label>

                        </div>

                        <button
                            type="submit"
                            className="store-primary-button profile-save"
                            disabled={saving}
                        >
                            <Save
                                size={18}
                            />

                            {saving
                                ? 'Guardando...'
                                : 'Guardar cambios'}
                        </button>

                    </form>

                    <aside className="profile-side">

                        <section className="profile-account-card">

                            <div className="profile-avatar">
                                <UserCircle
                                    size={43}
                                />
                            </div>

                            <span>
                                Cuenta de cliente
                            </span>

                            <h2>
                                {profile?.nombre}
                            </h2>

                            <p>
                                {profile?.correo}
                            </p>

                            <div className="profile-status">
                                <span />
                                Cuenta activa
                            </div>

                        </section>

                        <section className="profile-info-card">

                            <div className="profile-info-title">

                                <ShieldCheck
                                    size={20}
                                />

                                <h3>
                                    Información de cuenta
                                </h3>

                            </div>

                            <div className="profile-info-row">
                                <span>
                                    Rol
                                </span>

                                <strong>
                                    {profile?.rol}
                                </strong>
                            </div>

                            <div className="profile-info-row">
                                <span>
                                    Estado
                                </span>

                                <strong>
                                    {profile?.estado}
                                </strong>
                            </div>

                            <div className="profile-info-row">
                                <span>
                                    Etapa CRM
                                </span>

                                <strong>
                                    {profile?.etapa_crm ||
                                        'Sin etapa'}
                                </strong>
                            </div>

                            <div className="profile-info-row">
                                <span>
                                    Empresa
                                </span>

                                <strong>
                                    {profile?.empresa ||
                                        'Sin empresa'}
                                </strong>
                            </div>

                        </section>

                        <section className="profile-info-card">

                            <div className="profile-info-title">

                                <CalendarDays
                                    size={20}
                                />

                                <h3>
                                    Actividad
                                </h3>

                            </div>

                            <div className="profile-info-row profile-info-column">

                                <span>
                                    Cuenta creada
                                </span>

                                <strong>
                                    {formatDate(
                                        profile?.fecha_creacion,
                                    )}
                                </strong>

                            </div>

                            <div className="profile-info-row profile-info-column">

                                <span>
                                    Último acceso
                                </span>

                                <strong>
                                    {formatDate(
                                        profile?.ultimo_acceso,
                                    )}
                                </strong>

                            </div>

                        </section>

                    </aside>

                </div>

            </main>

        </div>
    );
}