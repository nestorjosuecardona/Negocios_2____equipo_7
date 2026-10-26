import api from './api';

export const getErpMetricas = () =>
    api.get('/erp/metricas').then(response => response.data);

export const getCatalogoOrdenesErp = () =>
    api.get('/erp/catalogo').then(response => response.data);

export const getOrdenesErp = (params = {}) =>
    api.get('/erp/ordenes', { params }).then(response => response.data);

export const getOrdenErp = id =>
    api.get(`/erp/ordenes/${id}`).then(response => response.data);

export const crearOrdenErp = data =>
    api.post('/erp/ordenes', data).then(response => response.data);

export const procesarOrdenErp = id =>
    api.post('/erp/ordenes/procesar', { id_orden: id }).then(response => response.data);

export const cambiarEstadoOrdenErp = (id, estado) =>
    api.put(`/erp/ordenes/${id}/estado`, { estado }).then(response => response.data);

export const getEstadoErp = () =>
    api.get('/erp/estado').then(response => response.data);

export const actualizarNivelErp = nivelErp =>
    api.put('/erp/estado', { nivel_erp: nivelErp }).then(response => response.data);
