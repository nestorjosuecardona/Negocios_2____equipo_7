import { useEffect, useState } from 'react';
import { CheckCircle2, Gauge, LockKeyhole, Save } from 'lucide-react';
import Badge from '../../components/Badge';
import MainLayout from '../../components/MainLayout';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { actualizarNivelErp, getEstadoErp } from '../../services/erpService';

const levels = ['Básico', 'Integrado', 'Automatizado', 'Optimizado'];

export default function NivelErp() {
    const { user } = useAuth();
    const canEdit = ['SUPER_ADMIN', 'ADMIN'].includes(user?.rol);
    const [state, setState] = useState(null);
    const [selected, setSelected] = useState('Básico');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        getEstadoErp()
            .then(result => { setState(result); setSelected(result.nivel_erp); })
            .catch(err => setError(err.response?.data?.message || 'No fue posible cargar el nivel ERP.'))
            .finally(() => setLoading(false));
    }, []);

    async function save(event) {
        event.preventDefault();
        try {
            setSaving(true);
            setError('');
            const result = await actualizarNivelErp(selected);
            setState(result);
            setNotice('Nivel de implementación actualizado.');
        } catch (err) {
            setError(err.response?.data?.message || 'No fue posible actualizar el nivel ERP.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <MainLayout>
            <PageHeader title="Nivel ERP" subtitle="Evalúa el avance de integración y automatización de la empresa." />
            {error && <div className="alert alert-error">{error}</div>}
            {notice && <div className="alert alert-success">{notice}</div>}

            <section className="panel erp-maturity-panel">
                <div className="erp-maturity-heading">
                    <div className="erp-maturity-icon"><Gauge size={25} /></div>
                    <div><span>Nivel actual</span><h2>{loading ? 'Cargando…' : state?.nivel_erp}</h2><p>{state?.descripcion}</p></div>
                    <Badge tone="info">{state?.progreso || 0}%</Badge>
                </div>
                <div className="erp-level-progress erp-maturity-progress">
                    <div><span style={{ width: `${state?.progreso || 0}%` }} /></div>
                    <small>Avance estimado del ERP</small>
                </div>

                <div className="erp-maturity-levels">
                    {levels.map((level, index) => (
                        <div className={`erp-maturity-level ${state?.nivel_erp === level ? 'active' : ''}`} key={level}>
                            <span className="erp-maturity-step">{index + 1}</span>
                            <strong>{level}</strong>
                            <small>{[
                                'Datos centralizados de CRM y SCM.',
                                'Clientes, productos y órdenes integrados.',
                                'Órdenes actualizan existencias e historial automáticamente.',
                                'Indicadores integrados para mejora operativa.',
                            ][index]}</small>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel erp-checklist-panel">
                <div className="panel-header"><div><h2>Checklist de integración</h2><p>Capacidades asociadas al nivel reportado.</p></div></div>
                <div className="erp-checklist">
                    {state?.checklist?.map(item => (
                        <div className="erp-checklist-item" key={item.key}>
                            <CheckCircle2 className={item.completed ? 'complete' : ''} size={18} />
                            <span>{item.label}</span>
                            <Badge tone={item.completed ? 'success' : 'neutral'}>{item.completed ? 'Integrado' : 'Pendiente'}</Badge>
                        </div>
                    ))}
                </div>
            </section>

            <form className="panel erp-level-form" onSubmit={save}>
                <div><h2>Actualizar nivel</h2><p>El cambio se guarda con el usuario y la fecha de actualización.</p></div>
                {canEdit ? <>
                    <label>Nivel de implementación
                        <select value={selected} onChange={event => setSelected(event.target.value)} disabled={loading || saving}>
                            {levels.map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={loading || saving || selected === state?.nivel_erp}><Save size={16} /> {saving ? 'Guardando…' : 'Guardar nivel'}</button>
                </> : <p className="erp-readonly-note"><LockKeyhole size={16} /> Solo el equipo administrador puede cambiar este nivel.</p>}
                {state?.usuario_nombre && <small className="erp-updated-by">Última actualización por {state.usuario_nombre} · {new Date(state.fecha_actualizacion).toLocaleString('es-MX')}</small>}
            </form>
        </MainLayout>
    );
}
