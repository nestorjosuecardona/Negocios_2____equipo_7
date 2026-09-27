import api from './api';

export const getAdminVentas = () =>
    api
        .get('/admin/ventas')
        .then(
            response =>
                response.data,
        );

export const getAdminVenta = (
    id,
) =>
    api
        .get(
            `/admin/ventas/${id}`,
        )
        .then(
            response =>
                response.data,
        );

export const actualizarEstadoVenta = (
    id,
    estado,
) =>
    api
        .patch(
            `/admin/ventas/${id}/estado`,
            {
                estado,
            },
        )
        .then(
            response =>
                response.data,
        );