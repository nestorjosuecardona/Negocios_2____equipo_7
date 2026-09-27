import api from './api';
export const getClientes=(params={})=>api.get('/clientes',{params}).then(r=>r.data);
export const getCliente=(id)=>api.get(`/clientes/${id}`).then(r=>r.data);
export const crearCliente=(data)=>api.post('/clientes',data).then(r=>r.data);
export const actualizarCliente=(id,data)=>api.put(`/clientes/${id}`,data).then(r=>r.data);
export const eliminarCliente=(id)=>api.delete(`/clientes/${id}`);
export const cambiarEtapa=(id,etapa_crm)=>api.put(`/clientes/${id}/etapa`,{etapa_crm}).then(r=>r.data);
export const getInteraccionesCliente=(id)=>api.get(`/clientes/${id}/interacciones`).then(r=>r.data);
