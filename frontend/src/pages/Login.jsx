import { useState } from 'react';
import {
Link,
    Navigate,
    useNavigate
} from 'react-router-dom';

import {
    LockKeyhole,
    Mail
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


export default function Login() {
    const {
        login,
        user,
        isAuthenticated,
        checkingSession
    } = useAuth();

    const navigate = useNavigate();

    const [correo, setCorreo] =
        useState('');

    const [password, setPassword] =
        useState('');

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

        if (['VENTAS', 'LOGISTICA'].includes(user?.rol)) {
            return (
                <Navigate
                    to="/erp"
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


    async function submit(event) {
        event.preventDefault();

        setError('');
        setLoading(true);

        try {
            const loggedUser =
                await login(
                    correo,
                    password
                );

            const destination = loggedUser.rol === 'CLIENTE'
                ? '/cliente/inicio'
                : ['VENTAS', 'LOGISTICA'].includes(loggedUser.rol)
                    ? '/erp'
                    : '/dashboard';

            navigate(destination, { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'No fue posible iniciar sesión.'
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
                        Negocios 2
                    </h1>

                    <p>
                        Accesorios para automóviles
                    </p>

                </div>


                <form
                    onSubmit={submit}
                    className="auth-form"
                >

                    <label>

                        Correo electrónico

                        <div className="input-with-icon">

                            <Mail size={18} />

                            <input
                                type="email"
                                value={correo}
                                onChange={
                                    event =>
                                        setCorreo(
                                            event.target.value
                                        )
                                }
                                placeholder="correo@ejemplo.com"
                                autoComplete="email"
                                required
                            />

                        </div>

                    </label>


                    <label>

                        Contraseña

                        <div className="input-with-icon">

                            <LockKeyhole size={18} />

                            <input
                                type="password"
                                value={password}
                                onChange={
                                    event =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                                placeholder="Ingresa tu contraseña"
                                autoComplete="current-password"
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
                                ? 'Ingresando...'
                                : 'Iniciar sesión'
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
                        ¿Aún no tienes cuenta?{' '}
                    </span>

                    <Link to="/registro">
                        Crear cuenta
                    </Link>
                </div>

            </div>

        </div>
    );
}
