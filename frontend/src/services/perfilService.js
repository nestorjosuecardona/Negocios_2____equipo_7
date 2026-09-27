import api from './api';

export const getPerfil = () =>
    api
        .get('/perfil')
        .then(
            response =>
                response.data,
        );

export const actualizarPerfil = (
    data,
) =>
    api
        .put(
            '/perfil',
            data,
        )
        .then(
            response =>
                response.data,
        );