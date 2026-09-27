import { useState } from 'react';
import {
    Link,
    Navigate,
    useNavigate
} from 'react-router-dom';

import {
    User,
    Mail,
    Phone,
    LockKeyhole
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


export default function Registro() {
    const {
        register,
        user,
        isAuthenticated,
        checkingSession
    } = useAuth();

    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        password: '',
        confirmarPassword: ''
    });

    const [error, setError] =
        useState('');

    const [loading, setLoading] =
        useState(false);


    if (checkingSession) {
        return null;
    }


    if (isAuthenticated) {
        if (user?.rol === 'CLIENTE') {
            return (
                <Navigate
                    to="/cliente/inicio"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    function handleChange(event) {
        const {
            name,
            value
        } = event.target;

        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }


    async function handleSubmit(event) {
        event.preventDefault();

        setError('');

        if (
            form.password !==
            form.confirmarPassword
        ) {
            setError(
                'Las contraseñas no coinciden.'
            );

            return;
        }

        if (form.password.length < 8) {
            setError(
                'La contraseña debe tener al menos 8 caracteres.'
            );

            return;
        }

        setLoading(true);

        try {
            const newUser =
                await register({
                    nombre:
                        form.nombre.trim(),

                    correo:
                        form.correo
                            .trim()
                            .toLowerCase(),

                    telefono:
                        form.telefono.trim(),

                    password:
                        form.password
                });

            if (
                newUser.rol ===
                'CLIENTE'
            ) {
                navigate(
                    '/cliente/inicio',
                    {
                        replace: true
                    }
                );
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible crear la cuenta.'
            );

        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="auth-page">

            <div className="auth-decoration auth-decoration-one" />

            <div className="auth-card">

                <div className="auth-brand">

                    <div className="brand-mark brand-mark-large">
                        N2
                    </div>

                    <h1>
                        Crear cuenta
                    </h1>

                    <p>
                        Regístrate para comenzar
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        Nombre completo

                        <div className="input-with-icon">

                            <User size={18} />

                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                autoComplete="name"
                                required
                            />

                        </div>
                    </label>


                    <label>
                        Correo electrónico

                        <div className="input-with-icon">

                            <Mail size={18} />

                            <input
                                type="email"
                                name="correo"
                                value={form.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                autoComplete="email"
                                required
                            />

                        </div>
                    </label>


                    <label>
                        Teléfono

                        <div className="input-with-icon">

                            <Phone size={18} />

                            <input
                                type="tel"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                placeholder="449 000 0000"
                                autoComplete="tel"
                            />

                        </div>
                    </label>


                    <label>
                        Contraseña

                        <div className="input-with-icon">

                            <LockKeyhole size={18} />

                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                        </div>
                    </label>


                    <label>
                        Confirmar contraseña

                        <div className="input-with-icon">

                            <LockKeyhole size={18} />

                            <input
                                type="password"
                                name="confirmarPassword"
                                value={
                                    form.confirmarPassword
                                }
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                        </div>
                    </label>


                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {
                            loading
                                ? 'Creando cuenta...'
                                : 'Crear cuenta'
                        }
                    </button>

                </form>


                <div
                    style={{
                        marginTop: '22px',
                        textAlign: 'center'
                    }}
                >
                    <span>
                        ¿Ya tienes una cuenta?{' '}
                    </span>

                    <Link to="/login">
                        Iniciar sesión
                    </Link>
                </div>

            </div>

        </div>
    );
}