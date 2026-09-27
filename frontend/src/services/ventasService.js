import api from './api';

export const crearVenta = (
    data,
) =>
    api
        .post(
            '/ventas',
            data,
        )
        .then(
            response =>
                response.data,
        );

export const getMisVentas = () =>
    api
        .get(
            '/ventas/mias',
        )
        .then(
            response =>
                response.data,
        );

export const getMiVenta = (
    id,
) =>
    api
        .get(
            `/ventas/mias/${id}`,
        )
        .then(
            response =>
                response.data,
        );