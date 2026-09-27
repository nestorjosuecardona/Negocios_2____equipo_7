import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({
    children,
    allowedRoles = []
}) {
    const {
        user,
        isAuthenticated,
        checkingSession
    } = useAuth();

    if (checkingSession) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user?.rol)
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}