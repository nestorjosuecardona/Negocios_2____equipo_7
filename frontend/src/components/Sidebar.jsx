import {
    BarChart3,
    Boxes,
    ClipboardList,
    Factory,
    Gauge,
    History,
    Package,
    PanelsTopLeft,
    ShieldCheck,
    Truck,
    UserCog,
    Users,
    X
} from 'lucide-react';

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const links = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        icon: Gauge
    },

    {
        section: 'CRM'
    },

    {
        to: '/clientes',
        label: 'Clientes',
        icon: Users
    },

    {
        to: '/interacciones',
        label: 'Interacciones',
        icon: History
    },

    {
        to: '/mi-actividad',
        label: 'Mi actividad',
        icon: ClipboardList
    },

    {
        to: '/reportes',
        label: 'Reportes',
        icon: BarChart3
    },

    {
        section: 'SCM'
    },

    {
        to: '/scm',
        label: 'Resumen SCM',
        icon: PanelsTopLeft
    },

    {
        to: '/scm/proveedores',
        label: 'Proveedores',
        icon: Truck
    },

    {
        to: '/scm/productos',
        label: 'Productos',
        icon: Package
    },

    {
        to: '/scm/inventario',
        label: 'Inventario',
        icon: Boxes
    },

    {
        to: '/scm/ordenes',
        label: 'Órdenes',
        icon: Factory
    },

    {
        section: 'ADMINISTRACIÓN',
        superAdminOnly: true
    },

    {
        to: '/administracion/usuarios',
        label: 'Usuarios',
        icon: UserCog,
        superAdminOnly: true
    },

    {
        to: '/administracion/seguridad',
        label: 'Seguridad',
        icon: ShieldCheck,
        superAdminOnly: true
    },

    {
        to: '/scm/reportes',
        label: 'Reportes SCM',
        icon: BarChart3,
    }
];


export default function Sidebar({
    open,
    onClose
}) {
    const { user } = useAuth();

    const visibleLinks = links.filter(
        item =>
            !item.superAdminOnly ||
            user?.rol === 'SUPER_ADMIN'
    );

    return (
        <aside
            className={
                `sidebar ${open
                    ? 'sidebar-open'
                    : ''
                }`
            }
        >

            <div className="brand">

                <div className="brand-mark">
                    N2
                </div>

                <div>
                    <strong>
                        Negocios 2
                    </strong>

                    <small>
                        CRM · SCM
                    </small>
                </div>

                <button
                    className="icon-button sidebar-close"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>

            </div>


            <nav className="nav-list">

                {visibleLinks.map(
                    (item, index) => {

                        if (item.section) {
                            return (
                                <div
                                    className="nav-section"
                                    key={`section-${index}`}
                                >
                                    {item.section}
                                </div>
                            );
                        }

                        const Icon =
                            item.icon;

                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/scm'}
                                onClick={onClose}
                                className={
                                    ({ isActive }) =>
                                        `nav-item ${isActive
                                            ? 'active'
                                            : ''
                                        }`
                                }
                            >
                                <Icon size={18} />

                                <span>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    }
                )}

            </nav>


            <div className="sidebar-footer">

                <span className="status-dot" />

                Sistema conectado

            </div>

        </aside>
    );
}