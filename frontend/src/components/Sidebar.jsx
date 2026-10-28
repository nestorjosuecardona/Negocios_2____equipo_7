import {
    BarChart3,
    Boxes,
    ClipboardList,
    Factory,
    Gauge,
    House,
    History,
    Package,
    PanelsTopLeft,
    ShieldCheck,
    ShoppingCart,
    Truck,
    UserCog,
    Users,
    X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
const ERP_ROLES = [...ADMIN_ROLES, 'VENTAS', 'LOGISTICA'];
const SCM_ROLES = [...ADMIN_ROLES, 'LOGISTICA'];

const links = [
    { to: '/inicio', label: 'Inicio general', icon: House, roles: ADMIN_ROLES },

    { section: 'CRM', roles: ADMIN_ROLES },
    { to: '/dashboard', label: 'Dashboard CRM', icon: Gauge, roles: ADMIN_ROLES },
    { to: '/clientes', label: 'Clientes', icon: Users, roles: ADMIN_ROLES },
    { to: '/interacciones', label: 'Interacciones', icon: History, roles: ADMIN_ROLES },
    { to: '/mi-actividad', label: 'Mi actividad', icon: ClipboardList, roles: ADMIN_ROLES },
    { to: '/reportes', label: 'Reportes CRM', icon: BarChart3, roles: ADMIN_ROLES },

    { section: 'SCM', roles: SCM_ROLES },
    { to: '/scm', label: 'Resumen SCM', icon: PanelsTopLeft, roles: SCM_ROLES },
    { to: '/scm/proveedores', label: 'Proveedores', icon: Truck, roles: SCM_ROLES },
    { to: '/scm/productos', label: 'Productos', icon: Package, roles: SCM_ROLES },
    { to: '/scm/inventario', label: 'Inventario', icon: Boxes, roles: SCM_ROLES },
    { to: '/scm/ordenes', label: 'Reposiciones', icon: Factory, roles: SCM_ROLES },
    { to: '/scm/reportes', label: 'Reportes SCM', icon: BarChart3, roles: SCM_ROLES },

    { section: 'ERP', roles: ERP_ROLES },
    { to: '/erp', label: 'Panel empresarial', icon: Gauge, roles: ERP_ROLES },
    { to: '/erp/ordenes', label: 'Órdenes ERP', icon: ShoppingCart, roles: ERP_ROLES },
    { to: '/erp/nivel', label: 'Nivel ERP', icon: PanelsTopLeft, roles: ADMIN_ROLES },

    { section: 'ADMINISTRACIÓN', roles: ADMIN_ROLES },
    { to: '/administracion/usuarios', label: 'Usuarios', icon: UserCog, roles: ADMIN_ROLES },
    { to: '/administracion/seguridad', label: 'Seguridad', icon: ShieldCheck, roles: ADMIN_ROLES },
];

export default function Sidebar({ open, onClose }) {
    const { user } = useAuth();
    const visibleLinks = links.filter(item => !item.roles || item.roles.includes(user?.rol));

    return (
        <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
            <div className="brand">
                <div className="brand-mark">N2</div>
                <div>
                    <strong>Negocios 2</strong>
                    <small>CRM · SCM · ERP</small>
                </div>
                <button className="icon-button sidebar-close" onClick={onClose} aria-label="Cerrar menú"><X size={20} /></button>
            </div>

            <nav className="nav-list">
                {visibleLinks.map((item, index) => {
                    if (item.section) {
                        return <div className="nav-section" key={`section-${index}`}>{item.section}</div>;
                    }
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={['/scm', '/erp'].includes(item.to)}
                            onClick={onClose}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer"><span className="status-dot" />Sistema conectado</div>
        </aside>
    );
}
