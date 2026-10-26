import {
    Route,
    Routes,
} from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Registro from './pages/Registro';
import NotFound from './pages/NotFound';

import Landing from './pages/cliente/Landing';
import Catalogo from './pages/cliente/Catalogo';
import ProductoDetalle from './pages/cliente/ProductoDetalle';

import Dashboard from './pages/crm/Dashboard';
import Clientes from './pages/crm/Clientes';
import ClienteDetalle from './pages/crm/ClienteDetalle';
import Interacciones from './pages/crm/Interacciones';
import MiActividad from './pages/crm/MiActividad';
import Reportes from './pages/crm/Reportes';

import ScmDashboard from './pages/scm/ScmDashboard';
import Proveedores from './pages/scm/Proveedores';
import Productos from './pages/scm/Productos';
import Inventario from './pages/scm/Inventario';
import Ordenes from './pages/scm/Ordenes';
import ScmReportes from './pages/scm/ScmReportes';

import InicioCliente from './pages/cliente/InicioCliente';
import Checkout from './pages/cliente/Checkout';
import MisPedidos from './pages/cliente/MisPedidos';
import MiPerfil from './pages/cliente/MiPerfil';

import Usuarios from './pages/administracion/Usuarios';

import Carrito from './pages/cliente/Carrito';

import Seguridad from './pages/administracion/Seguridad';
import Pedidos from './pages/administracion/Pedidos';
import ErpDashboard from './pages/erp/ErpDashboard';
import ErpOrders from './pages/erp/Ordenes';
import ErpLevel from './pages/erp/NivelErp';

import {
    CartProvider,
} from './context/CartContext';

const ADMIN_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
];
const ERP_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
    'VENTAS',
    'LOGISTICA',
];

const SCM_ROLES = [
    'SUPER_ADMIN',
    'ADMIN',
    'LOGISTICA',
];

function AdminRoute({
    children,
}) {
    return (
        <ProtectedRoute
            allowedRoles={ADMIN_ROLES}
        >
            {children}
        </ProtectedRoute>
    );
}

function SuperAdminRoute({
    children,
}) {
    return (
        <ProtectedRoute
            allowedRoles={[
                'SUPER_ADMIN',
            ]}
        >
            {children}
        </ProtectedRoute>
    );
}

function ClientRoute({
    children,
}) {
    return (
        <ProtectedRoute
            allowedRoles={[
                'CLIENTE',
            ]}
        >
            {children}
        </ProtectedRoute>
    );
}

function ErpRoute({ children }) {
    return (
        <ProtectedRoute allowedRoles={ERP_ROLES}>
            {children}
        </ProtectedRoute>
    );
}

function ScmRoute({ children }) {
    return (
        <ProtectedRoute allowedRoles={SCM_ROLES}>
            {children}
        </ProtectedRoute>
    );
}

export default function App() {
    return (
        <CartProvider>
            <Routes>

                <Route
                    path="/"
                    element={
                        <Landing />
                    }
                />

                <Route
                    path="/catalogo"
                    element={
                        <Catalogo />
                    }
                />

                <Route
                    path="/producto/:id"
                    element={
                        <ProductoDetalle />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/registro"
                    element={
                        <Registro />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <AdminRoute>
                            <Dashboard />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/clientes"
                    element={
                        <AdminRoute>
                            <Clientes />
                        </AdminRoute>
                    }
                    />

                    <Route
                        path="/cliente/carrito"
                        element={
                          <ClientRoute>
                           <Carrito />
                        </ClientRoute>
                    }
                />

                <Route
                    path="/clientes/:id"
                    element={
                        <AdminRoute>
                            <ClienteDetalle />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/interacciones"
                    element={
                        <AdminRoute>
                            <Interacciones />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/mi-actividad"
                    element={
                        <AdminRoute>
                            <MiActividad />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/reportes"
                    element={
                        <AdminRoute>
                            <Reportes />
                        </AdminRoute>
                    }
                />

                <Route
                    path="/erp"
                    element={<ErpRoute><ErpDashboard /></ErpRoute>}
                />

                <Route
                    path="/erp/ordenes"
                    element={<ErpRoute><ErpOrders /></ErpRoute>}
                />

                <Route
                    path="/erp/nivel"
                    element={<AdminRoute><ErpLevel /></AdminRoute>}
                />

                <Route
                    path="/scm"
                    element={
                        <ScmRoute>
                            <ScmDashboard />
                        </ScmRoute>
                    }
                />

                <Route
                    path="/scm/proveedores"
                    element={
                        <ScmRoute>
                            <Proveedores />
                        </ScmRoute>
                    }
                />

                <Route
                    path="/scm/productos"
                    element={
                        <ScmRoute>
                            <Productos />
                        </ScmRoute>
                    }
                />

                <Route
                    path="/scm/inventario"
                    element={
                        <ScmRoute>
                            <Inventario />
                        </ScmRoute>
                    }
                />

                <Route
                    path="/scm/ordenes"
                    element={
                        <ScmRoute>
                            <Ordenes />
                        </ScmRoute>
                    }
                />

                <Route
                    path="/scm/reportes"
                    element={
                        <ScmRoute>
                            <ScmReportes />
                        </ScmRoute>
                    }
                />

                <Route
                    path="/administracion/usuarios"
                    element={
                        <SuperAdminRoute>
                            <Usuarios />
                        </SuperAdminRoute>
                    }
                />

                <Route
                    path="/cliente/inicio"
                    element={
                        <ClientRoute>
                            <InicioCliente />
                        </ClientRoute>
                    }
                />

                <Route
                    path="/cliente/checkout"
                    element={
                        <ClientRoute>
                            <Checkout />
                        </ClientRoute>
                    }
                />

                <Route
                    path="/cliente/pedidos"
                    element={
                        <ClientRoute>
                            <MisPedidos />
                        </ClientRoute>
                    }
                />

                <Route
                    path="/cliente/perfil"
                    element={
                        <ClientRoute>
                            <MiPerfil />
                        </ClientRoute>
                    }
                />

                <Route
                    path="*"
                    element={
                        <NotFound />
                    }

                />
                <Route
                    path="/administracion/seguridad"
                    element={
                        <SuperAdminRoute>
                            <Seguridad />
                        </SuperAdminRoute>
                    }
                />

                <Route
                    path="/administracion/pedidos"
                    element={
                        <AdminRoute>
                            <Pedidos />
                        </AdminRoute>
                    }
                />

            </Routes>
        </CartProvider> 
    );
}
