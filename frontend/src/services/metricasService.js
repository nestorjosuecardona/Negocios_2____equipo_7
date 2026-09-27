import api from './api';
export const getMetricas=()=>api.get('/metricas').then(r=>r.data);
