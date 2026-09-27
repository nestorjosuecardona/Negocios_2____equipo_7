import api from './api';

export const getUsuarios = () =>
    api
        .get(
            '/admin/usuarios',
        )
        .then(
            response =>
                response.data,
        );

export const crearAdministrador = (
    data,
) =>
    api
        .post(
            '/admin/usuarios/administradores',
            data,
        )
        .then(
            response =>
                response.data,
        );

export const actualizarUsuario = (
    id,
    data,
) =>
    api
        .put(
            `/admin/usuarios/${id}`,
            data,
        )
        .then(
            response =>
                response.data,
        );

export const actualizarEstadoUsuario = (
    id,
    estado,
) =>
    api
        .patch(
            `/admin/usuarios/${id}/estado`,
            {
                estado,
            },
        )
        .then(
            response =>
                response.data,
        );