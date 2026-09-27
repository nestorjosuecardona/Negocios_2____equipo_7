import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';

import {
    loginRequest,
    registerRequest,
    meRequest
} from '../services/authService';


const AuthContext =
    createContext(null);


export function AuthProvider({
    children
}) {
    const [user, setUser] =
        useState(null);

    const [checkingSession, setCheckingSession] =
        useState(true);


    function saveSession(data) {
        localStorage.setItem(
            'n2_token',
            data.token
        );

        localStorage.setItem(
            'n2_user',
            JSON.stringify(data.user)
        );

        setUser(data.user);

        window.dispatchEvent(
            new Event(
                'n2:session-changed',
            ),
        );
    }


    function clearSession() {
        localStorage.removeItem(
            'n2_token'
        );

        localStorage.removeItem(
            'n2_user'
        );

        setUser(null);

        window.dispatchEvent(
            new Event(
                'n2:session-changed',
            ),
        );
    }


    async function login(
        correo,
        password
    ) {
        const data =
            await loginRequest(
                correo,
                password
            );

        saveSession(data);

        return data.user;
    }


    async function register(data) {
        const response =
            await registerRequest(data);

        saveSession(response);

        return response.user;
    }


    function logout() {
        clearSession();
    }

    function updateUser(changes) {
        setUser(
            current => {
                if (!current) {
                    return current;
                }

                const updated = {
                    ...current,
                    ...changes
                };

                localStorage.setItem(
                    'n2_user',
                    JSON.stringify(
                        updated
                    )
                );

                return updated;
            }
        );
    }

    useEffect(() => {
        async function validateSession() {
            const token =
                localStorage.getItem(
                    'n2_token'
                );

            if (!token) {
                setCheckingSession(false);
                return;
            }

            try {
                const response =
                    await meRequest();

                setUser(
                    response.user
                );

                localStorage.setItem(
                    'n2_user',
                    JSON.stringify(
                        response.user
                    )
                );

                window.dispatchEvent(
                    new Event(
                        'n2:session-changed'
                    )
                );

            } catch {
                clearSession();

            } finally {
                setCheckingSession(false);
            }
        }

        function handleUnauthorized() {
            clearSession();
        }

        validateSession();

        window.addEventListener(
            'n2:unauthorized',
            handleUnauthorized
        );

        return () => {
            window.removeEventListener(
                'n2:unauthorized',
                handleUnauthorized
            );
        };
    }, []);


    const value =
        useMemo(
            () => ({
                user,

                login,
                register,
                logout,
                updateUser,

                isAuthenticated:
                    Boolean(user),

                role:
                    user?.rol || null,

                checkingSession
            }),
            [
                user,
                checkingSession
            ]
        );


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(
        AuthContext
    );
}