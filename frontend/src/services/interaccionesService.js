import api from './api';
export const getInteracciones=()=>api.get('/interacciones').then(r=>r.data);
export const crearInteraccion=(data)=>api.post('/interacciones',data).then(r=>r.data);
export const getMiActividad=()=>api.get('/actividad/mia').then(r=>r.data);
